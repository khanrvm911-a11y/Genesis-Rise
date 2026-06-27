import { useState, useMemo } from 'react';
import {
  TrendingUp, Zap, AlertTriangle, Heart, Target, Moon, Droplets, Award,
  Lightbulb, X, ChevronRight, Sparkles,
} from 'lucide-react';
import { generateRecommendations } from '../../utils/coachUtils';
import EmptyState from '../ui/EmptyState';

const ICON_MAP = {
  TrendingUp, Zap, AlertTriangle, Heart, Target, Moon, Droplets, Award,
};

const TYPE_STYLES = {
  improvement: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400' },
  positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
  suggestion: { bg: 'bg-sl-purple/10', border: 'border-sl-purple/20', icon: 'text-sl-purple-light' },
  recovery: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400' },
  wellness: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
};

export default function SmartRecommendations({ ctx, onBack }) {
  const [dismissed, setDismissed] = useState(new Set());

  const recommendations = useMemo(() => {
    return generateRecommendations(ctx).filter(r => !dismissed.has(r.id));
  }, [ctx, dismissed]);

  const dismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  if (!ctx.hasData) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Recommendations
        </h2>
        <button onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
          Back
        </button>
      </div>

      {recommendations.length === 0 && (
        <EmptyState icon={Sparkles}
          title="All Caught Up"
          description="No pending recommendations. Keep up the great work!" />
      )}

      <div className="space-y-2">
        {recommendations.map(rec => {
          const Icon = ICON_MAP[rec.icon] || Lightbulb;
          const style = TYPE_STYLES[rec.type] || TYPE_STYLES.suggestion;

          return (
            <div key={rec.id}
              className={`rounded-xl p-3.5 border ${style.border} ${style.bg} relative group`}>
              <button onClick={() => dismiss(rec.id)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sl-gray/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sl-purple-light/50 hover:text-white">
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg border ${style.border} ${style.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${style.icon}`} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-bold text-white">{rec.title}</p>
                  <p className="text-[11px] text-sl-purple-light/70 mt-1 leading-relaxed">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
