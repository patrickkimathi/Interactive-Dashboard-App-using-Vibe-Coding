import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors, formatMetric } from '../../utils/dataEngine';
import { CustomTooltip } from './CustomTooltip';

interface LineAreaChartWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const LineAreaChartWidget: React.FC<LineAreaChartWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const isArea = config.chartType === 'area';
  const colors = getPaletteColors(config.colorPalette);
  const primaryColor = colors[0] || '#6366f1';

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data points available for current filters
      </div>
    );
  }

  const gradientId = `area-gradient-${config.id}`;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        {isArea ? (
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={Math.max(0, Math.floor(data.length / 8))}
            />
            <YAxis
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
            <Area
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 5,
                stroke: '#0f172a',
                strokeWidth: 2,
                cursor: 'pointer',
                onClick: (_, entry: any) => onFilterSelect && onFilterSelect(entry.payload?.label),
              }}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={Math.max(0, Math.floor(data.length / 8))}
            />
            <YAxis
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
            <Line
              type="monotone"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: primaryColor, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                stroke: '#0f172a',
                strokeWidth: 2,
                cursor: 'pointer',
                onClick: (_, entry: any) => onFilterSelect && onFilterSelect(entry.payload?.label),
              }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
