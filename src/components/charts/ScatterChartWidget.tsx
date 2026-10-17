import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors, formatMetric } from '../../utils/dataEngine';
import { CustomTooltip } from './CustomTooltip';

interface ScatterChartWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const ScatterChartWidget: React.FC<ScatterChartWidgetProps> = ({
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

  // Map data to x (index or count) and y (value)
  const scatterPoints = data.map((item, index) => ({
    x: item.count || index + 1,
    y: item.value,
    label: item.label,
    name: item.label,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          {config.showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          )}
          <XAxis
            type="number"
            dataKey="x"
            name="Volume / Transactions"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            unit=" records"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Metric Value"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(v) => formatMetric(v, { compact: true, prefix: config.prefix })}
          />
          <Tooltip
            content={
              <CustomTooltip
                prefix={config.prefix}
                suffix={config.suffix}
              />
            }
          />
          <Scatter
            name={config.title}
            data={scatterPoints}
            onClick={(entry: any) => onFilterSelect && onFilterSelect(entry?.label || entry?.payload?.label || '')}
          >
            {scatterPoints.map((_, index) => (
              <Cell
                key={`scatter-cell-${index}`}
                fill={colors[index % colors.length]}
                className="hover:scale-125 transition-transform origin-center"
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
