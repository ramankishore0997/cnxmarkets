import { db } from "@workspace/db";
import { accountsTable, tradesTable } from "@workspace/db/schema";
import { eq, and, gte, lt, isNull } from "drizzle-orm";

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
  { instrument: "EUR/USD",  market: "Forex",  basePrice: 1.0923,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "GBP/USD",  market: "Forex",  basePrice: 1.2725,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/JPY",  market: "Forex",  basePrice: 155.20,   lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  { instrument: "AUD/USD",  market: "Forex",  basePrice: 0.6445,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CAD",  market: "Forex",  basePrice: 1.3618,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CHF",  market: "Forex",  basePrice: 0.9012,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "NZD/USD",  market: "Forex",  basePrice: 0.5950,   lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "EUR/GBP",  market: "Forex",  basePrice: 0.8578,   lotSize: 100_000, quoteToInr: 107.5 },
  { instrument: "EUR/JPY",  market: "Forex",  basePrice: 169.42,   lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  { instrument: "GBP/JPY",  market: "Forex",  basePrice: 197.10,   lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2, isJpy: true },
  { instrument: "BTC/USDT", market: "Crypto", basePrice: 65_240,   lotSize: 0.01,    quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "ETH/USDT", market: "Crypto", basePrice:  3_215,   lotSize: 0.10,    quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "SOL/USDT", market: "Crypto", basePrice:    158,   lotSize: 1.00,    quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "BNB/USDT", market: "Crypto", basePrice:    582,   lotSize: 0.10,    quoteToInr: INR_PER_USD, isCrypto: true },
  { instrument: "XRP/USDT", market: "Crypto", basePrice:  0.526,   lotSize: 500,     quoteToInr: INR_PER_USD, isCrypto: true },
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

function calcExitPrice(
  instr: Instrument,
  entryPrice: number,
  direction: "buy" | "sell",
  isLoss: boolean,
): number {
  if (instr.isCrypto) {
    const pct = isLoss ? randomBetween(0.3, 1.5) : randomBetween(0.5, 3.0);
    const sign = (direction === "buy") === !isLoss ? 1 : -1;
    return entryPrice * (1 + sign * pct / 100);
  }
  const pipSize = instr.isJpy ? 0.01 : 0.0001;
  const pips = isLoss ? randomBetween(10, 30) : randomBetween(8, 55);
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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── 2-Year Purge ────────────────────────────────────────────────────────────

async function purgeOldTrades(): Promise<void> {
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1_000);
  await db.delete(tradesTable).where(lt(tradesTable.closedAt, twoYearsAgo));
}

// ─── Trade Plan Builder ───────────────────────────────────────────────────────
/**
 * Build a list of trade profit values summing to `runProfit`.
 * Optional `count` fixes number of trades (for closing a set of open trades).
 */
function buildTradePlan(runProfit: number, count?: number): number[] {
  const tradeCount = count ?? randInt(3, 5);

  const rawLossCount = Math.round(tradeCount * randomBetween(0.30, 0.40));
  const lossCount = Math.max(0, Math.min(rawLossCount, tradeCount - 1));
  const winCount  = tradeCount - lossCount;

  const lossAmounts = Array.from({ length: lossCount }, () =>
    runProfit * randomBetween(0.08, 0.20)
  );
  const totalLoss = lossAmounts.reduce((s, v) => s + v, 0);
  const totalWinBudget = runProfit + totalLoss;

  const profits: number[] = [];
  let winBudgetRemaining = totalWinBudget;

  for (let w = 0; w < winCount - 1; w++) {
    const share = (totalWinBudget / winCount) * randomBetween(0.75, 1.25);
    profits.push(share);
    winBudgetRemaining -= share;
  }
  profits.push(Math.max(1, winBudgetRemaining));

  lossAmounts.forEach(l => profits.push(-l));

  const gapCloser = profits.shift()!;
  for (let i = profits.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [profits[i], profits[j]] = [profits[j], profits[i]];
  }
  profits.push(gapCloser);

  return profits;
}

// ─── Eligible Accounts ───────────────────────────────────────────────────────

async function getEligibleAccounts() {
  const all = await db.select().from(accountsTable);
  return all.filter(acc => {
    if (acc.dailyGrowthTarget === null) return false;
    // Canonical balance = deposits − withdrawals + profit (prevents drift exclusions)
    const canonical = parseFloat(acc.totalDeposits as string)
      - parseFloat(acc.totalWithdrawals as string)
      + parseFloat(acc.totalProfit as string);
    return canonical > 0;
  });
}

// ─── Phase A: Open new live trades ───────────────────────────────────────────

async function openTradesPhase(): Promise<void> {
  console.log("[TradeCron] Phase A: Opening live trades...");
  const eligible = await getEligibleAccounts();
  console.log(`[TradeCron] ${eligible.length} eligible account(s).`);

  for (const account of eligible) {
    try {
      // Skip if user already has open trades
      const existingOpen = await db
        .select()
        .from(tradesTable)
        .where(and(eq(tradesTable.userId, account.userId), eq(tradesTable.status, "open")));

      if (existingOpen.length > 0) {
        console.log(`[TradeCron] User ${account.userId}: ${existingOpen.length} open trade(s) already live, skipping.`);
        continue;
      }

      const count = randInt(2, 4);
      for (let i = 0; i < count; i++) {
        const instr     = pickRandom(INSTRUMENTS);
        const direction: "buy" | "sell" = Math.random() > 0.4 ? "buy" : "sell";
        const variance  = 1 + randomBetween(-0.004, 0.004);
        const entryPrice = instr.basePrice * variance;

        await db.insert(tradesTable).values({
          userId:    account.userId,
          market:    instr.market,
          instrument: instr.instrument,
          direction,
          entryPrice: formatPrice(instr, entryPrice),
          lotSize:   instr.lotSize.toFixed(2),
          status:    "open",
          openedAt:  new Date(),
        });
      }

      console.log(`[TradeCron] User ${account.userId}: opened ${count} live trade(s).`);
    } catch (err) {
      console.error(`[TradeCron] Phase A error for account ${account.id}:`, err);
    }
  }

  console.log("[TradeCron] Phase A complete.");
}

// ─── Phase B: Close open trades & apply profit ───────────────────────────────

async function closeTradesPhase(): Promise<void> {
  console.log("[TradeCron] Phase B: Closing live trades...");

  // Only close trades that have been open for at least 45 minutes
  const cutoff    = new Date(Date.now() - 45 * 60_000);
  const todayStart = getTodayStartIST();
  const eligible  = await getEligibleAccounts();

  for (const account of eligible) {
    try {
      const openTrades = await db
        .select()
        .from(tradesTable)
        .where(
          and(
            eq(tradesTable.userId, account.userId),
            eq(tradesTable.status, "open"),
            lt(tradesTable.openedAt, cutoff)
          )
        );

      if (openTrades.length === 0) continue;

      const totalDeposits    = parseFloat(account.totalDeposits    as string);
      const totalWithdrawals = parseFloat(account.totalWithdrawals as string);
      const baseTotalProfit  = parseFloat(account.totalProfit      as string);
      // Canonical balance: always deposits − withdrawals + net profit (no drift)
      const canonicalBalance = totalDeposits - totalWithdrawals + baseTotalProfit;
      const dailyGrowthPct   = parseFloat(account.dailyGrowthTarget as string);

      // Apply a random variance ±1% around the target (e.g. 4% target → 3–5% actual)
      const variance          = randomBetween(-1.0, 1.0);
      const effectivePct      = Math.max(1, dailyGrowthPct + variance);
      const dailyTargetAmount = canonicalBalance * (effectivePct / 100);

      // Today's already-closed profit
      const todayClosedTrades = await db
        .select()
        .from(tradesTable)
        .where(
          and(
            eq(tradesTable.userId, account.userId),
            eq(tradesTable.status, "closed"),
            gte(tradesTable.openedAt, todayStart)
          )
        );

      const todayAccumulatedNet = todayClosedTrades.reduce(
        (s, t) => s + (t.profit ? parseFloat(t.profit as string) : 0), 0
      );

      if (todayAccumulatedNet >= dailyTargetAmount) {
        // Daily target already met — close trades at ~break-even
        for (const trade of openTrades) {
          const instr      = INSTRUMENTS.find(i => i.instrument === trade.instrument) || INSTRUMENTS[0];
          const entryPrice = parseFloat(trade.entryPrice as string);
          const exitPrice  = calcExitPrice(instr, entryPrice, trade.direction as "buy" | "sell", false);

          await db.update(tradesTable).set({
            exitPrice:     formatPrice(instr, exitPrice),
            profit:        "0.00",
            profitPercent: "0.0000",
            status:        "closed",
            closedAt:      new Date(),
          }).where(eq(tradesTable.id, trade.id));
        }
        console.log(`[TradeCron] User ${account.userId}: daily target met, closed ${openTrades.length} trade(s) at break-even.`);
        continue;
      }

      // Remaining gap → contribute 30–55% this run
      const remaining  = dailyTargetAmount - todayAccumulatedNet;
      const runProfit  = remaining * randomBetween(0.30, 0.55);
      const tradeProfits = buildTradePlan(runProfit, openTrades.length);

      let netCommitted = 0;

      for (let i = 0; i < openTrades.length; i++) {
        const trade       = openTrades[i];
        const tradeProfit = tradeProfits[i] ?? 0;
        const isLoss      = tradeProfit < 0;

        const instr      = INSTRUMENTS.find(ins => ins.instrument === trade.instrument) || INSTRUMENTS[0];
        const entryPrice = parseFloat(trade.entryPrice as string);
        const exitPrice  = calcExitPrice(instr, entryPrice, trade.direction as "buy" | "sell", isLoss);
        const notionalInr = entryPrice * instr.lotSize * instr.quoteToInr;
        const profitPercent = (tradeProfit / notionalInr) * 100;

        await db.update(tradesTable).set({
          exitPrice:     formatPrice(instr, exitPrice),
          profit:        tradeProfit.toFixed(2),
          profitPercent: profitPercent.toFixed(4),
          status:        "closed",
          closedAt:      new Date(),
        }).where(eq(tradesTable.id, trade.id));

        netCommitted += tradeProfit;
        // Canonical: balance = deposits − withdrawals + totalProfit (no drift ever)
        const newTotalProfit = baseTotalProfit + netCommitted;
        const newBalance     = totalDeposits - totalWithdrawals + newTotalProfit;

        await db.update(accountsTable).set({
          totalBalance: Math.max(0, newBalance).toFixed(2),
          totalProfit:  newTotalProfit.toFixed(2),
          updatedAt:    new Date(),
        }).where(eq(accountsTable.id, account.id));
      }

      const wins = tradeProfits.filter(p => p > 0).length;
      console.log(
        `[TradeCron] User ${account.userId}: closed ${openTrades.length} trade(s) ` +
        `[${wins}W/${openTrades.length - wins}L] net +₹${runProfit.toFixed(2)} | ` +
        `Today total: ₹${(todayAccumulatedNet + runProfit).toFixed(2)} / ₹${dailyTargetAmount.toFixed(2)} target`
      );
    } catch (err) {
      console.error(`[TradeCron] Phase B error for account ${account.id}:`, err);
    }
  }

  console.log("[TradeCron] Phase B complete.");
}

// ─── Schedulers ──────────────────────────────────────────────────────────────

function scheduleOpenPhase(): void {
  const delay = randomBetween(2 * 60 * 60_000, 4 * 60 * 60_000);
  console.log(`[TradeCron] Next open-phase in ${(delay / 3_600_000).toFixed(2)} hrs.`);
  setTimeout(async () => {
    await openTradesPhase();
    scheduleOpenPhase();
  }, delay);
}

function scheduleClosePhase(): void {
  const delay = randomBetween(45 * 60_000, 90 * 60_000);
  console.log(`[TradeCron] Next close-phase in ${(delay / 60_000).toFixed(0)} min.`);
  setTimeout(async () => {
    await purgeOldTrades();
    await closeTradesPhase();
    scheduleClosePhase();
  }, delay);
}

export function startTradeCron(): void {
  console.log("[TradeCron] Trade automation initialised.");

  // Open phase: first run after 1 min
  setTimeout(async () => {
    await openTradesPhase();
    scheduleOpenPhase();
  }, 60_000);

  // Close phase: first run after 50 min (gives open trades time to breathe)
  setTimeout(async () => {
    await purgeOldTrades();
    await closeTradesPhase();
    scheduleClosePhase();
  }, 50 * 60_000);
}
