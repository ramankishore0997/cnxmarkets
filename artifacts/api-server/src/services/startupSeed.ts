import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@ecmarketsindia.com";
const ADMIN_PASSWORD = "Admin@1234";

const STRATEGIES = [
  { name: "Quantum Momentum", description: "A high-frequency algorithmic strategy that capitalizes on short-term price momentum across major forex pairs. Uses machine learning signal generation with proprietary entry/exit filters for consistent alpha generation.", riskProfile: "medium", minCapital: "50000", winRate: "73.20", maxDrawdown: "8.40", monthlyReturn: "3.20", markets: "Forex, Gold" },
  { name: "Delta Neutral Arbitrage", description: "Statistical arbitrage strategy maintaining market-neutral exposure while profiting from mean-reversion in correlated currency pairs. Ideal for lower volatility environments with consistent Sharpe ratio above 2.0.", riskProfile: "low", minCapital: "100000", winRate: "68.50", maxDrawdown: "4.70", monthlyReturn: "2.80", markets: "Forex" },
  { name: "FX Trend Master", description: "Trend-following strategy utilizing multi-timeframe analysis and dynamic position sizing. Designed to capture major trending moves in G10 currency pairs with sophisticated drawdown management.", riskProfile: "medium", minCapital: "75000", winRate: "71.40", maxDrawdown: "12.10", monthlyReturn: "4.10", markets: "Forex, Indices" },
  { name: "Gold Scalper Pro", description: "Ultra-short-term scalping algorithm optimized for XAUUSD (Gold). Executes hundreds of small trades per day capturing micro-price inefficiencies during London and New York sessions.", riskProfile: "high", minCapital: "150000", winRate: "79.30", maxDrawdown: "15.60", monthlyReturn: "5.30", markets: "Gold" },
  { name: "Equity Hedge Alpha", description: "Long-short equity index strategy combining momentum and mean-reversion signals across Nifty 50, Bank Nifty, and international indices. Provides portfolio diversification with low correlation to traditional assets.", riskProfile: "low", minCapital: "200000", winRate: "65.80", maxDrawdown: "6.20", monthlyReturn: "2.10", markets: "Indices" },
  { name: "RazrMarket Strategy", description: "High-frequency momentum in liquid forex pairs.", riskProfile: "low", minCapital: "50000", winRate: "78.00", maxDrawdown: "12.50", monthlyReturn: "7.80", markets: "Forex" },
  { name: "Momentum Alpha", description: "Multi-timeframe trend following across G10 pairs.", riskProfile: "medium", minCapital: "75000", winRate: "71.40", maxDrawdown: "8.30", monthlyReturn: "5.40", markets: "Forex" },
  { name: "Volatility Edge", description: "Exploits volatility clustering in EURUSD and GBPUSD.", riskProfile: "medium", minCapital: "50000", winRate: "68.90", maxDrawdown: "9.70", monthlyReturn: "4.90", markets: "Forex" },
  { name: "Trend Pulse", description: "Identifies and rides major directional moves using AI signals.", riskProfile: "low", minCapital: "25000", winRate: "74.30", maxDrawdown: "5.20", monthlyReturn: "3.80", markets: "Forex" },
  { name: "FX Momentum", description: "Pure price momentum with dynamic position sizing.", riskProfile: "medium", minCapital: "50000", winRate: "69.50", maxDrawdown: "8.80", monthlyReturn: "4.60", markets: "Forex" },
  { name: "Macro Flow", description: "Global macro signals applied to forex and commodities.", riskProfile: "low", minCapital: "100000", winRate: "72.10", maxDrawdown: "6.40", monthlyReturn: "3.50", markets: "Forex, Commodities" },
  { name: "Gold Breakout", description: "Captures breakout moves in XAUUSD at key levels.", riskProfile: "high", minCapital: "75000", winRate: "63.40", maxDrawdown: "14.20", monthlyReturn: "8.10", markets: "Gold" },
  { name: "Quantum Trend", description: "Quantum-inspired optimization for multi-asset trending.", riskProfile: "medium", minCapital: "100000", winRate: "70.80", maxDrawdown: "9.10", monthlyReturn: "5.20", markets: "Indices, Forex" },
  { name: "Velocity FX", description: "Ultra-fast intraday strategies on major forex pairs.", riskProfile: "high", minCapital: "150000", winRate: "65.70", maxDrawdown: "13.60", monthlyReturn: "9.30", markets: "Forex" },
  { name: "Horizon Algo", description: "Long-term trend following with weekly rebalancing.", riskProfile: "low", minCapital: "50000", winRate: "76.20", maxDrawdown: "4.80", monthlyReturn: "3.20", markets: "Indices" },
  { name: "Apex Momentum", description: "Captures extreme momentum events with strict risk controls.", riskProfile: "high", minCapital: "200000", winRate: "62.90", maxDrawdown: "15.10", monthlyReturn: "10.40", markets: "Indices" },
  { name: "Signal Matrix", description: "Multi-signal confluence for high-probability setups.", riskProfile: "medium", minCapital: "75000", winRate: "73.60", maxDrawdown: "7.90", monthlyReturn: "4.80", markets: "Forex" },
  { name: "Atlas Strategy", description: "Diversified algo portfolio across forex, gold, and indices.", riskProfile: "low", minCapital: "200000", winRate: "75.40", maxDrawdown: "5.90", monthlyReturn: "3.60", markets: "Forex, Gold, Indices" },
  { name: "Zenith FX", description: "Regime-switching algorithm adapts to market conditions.", riskProfile: "medium", minCapital: "100000", winRate: "71.90", maxDrawdown: "8.40", monthlyReturn: "5.10", markets: "Forex" },
  { name: "Neural Edge", description: "Neural network-driven pattern recognition for forex.", riskProfile: "high", minCapital: "200000", winRate: "66.30", maxDrawdown: "12.80", monthlyReturn: "8.70", markets: "Forex" },
  { name: "Dynamic Flow", description: "Dynamic capital allocation across momentum strategies.", riskProfile: "medium", minCapital: "75000", winRate: "70.20", maxDrawdown: "9.30", monthlyReturn: "4.70", markets: "Forex" },
  { name: "Aurora FX", description: "Overnight carry trade optimized for positive swap.", riskProfile: "low", minCapital: "50000", winRate: "77.80", maxDrawdown: "4.10", monthlyReturn: "2.90", markets: "Forex" },
  { name: "Pulse Trader", description: "Intraday pulse-based entries for London/NY sessions.", riskProfile: "medium", minCapital: "50000", winRate: "69.10", maxDrawdown: "8.60", monthlyReturn: "4.40", markets: "Forex" },
  { name: "Vector Algo", description: "Mean-reversion vectorized strategy on correlated pairs.", riskProfile: "low", minCapital: "75000", winRate: "73.20", maxDrawdown: "6.10", monthlyReturn: "3.40", markets: "Forex" },
  { name: "Titan Strategy", description: "Institutional-grade multi-strategy allocation engine.", riskProfile: "low", minCapital: "500000", winRate: "78.50", maxDrawdown: "3.80", monthlyReturn: "3.10", markets: "Forex, Gold, Indices" },
];

export async function runStartupSeed() {
  try {
    console.log("[Seed] Starting startup seed check...");

    // 1. Seed admin user if not exists
    const adminRows = await db.execute(
      sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL} LIMIT 1`
    );
    if (adminRows.rows.length === 0) {
      console.log("[Seed] Admin user not found, creating...");
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await db.execute(
        sql`INSERT INTO users (email, password_hash, first_name, last_name, role, kyc_status, is_active)
            VALUES (${ADMIN_EMAIL}, ${passwordHash}, 'Admin', 'ECMarkets', 'admin', 'approved', true)
            ON CONFLICT (email) DO NOTHING`
      );
      console.log("[Seed] Admin user created: " + ADMIN_EMAIL);
    } else {
      console.log("[Seed] Admin user already exists, skipping.");
    }

    // 2. Seed strategies if none exist
    const stratRows = await db.execute(
      sql`SELECT COUNT(*) as count FROM strategies`
    );
    const stratCount = Number((stratRows.rows[0] as { count: string }).count);
    if (stratCount === 0) {
      console.log("[Seed] No strategies found, seeding " + STRATEGIES.length + " strategies...");
      for (const s of STRATEGIES) {
        await db.execute(
          sql`INSERT INTO strategies (name, description, risk_profile, min_capital, win_rate, max_drawdown, monthly_return, markets, is_active)
              VALUES (${s.name}, ${s.description}, ${s.riskProfile}::risk_profile, ${s.minCapital}, ${s.winRate}, ${s.maxDrawdown}, ${s.monthlyReturn}, ${s.markets}, true)
              ON CONFLICT DO NOTHING`
        );
      }
      console.log("[Seed] Strategies seeded successfully.");
    } else {
      console.log("[Seed] Strategies already exist (" + stratCount + "), skipping.");
    }

    console.log("[Seed] Startup seed complete.");
  } catch (err) {
    console.error("[Seed] Startup seed error:", err);
  }
}
