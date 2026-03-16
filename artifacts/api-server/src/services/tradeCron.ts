import { db } from "@workspace/db";
import { accountsTable, tradesTable } from "@workspace/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

const INR_PER_USD = 83.45;

interface Instrument {
  instrument: string;
  market: string;
  basePrice: number;
  lotSize: number;
  quoteToInr: number;
  isJpy?: boolean;
  isCrypto?: boolean;
}

const INSTRUMENTS: Instrument[] = [
  // ---- Forex Majors ----
  { instrument: "EUR/USD", market: "Forex", basePrice: 1.0923, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "GBP/USD", market: "Forex", basePrice: 1.2725, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/JPY", market: "Forex", basePrice: 155.20, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  { instrument: "AUD/USD", market: "Forex", basePrice: 0.6445, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CAD", market: "Forex", basePrice: 1.3618, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CHF", market: "Forex", basePrice: 0.9012, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "NZD/USD", market: "Forex", basePrice: 0.5950, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "EUR/GBP", market: "Forex", basePrice: 0.8578, lotSize: 100_000, quoteToInr: 107.5 },
  { instrument: "EUR/JPY", market: "Forex", basePrice: 169.42, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  { instrument: "GBP/JPY", market: "Forex", basePrice: 197.10, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  // ---- Crypto ----
  { instrument: "BTC/USDT", market: "Crypto", basePrice: 65_240,  lotSize: 0.01, quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "ETH/USDT", market: "Crypto", basePrice:  3_215,  lotSize: 0.10, quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "SOL/USDT", market: "Crypto", basePrice:    158,  lotSize: 1.00, quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "BNB/USDT", market: "Crypto", basePrice:    582,  lotSize: 0.10, quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "XRP/USDT", market: "Crypto", basePrice:  0.526,  lotSize: 500,  quoteToInr: INR_PER_USD, isCrypto: true },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTodayStartIST(): Date {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1_000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  istNow.setUTCHours(0, 0, 0, 0);
  return new Date(istNow.getTime() - istOffsetMs);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

/**
 * Compute a realistic exit price.
 *
 * For WINS:
 *   BUY  → exit > entry  (price moved in our favour)
 *   SELL → exit < entry
 *
 * For LOSSES (stop-loss hit):
 *   BUY  → exit < entry  (price fell, stop triggered)
 *   SELL → exit > entry  (price rose, stop triggered)
 *
 * Forex: move expressed in pips (win 8–55 pips, stop-loss 10–30 pips)
 * Crypto: move expressed as % (win 0.3–3%, stop 0.3–1.5%)
 */
function calcExitPrice(
  instr: Instrument,
  entryPrice: number,
  direction: "buy" | "sell",
  isLoss: boolean,
): number {
  if (instr.isCrypto) {
    const pct = isLoss
      ? randomBetween(0.3, 1.5)   // stop-loss: 0.3–1.5% against
      : randomBetween(0.5, 3.0);  // take-profit: 0.5–3% in favour
    const sign = (direction === "buy") === !isLoss ? 1 : -1;
    return entryPrice * (1 + sign * pct / 100);
  }

  const pipSize = instr.isJpy ? 0.01 : 0.0001;
  const pips = isLoss
    ? randomBetween(10, 30)  // stop-loss hit: 10–30 pips against
    : randomBetween(8, 55);  // take-profit: 8–55 pips in favour

  // Buy win / Sell loss → exit above entry; Sell win / Buy loss → exit below entry
  const sign = (direction === "buy") === !isLoss ? 1 : -1;
  return entryPrice + sign * pips * pipSize;
}

function formatPrice(instr: Instrument, price: number): string {
  if (instr.isCrypto) {
    if (price > 10_000) return price.toFixed(2);
    if (price > 1)      return price.toFixed(4);
    return price.toFixed(5);
  }
  if (instr.isJpy) return price.toFixed(3);
  return price.toFixed(5);
}

// ─── 2-Year Purge ────────────────────────────────────────────────────────────

async function purgeOldTrades(): Promise<void> {
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1_000);
  await db.delete(tradesTable).where(lt(tradesTable.closedAt, twoYearsAgo));
  console.log("[TradeCron] Old trades (>2 years) purged.");
}

// ─── Trade Plan Builder ───────────────────────────────────────────────────────
/**
 * Build a list of trade profit values whose sum equals `runProfit`.
 *
 * Target win rate: 60–70% wins in this batch.
 * Example (runProfit = 400, 4 trades, 1 loss):
 *   losses: [ -80 ]
 *   wins:   [ 180, 140, 160 ]   → net = 480 - 80 = 400  ✓
 *
 * The losses always appear at shuffled positions EXCEPT the last slot, which
 * is always a win sized to close the gap to `runProfit`.
 */
function buildTradePlan(runProfit: number): number[] {
  // 3–5 trades per cycle
  const tradeCount = randInt(3, 5);

  // 30–40% loss rate, at least 1 win always
  const rawLossCount = Math.round(tradeCount * randomBetween(0.30, 0.40));
  const lossCount = Math.max(0, Math.min(rawLossCount, tradeCount - 1));
  const winCount  = tradeCount - lossCount;

  // Each loss is independently sized between 8–20% of runProfit
  const lossAmounts = Array.from({ length: lossCount }, () =>
    runProfit * randomBetween(0.08, 0.20)
  );
  const totalLoss = lossAmounts.reduce((s, v) => s + v, 0);

  // Winners must cover losses + deliver runProfit net
  const totalWinBudget = runProfit + totalLoss;

  // Distribute win budget across winCount − 1 "free" wins; last win closes the gap
  const profits: number[] = [];
  let winBudgetRemaining = totalWinBudget;

  for (let w = 0; w < winCount - 1; w++) {
    const share = (totalWinBudget / winCount) * randomBetween(0.75, 1.25);
    profits.push(share);
    winBudgetRemaining -= share;
  }
  // Last "gap-closing" win — ensure it's at least 1 rupee
  profits.push(Math.max(1, winBudgetRemaining));

  // Mix in losses (negative values)
  lossAmounts.forEach(l => profits.push(-l));

  // Shuffle so losses don't all appear at the end, but reserve the last slot
  // for the gap-closing win (it's already the first element we pushed)
  const gapCloser = profits.shift()!; // take it out
  // Fisher-Yates shuffle on the rest
  for (let i = profits.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [profits[i], profits[j]] = [profits[j], profits[i]];
  }
  profits.push(gapCloser); // always last → always a win

  return profits;
}

// ─── Main execution ──────────────────────────────────────────────────────────

async function executeAutomatedTrades(): Promise<void> {
  try {
    console.log("[TradeCron] Running automated trade execution...");
    await purgeOldTrades();

    const allAccounts = await db.select().from(accountsTable);
    const eligible = allAccounts.filter(
      acc => acc.assignedStrategyId !== null && parseFloat(acc.totalBalance as string) > 0
    );

    console.log(`[TradeCron] ${eligible.length} eligible account(s) found.`);
    const todayStart = getTodayStartIST();

    for (const account of eligible) {
      try {
        let currentBalance = parseFloat(account.totalBalance as string);
        const dailyGrowthPct = account.dailyGrowthTarget
          ? parseFloat(account.dailyGrowthTarget as string)
          : 4.0;

        const dailyTargetAmount = currentBalance * (dailyGrowthPct / 100);

        const todayTrades = await db
          .select()
          .from(tradesTable)
          .where(and(eq(tradesTable.userId, account.userId), gte(tradesTable.openedAt, todayStart)));

        const todayAccumulatedNet = todayTrades.reduce(
          (s, t) => s + (t.profit ? parseFloat(t.profit as string) : 0), 0
        );

        if (todayAccumulatedNet >= dailyTargetAmount) {
          console.log(
            `[TradeCron] User ${account.userId}: daily target met ` +
            `(₹${todayAccumulatedNet.toFixed(2)} >= ₹${dailyTargetAmount.toFixed(2)})`
          );
          continue;
        }

        const remaining = dailyTargetAmount - todayAccumulatedNet;
        // Contribute 28–45% of the remaining gap each run
        const runProfit = remaining * randomBetween(0.28, 0.45);

        // Build the trade plan: list of signed P&L values summing to runProfit
        const tradeProfits = buildTradePlan(runProfit);
        const tradeCount  = tradeProfits.length;
        const lossCount   = tradeProfits.filter(p => p < 0).length;

        // ── Insert each trade and update balance immediately ──────────────
        let netCommitted = 0;
        const timeRef = Date.now();

        // Spread trades over the past 1–6 hours so they look organic
        const spreadMs = randomBetween(1 * 60 * 60_000, 6 * 60 * 60_000);

        for (let i = 0; i < tradeCount; i++) {
          const tradeProfit = tradeProfits[i];
          const isLoss = tradeProfit < 0;

          const instr = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
          const direction: "buy" | "sell" = Math.random() > 0.4 ? "buy" : "sell";

          const priceVariance = 1 + randomBetween(-0.004, 0.004);
          const entryPrice    = instr.basePrice * priceVariance;
          const exitPrice     = calcExitPrice(instr, entryPrice, direction, isLoss);

          const notionalInr   = entryPrice * instr.lotSize * instr.quoteToInr;
          const profitPercent = (tradeProfit / notionalInr) * 100;

          // Duration: losses tend to be shorter (quick stop hit), wins can hold longer
          const durationMs = isLoss
            ? randomBetween(2 * 60_000, 25 * 60_000)   // 2–25 min for stop-loss
            : randomBetween(15 * 60_000, 4 * 60 * 60_000); // 15 min–4 hr for take-profit

          // Position in the day: trades spread backwards from now
          const tradeOffsetMs = (spreadMs / tradeCount) * (tradeCount - 1 - i);
          const openedAt  = new Date(timeRef - tradeOffsetMs - durationMs);
          const closedAt  = new Date(timeRef - tradeOffsetMs);

          // Insert trade record
          await db.insert(tradesTable).values({
            userId:       account.userId,
            strategyId:   account.assignedStrategyId,
            market:       instr.market,
            instrument:   instr.instrument,
            direction,
            entryPrice:   formatPrice(instr, entryPrice),
            exitPrice:    formatPrice(instr, exitPrice),
            lotSize:      instr.lotSize.toFixed(2),
            profit:       tradeProfit.toFixed(2),
            profitPercent: profitPercent.toFixed(4),
            status:       "closed",
            openedAt,
            closedAt,
          });

          // ── Update balance immediately after each trade ──────────────────
          // This is what makes the "live balance" fluctuate on the dashboard
          currentBalance += tradeProfit;
          const currentTotalProfit =
            parseFloat(account.totalProfit as string) + netCommitted + tradeProfit;

          await db
            .update(accountsTable)
            .set({
              totalBalance: Math.max(0, currentBalance).toFixed(2),
              totalProfit:  currentTotalProfit.toFixed(2),
              updatedAt:    new Date(),
            })
            .where(eq(accountsTable.id, account.id));

          netCommitted += tradeProfit;
        }

        const winsInRun   = tradeProfits.filter(p => p > 0).length;
        const grossWin    = tradeProfits.filter(p => p > 0).reduce((a, b) => a + b, 0);
        const grossLoss   = Math.abs(tradeProfits.filter(p => p < 0).reduce((a, b) => a + b, 0));

        console.log(
          `[TradeCron] User ${account.userId}: ${tradeCount} trade(s) ` +
          `[${winsInRun}W / ${lossCount}L] ` +
          `Gross +₹${grossWin.toFixed(2)} − ₹${grossLoss.toFixed(2)} = Net +₹${runProfit.toFixed(2)} | ` +
          `Today total: ₹${(todayAccumulatedNet + runProfit).toFixed(2)} / ₹${dailyTargetAmount.toFixed(2)} target`
        );
      } catch (err) {
        console.error(`[TradeCron] Error on account ${account.id}:`, err);
      }
    }

    console.log("[TradeCron] Cycle complete.");
  } catch (err) {
    console.error("[TradeCron] Fatal error:", err);
  }
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

function scheduleNextRun(): void {
  const delay = randomBetween(2 * 60 * 60_000, 4 * 60 * 60_000);
  console.log(`[TradeCron] Next run in ${(delay / 3_600_000).toFixed(2)} hours.`);
  setTimeout(async () => {
    await executeAutomatedTrades();
    scheduleNextRun();
  }, delay);
}

export function startTradeCron(): void {
  console.log("[TradeCron] Trade automation service initialised. First run in 45s.");
  setTimeout(async () => {
    await executeAutomatedTrades();
    scheduleNextRun();
  }, 45_000);
}
