import React from 'react';
import { WidgetConfig } from '../../types/dashboard';
import { calculateKpi, formatMetric, getPaletteColors } from '../../utils/dataEngine';
import { TrendingUp, TrendingDown, Target, ArrowRight } from 'lucide-react';

interface KpiWidgetProps {
  records: any[];
  config: WidgetConfig;
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({ records, config }) => {
  const { value, count, min, max, avg } = calculateKpi(
    records,
    config.metric,
    config.aggregation
  );

  const colors = getPaletteColors(config.colorPalette);
  const accentColor = colors[0] || '#6366f1';

  const goal = config.benchmarkGoal;
  const progressPct = goal && goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : null;
  const isGoalReached = progressPct !== null && progressPct >= 100;

  return (
    <div className="flex flex-col justify-between h-40 py-1">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-3xl font-bold font-mono tabular-nums tracking-tight text-white">
            {formatMetric(value, {
              prefix: config.prefix,
              suffix: config.suffix,
              compact: value > 1_000_000,
            })}
          </div>

          {progressPct !== null && (
            <div className="flex items-center gap-1 text-xs font-mono tabular-nums">
              {isGoalReached ? (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {progressPct}%
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Target className="w-3.5 h-3.5" />
                  {progressPct}% of goal
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar against target if configured */}
        {goal && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Target: {formatMetric(goal, { prefix: config.prefix, compact: true })}</span>
              <span className="font-mono tabular-nums">
                {formatMetric(Math.max(0, goal - value), { prefix: config.prefix, compact: true })}{' '}
                {value >= goal ? 'surpassed' : 'remaining'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, progressPct || 0)}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clean unboxed statistical breakdown footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
        <div className="flex items-center gap-2">
          <span>{count} records</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Avg: {formatMetric(avg, { prefix: config.prefix, compact: true })}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>Min: {formatMetric(min, { prefix: config.prefix, compact: true })}</span>
          <ArrowRight className="w-2.5 h-2.5" />
          <span>Max: {formatMetric(max, { prefix: config.prefix, compact: true })}</span>
        </div>
      </div>
    </div>
  );
};
