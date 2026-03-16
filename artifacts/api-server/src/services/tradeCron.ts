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

function calcExitPrice(instr: Instrument, entryPrice: number, direction: "buy" | "sell", profitPct: number): number {
  const sign = direction === "buy" ? 1 : -1;
  if (instr.isCrypto) {
    // Crypto: small percentage move (0.05% – 2.5%)
    const movePct = Math.abs(profitPct) * 0.8 + randomBetween(0.05, 0.3);
    return entryPrice * (1 + sign * movePct / 100);
  }
  // Forex: pip-based movement
  const pipSize = instr.isJpy ? 0.01 : 0.0001;
  const pips = randomBetween(8, 55);
  return entryPrice + sign * pips * pipSize;
}

function formatPrice(instr: Instrument, price: number): string {
  if (instr.isCrypto) {
    if (price > 10_000) return price.toFixed(2);
    if (price > 1) return price.toFixed(4);
    return price.toFixed(5);
  }
  if (instr.isJpy) return price.toFixed(3);
  return price.toFixed(5);
}

async function purgeOldTrades(): Promise<void> {
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1_000);
  await db.delete(tradesTable).where(lt(tradesTable.closedAt, twoYearsAgo));
  console.log("[TradeCron] Old trades (>2 years) purged.");
}

async function executeAutomatedTrades(): Promise<void> {
  try {
    console.log("[TradeCron] Running automated trade execution...");

    // Cleanup trades older than 2 years on each cron run
    await purgeOldTrades();

    const allAccounts = await db.select().from(accountsTable);
    const eligible = allAccounts.filter(
      acc => acc.assignedStrategyId !== null && parseFloat(acc.totalBalance as string) > 0
    );

    console.log(`[TradeCron] ${eligible.length} eligible account(s) found.`);
    const todayStart = getTodayStartIST();

    for (const account of eligible) {
      try {
        const balance = parseFloat(account.totalBalance as string);
        const dailyGrowthPct = account.dailyGrowthTarget
          ? parseFloat(account.dailyGrowthTarget as string)
          : 4.0;

        const dailyTargetAmount = balance * (dailyGrowthPct / 100);

        const todayTrades = await db
          .select()
          .from(tradesTable)
          .where(and(eq(tradesTable.userId, account.userId), gte(tradesTable.openedAt, todayStart)));

        const todayAccumulatedProfit = todayTrades.reduce(
          (s, t) => s + (t.profit ? parseFloat(t.profit as string) : 0), 0
        );

        if (todayAccumulatedProfit >= dailyTargetAmount) {
          console.log(`[TradeCron] User ${account.userId}: daily target met (₹${todayAccumulatedProfit.toFixed(2)} >= ₹${dailyTargetAmount.toFixed(2)})`);
          continue;
        }

        const remaining = dailyTargetAmount - todayAccumulatedProfit;
        const runProfit = remaining * randomBetween(0.28, 0.45);
        const tradeCount = randInt(2, 3);

        // Mix winning and losing trades — ~75% win rate
        // Losses are small (5–15% of run profit); we inflate the run budget to compensate
        const lossCount = tradeCount > 1 && Math.random() > 0.72 ? 1 : 0;
        const lossAmounts: number[] = [];
        for (let i = 0; i < lossCount; i++) {
          lossAmounts.push(runProfit * randomBetween(0.05, 0.15));
        }
        const totalLoss = lossAmounts.reduce((a, b) => a + b, 0);
        // Winners must cover losses + runProfit
        const totalWinBudget = runProfit + totalLoss;

        let totalInserted = 0;
        let lossIdx = 0;

        // Shuffle a flag array: which trades are losses?
        const isLossFlags = Array.from({ length: tradeCount }, (_, i) => {
          // Never make the last trade a loss (it must close the gap)
          if (i === tradeCount - 1) return false;
          return i < lossCount;
        });
        // Simple shuffle of the loss positions (not last)
        for (let i = isLossFlags.length - 2; i > 0; i--) {
          const j = randInt(0, i);
          [isLossFlags[i], isLossFlags[j]] = [isLossFlags[j], isLossFlags[i]];
        }

        for (let i = 0; i < tradeCount; i++) {
          const isLast = i === tradeCount - 1;
          const isLoss = !isLast && isLossFlags[i];

          // Pick a random instrument — vary between runs
          const instr = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
          const direction: "buy" | "sell" = Math.random() > 0.4 ? "buy" : "sell";

          const priceVariance = 1 + randomBetween(-0.005, 0.005);
          const entryPrice = instr.basePrice * priceVariance;

          let tradeProfit: number;
          if (isLast) {
            tradeProfit = totalWinBudget - totalInserted - totalLoss;
            if (tradeProfit < 0.01) tradeProfit = 0.01;
          } else if (isLoss) {
            tradeProfit = -(lossAmounts[lossIdx++]);
          } else {
            const winShare = (totalWinBudget / (tradeCount - lossCount));
            tradeProfit = winShare * randomBetween(0.75, 1.25);
          }

          const notionalInr = entryPrice * instr.lotSize * instr.quoteToInr;
          const profitPercent = (tradeProfit / notionalInr) * 100;

          const exitPrice = calcExitPrice(instr, entryPrice, direction, profitPercent);

          // Randomized trade duration: 5 min – 4 hours
          const durationMs = randomBetween(5 * 60_000, 4 * 60 * 60_000);
          const openMsAgo = randomBetween(durationMs, durationMs + 2 * 60 * 60_000);
          const openedAt = new Date(Date.now() - openMsAgo);
          const closedAt = new Date(openedAt.getTime() + durationMs);

          await db.insert(tradesTable).values({
            userId: account.userId,
            strategyId: account.assignedStrategyId,
            market: instr.market,
            instrument: instr.instrument,
            direction,
            entryPrice: formatPrice(instr, entryPrice),
            exitPrice: formatPrice(instr, exitPrice),
            lotSize: instr.lotSize.toFixed(2),
            profit: tradeProfit.toFixed(2),
            profitPercent: profitPercent.toFixed(4),
            status: "closed",
            openedAt,
            closedAt,
          });

          totalInserted += isLoss ? 0 : tradeProfit;
        }

        const netProfit = runProfit; // design guarantees net = runProfit
        const newBalance = balance + netProfit;
        const newTotalProfit = parseFloat(account.totalProfit as string) + netProfit;

        await db.update(accountsTable)
          .set({ totalBalance: newBalance.toFixed(2), totalProfit: newTotalProfit.toFixed(2), updatedAt: new Date() })
          .where(eq(accountsTable.id, account.id));

        console.log(
          `[TradeCron] User ${account.userId}: ${tradeCount} trade(s) (${lossCount} loss), +₹${netProfit.toFixed(2)} | Today: ₹${(todayAccumulatedProfit + netProfit).toFixed(2)} / ₹${dailyTargetAmount.toFixed(2)} target`
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

function scheduleNextRun(): void {
  const delay = randomBetween(2 * 60 * 60 * 1_000, 4 * 60 * 60 * 1_000);
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
