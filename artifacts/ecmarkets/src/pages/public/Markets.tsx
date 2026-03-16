import { PublicLayout } from '@/components/layout/PublicLayout';
import { TradingChartWidget } from '@/components/shared/TradingWidget';

export function Markets() {
  return (
    <PublicLayout>
      <div className="pt-20 pb-16 bg-card/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Global Markets</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our algorithms trade across highly liquid global markets to ensure maximum execution efficiency.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Forex Majors</h2>
              <p className="text-muted-foreground mb-6">
                The core of our trend-following strategies. High liquidity and deep markets allow our algorithms to scale without slippage.
              </p>
              <TradingChartWidget symbol="FOREXCOM:EURUSD" />
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Precious Metals</h2>
              <p className="text-muted-foreground mb-6">
                Gold (XAUUSD) provides excellent volatility for our mean-reversion and breakout models, generating significant alpha during market stress.
              </p>
              <TradingChartWidget symbol="OANDA:XAUUSD" />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
