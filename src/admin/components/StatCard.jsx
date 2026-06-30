import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'violet', loading }) {
  const colors = {
    violet: 'from-violet-600/20 to-fuchsia-600/5 border-violet-500/20 text-violet-300',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-300',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-300',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-300',
    rose: 'from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-300',
    cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/20 text-cyan-300',
  };

  const iconColors = {
    violet: 'bg-violet-600/20 text-violet-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    amber: 'bg-amber-600/20 text-amber-400',
    blue: 'bg-blue-600/20 text-blue-400',
    rose: 'bg-rose-600/20 text-rose-400',
    cyan: 'bg-cyan-600/20 text-cyan-400',
  };

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-7 w-16 bg-white/10 rounded" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/10" />
        </div>
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium opacity-70 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {trend >= 0
            ? <TrendingUp size={14} className="text-emerald-400" />
            : <TrendingDown size={14} className="text-rose-400" />
          }
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-white/40">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
