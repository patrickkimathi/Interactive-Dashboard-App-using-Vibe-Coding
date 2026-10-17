import React from 'react';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors, formatMetric } from '../../utils/dataEngine';

interface FunnelChartWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const FunnelChartWidget: React.FC<FunnelChartWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const colors = getPaletteColors(config.colorPalette);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data points available for current filters
      </div>
    );
  }

  // Sort descending by value to form a funnel
  const funnelSteps = [...data].sort((a, b) => b.value - a.value).slice(0, 6);
  const maxValue = funnelSteps[0]?.value || 1;

  return (
    <div className="w-full h-64 flex flex-col justify-center gap-2.5 px-2">
      {funnelSteps.map((step, idx) => {
        const widthPct = Math.max(12, Math.round((step.value / maxValue) * 100));
        const conversionPct =
          idx === 0 ? 100 : Math.round((step.value / funnelSteps[idx - 1].value) * 100);
        const overallPct = Math.round((step.value / maxValue) * 100);
        const barColor = colors[idx % colors.length];

        return (
          <div
            key={idx}
            onClick={() => onFilterSelect && onFilterSelect(step.label)}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                {step.label}
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-400">
                <span className="text-slate-100 font-semibold">
                  {formatMetric(step.value, { compact: true, prefix: config.prefix })}
                </span>
                <span className="text-[11px] text-slate-500">
                  {idx > 0 ? `(${conversionPct}% step)` : '(Baseline)'} · {overallPct}%
                </span>
              </div>
            </div>
            <div className="w-full h-5 bg-slate-800/80 rounded-md overflow-hidden flex items-center p-0.5">
              <div
                className="h-full rounded-xs transition-all duration-500 flex items-center justify-end px-2"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: barColor,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
