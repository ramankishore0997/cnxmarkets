import { PublicLayout } from '@/components/layout/PublicLayout';
import { useGetStrategies } from '@workspace/api-client-react';
import { ShieldAlert, TrendingUp, Target } from 'lucide-react';

export function Strategies() {
  const { data: strategies, isLoading } = useGetStrategies();

  return (
    <PublicLayout>
      <div className="pt-20 pb-16 bg-card/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Quantitative Strategies</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review our battle-tested algorithms designed for specific market environments and risk tolerances.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {isLoading ? (
          <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {strategies?.map((strategy) => (
              <div key={strategy.id} className="glass-card p-8 rounded-2xl flex flex-col h-full relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{strategy.name}</h3>
                <p className="text-muted-foreground mb-8 flex-1">{strategy.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
                    <p className="text-xl font-bold text-green-400">{strategy.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target</p>
                    <p className="text-xl font-bold text-primary">{strategy.monthlyReturn}%/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk</p>
                    <p className="text-xl font-bold text-white capitalize">{strategy.riskProfile}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                    <Target className="w-4 h-4 text-accent" /> {strategy.markets}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                    <ShieldAlert className="w-4 h-4 text-primary" /> Min: ${strategy.minCapital}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
