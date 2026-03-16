import { db } from "@workspace/db";
import { accountsTable, tradesTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

const INSTRUMENTS: Array<{ instrument: string; market: string; basePrice: number; lotSize: number }> = [
  { instrument: "NIFTY 50", market: "NSE", basePrice: 22547, lotSize: 50 },
  { instrument: "BANK NIFTY", market: "NSE", basePrice: 50980, lotSize: 25 },
  { instrument: "RELIANCE", market: "NSE", basePrice: 2451, lotSize: 100 },
  { instrument: "TCS", market: "NSE", basePrice: 3812, lotSize: 50 },
  { instrument: "HDFC BANK", market: "NSE", basePrice: 1684, lotSize: 200 },
  { instrument: "INFOSYS", market: "NSE", basePrice: 1748, lotSize: 150 },
  { instrument: "TATAMOTORS", market: "NSE", basePrice: 1032, lotSize: 300 },
  { instrument: "USD/INR", market: "Forex", basePrice: 83.45, lotSize: 1000 },
  { instrument: "EUR/INR", market: "Forex", basePrice: 90.22, lotSize: 1000 },
  { instrument: "GBP/INR", market: "Forex", basePrice: 105.70, lotSize: 1000 },
  { instrument: "MCX GOLD", market: "MCX", basePrice: 62480, lotSize: 1 },
  { instrument: "MCX SILVER", market: "MCX", basePrice: 73250, lotSize: 1 },
  { instrument: "CRUDE OIL", market: "MCX", basePrice: 6840, lotSize: 100 },
];

function getTodayStartIST(): Date {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
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
      (acc) =>
        acc.assignedStrategyId !== null &&
        parseFloat(acc.totalBalance as string) > 0
    );

    console.log(`[TradeCron] ${eligible.length} eligible accounts found.`);

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
          .where(
            and(
              eq(tradesTable.userId, account.userId),
              gte(tradesTable.openedAt, todayStart)
            )
          );

        const todayAccumulatedProfit = todayTrades.reduce(
          (s, t) => s + (t.profit ? parseFloat(t.profit as string) : 0),
          0
        );

        if (todayAccumulatedProfit >= dailyTargetAmount) {
          console.log(
            `[TradeCron] User ${account.userId} daily target already met (₹${todayAccumulatedProfit.toFixed(2)} >= ₹${dailyTargetAmount.toFixed(2)})`
          );
          continue;
        }

        const remaining = dailyTargetAmount - todayAccumulatedProfit;
        const contributionFactor = randomBetween(0.28, 0.45);
        const runProfit = Math.min(remaining, remaining * contributionFactor);

        const tradeCount = Math.floor(randomBetween(2, 4));
        let totalInserted = 0;

        for (let i = 0; i < tradeCount; i++) {
          const instr = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
          const direction: "buy" | "sell" = Math.random() > 0.38 ? "buy" : "sell";
          const priceVariance = 1 + randomBetween(-0.012, 0.012);
          const entryPrice = instr.basePrice * priceVariance;
          const tradeShare = i < tradeCount - 1
            ? runProfit / tradeCount * randomBetween(0.75, 1.25)
            : runProfit - totalInserted;
          const tradeProfit = Math.max(tradeShare, 1);
          const profitPercent = (tradeProfit / (entryPrice * instr.lotSize)) * 100;
          const exitPrice =
            direction === "buy"
              ? entryPrice * (1 + Math.abs(profitPercent / 100))
              : entryPrice * (1 - Math.abs(profitPercent / 100));

          const openMsAgo = randomBetween(0, 3_600_000);
          const openedAt = new Date(Date.now() - openMsAgo);
          const closedAt = new Date(
            openedAt.getTime() + randomBetween(300_000, 1_800_000)
          );

          await db.insert(tradesTable).values({
            userId: account.userId,
            strategyId: account.assignedStrategyId,
            market: instr.market,
            instrument: instr.instrument,
            direction,
            entryPrice: entryPrice.toFixed(5),
            exitPrice: exitPrice.toFixed(5),
            lotSize: instr.lotSize.toFixed(2),
            profit: tradeProfit.toFixed(2),
            profitPercent: profitPercent.toFixed(4),
            status: "closed",
            openedAt,
            closedAt,
          });

          totalInserted += tradeProfit;
        }

        const profitAdded = totalInserted;
        const newBalance = balance + profitAdded;
        const newTotalProfit =
          parseFloat(account.totalProfit as string) + profitAdded;

        await db
          .update(accountsTable)
          .set({
            totalBalance: newBalance.toFixed(2),
            totalProfit: newTotalProfit.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(accountsTable.id, account.id));

        console.log(
          `[TradeCron] User ${account.userId}: ${tradeCount} trades, +₹${profitAdded.toFixed(2)} (today: ₹${(todayAccumulatedProfit + profitAdded).toFixed(2)} / ₹${dailyTargetAmount.toFixed(2)} target)`
        );
      } catch (err) {
        console.error(
          `[TradeCron] Error processing account ${account.id}:`,
          err
        );
      }
    }

    console.log("[TradeCron] Execution cycle complete.");
  } catch (err) {
    console.error("[TradeCron] Fatal error:", err);
  }
}

function scheduleNextRun(): void {
  const minMs = 2 * 60 * 60 * 1000;
  const maxMs = 4 * 60 * 60 * 1000;
  const delay = randomBetween(minMs, maxMs);
  console.log(
    `[TradeCron] Next run scheduled in ${(delay / 3_600_000).toFixed(2)} hours.`
  );
  setTimeout(async () => {
    await executeAutomatedTrades();
    scheduleNextRun();
  }, delay);
}

export function startTradeCron(): void {
  console.log("[TradeCron] Trade automation service initialised.");
  setTimeout(async () => {
    await executeAutomatedTrades();
    scheduleNextRun();
  }, 45_000);
}
