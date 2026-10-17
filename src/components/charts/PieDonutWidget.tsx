import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors, formatMetric } from '../../utils/dataEngine';
import { CustomTooltip } from './CustomTooltip';

interface PieDonutWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const PieDonutWidget: React.FC<PieDonutWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const isDonut = config.chartType === 'donut';
  const colors = getPaletteColors(config.colorPalette);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data points available for current filters
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64">
      {/* Chart Canvas */}
      <div className="relative w-full sm:w-1/2 h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <CustomTooltip
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              }
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? 52 : 0}
              outerRadius={75}
              paddingAngle={isDonut ? 3 : 1}
              dataKey="value"
              cursor="pointer"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onClick={(entry: any) => onFilterSelect && onFilterSelect(entry?.label || entry?.name || entry?.payload?.label || '')}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#0b0f19"
                  strokeWidth={2}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  className="transition-all duration-200"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {isDonut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Total
            </span>
            <span className="text-sm font-semibold font-mono tabular-nums text-slate-100">
              {formatMetric(total, { compact: true, prefix: config.prefix })}
            </span>
          </div>
        )}
      </div>

      {/* Structured Clean Legend (no candy badges) */}
      <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto space-y-1.5 pr-2">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          const isHovered = activeIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => onFilterSelect && onFilterSelect(item.label)}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-md transition-colors text-xs ${
                isHovered ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-slate-400">
                <span className="text-slate-200 font-medium">
                  {formatMetric(item.value, { compact: true, prefix: config.prefix })}
                </span>
                <span className="text-slate-500 w-10 text-right">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
