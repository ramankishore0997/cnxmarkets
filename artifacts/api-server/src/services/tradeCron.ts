import { db } from "@workspace/db";
import { accountsTable, tradesTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

// Forex pairs only — prices in native quote currency (USD/JPY etc.)
// INR conversion rate used to derive ₹ notional for profitPercent display
const INR_PER_USD = 83.45;

const INSTRUMENTS: Array<{
  instrument: string;
  market: string;
  basePrice: number;   // native price
  lotSize: number;     // standard lot or mini lot
  quoteToInr: number;  // multiplier to get INR notional per lot
}> = [
  // ---- Forex Majors ----
  { instrument: "EUR/USD", market: "Forex", basePrice: 1.0923, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "GBP/USD", market: "Forex", basePrice: 1.2725, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/JPY", market: "Forex", basePrice: 155.20, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2 },
  { instrument: "AUD/USD", market: "Forex", basePrice: 0.6445, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CAD", market: "Forex", basePrice: 1.3618, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "USD/CHF", market: "Forex", basePrice: 0.9012, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "NZD/USD", market: "Forex", basePrice: 0.5950, lotSize: 100_000, quoteToInr: INR_PER_USD },
  { instrument: "EUR/GBP", market: "Forex", basePrice: 0.8578, lotSize: 100_000, quoteToInr: 107.5 },
  { instrument: "EUR/JPY", market: "Forex", basePrice: 169.42, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2 },
  { instrument: "GBP/JPY", market: "Forex", basePrice: 197.10, lotSize: 100_000, quoteToInr: INR_PER_USD / 155.2 },
  // ---- Crypto ----
  { instrument: "BTC/USDT", market: "Crypto", basePrice: 65_240,  lotSize: 0.01, quoteToInr: INR_PER_USD },
  { instrument: "ETH/USDT", market: "Crypto", basePrice:  3_215,  lotSize: 0.10, quoteToInr: INR_PER_USD },
  { instrument: "SOL/USDT", market: "Crypto", basePrice:    158,  lotSize: 1.00, quoteToInr: INR_PER_USD },
  { instrument: "BNB/USDT", market: "Crypto", basePrice:    582,  lotSize: 0.10, quoteToInr: INR_PER_USD },
  { instrument: "XRP/USDT", market: "Crypto", basePrice:  0.526,  lotSize: 500,  quoteToInr: INR_PER_USD },
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

async function executeAutomatedTrades(): Promise<void> {
  try {
    console.log("[TradeCron] Running automated trade execution...");

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
        // Contribute 28-45% of remaining per cron run so the target is hit naturally across 3-4 runs
        const runProfit = remaining * randomBetween(0.28, 0.45);
        const tradeCount = Math.floor(randomBetween(2, 4));
        let totalInserted = 0;

        for (let i = 0; i < tradeCount; i++) {
          const instr = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
          const direction: "buy" | "sell" = Math.random() > 0.38 ? "buy" : "sell";

          const priceVariance = 1 + randomBetween(-0.008, 0.008);
          const entryPrice = instr.basePrice * priceVariance;

          // INR profit for this trade
          const isLast = i === tradeCount - 1;
          const tradeProfit = Math.max(
            isLast ? runProfit - totalInserted : runProfit / tradeCount * randomBetween(0.75, 1.25),
            0.01
          );

          // Back-calculate a realistic-looking profitPercent
          const notionalInr = entryPrice * instr.lotSize * instr.quoteToInr;
          const profitPercent = (tradeProfit / notionalInr) * 100;

          const exitPriceRaw = direction === "buy"
            ? entryPrice * (1 + Math.abs(profitPercent / 100))
            : entryPrice * (1 - Math.abs(profitPercent / 100));

          const openMsAgo = randomBetween(0, 3_600_000);
          const openedAt = new Date(Date.now() - openMsAgo);
          const closedAt = new Date(openedAt.getTime() + randomBetween(300_000, 1_800_000));

          await db.insert(tradesTable).values({
            userId: account.userId,
            strategyId: account.assignedStrategyId,
            market: instr.market,
            instrument: instr.instrument,
            direction,
            entryPrice: entryPrice.toFixed(5),
            exitPrice: exitPriceRaw.toFixed(5),
            lotSize: instr.lotSize.toFixed(4),
            profit: tradeProfit.toFixed(2),
            profitPercent: profitPercent.toFixed(4),
            status: "closed",
            openedAt,
            closedAt,
          });

          totalInserted += tradeProfit;
        }

        const newBalance = balance + totalInserted;
        const newTotalProfit = parseFloat(account.totalProfit as string) + totalInserted;

        await db.update(accountsTable)
          .set({ totalBalance: newBalance.toFixed(2), totalProfit: newTotalProfit.toFixed(2), updatedAt: new Date() })
          .where(eq(accountsTable.id, account.id));

        console.log(
          `[TradeCron] User ${account.userId}: ${tradeCount} trade(s), +₹${totalInserted.toFixed(2)} | Today: ₹${(todayAccumulatedProfit + totalInserted).toFixed(2)} / ₹${dailyTargetAmount.toFixed(2)} target`
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
