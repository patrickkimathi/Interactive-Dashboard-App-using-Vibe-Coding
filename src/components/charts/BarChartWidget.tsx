import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors, formatMetric } from '../../utils/dataEngine';
import { CustomTooltip } from './CustomTooltip';

interface BarChartWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const isHorizontal = config.chartType === 'horizontal_bar';
  const colors = getPaletteColors(config.colorPalette);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data points available for current filters
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        {isHorizontal ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
            )}
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => formatMetric(v, { compact: true, prefix: config.prefix })}
            />
            <YAxis
              dataKey="label"
              type="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              width={80}
            />
            <Tooltip
              content={
                <CustomTooltip
                  prefix={config.prefix}
                  suffix={config.suffix}
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              onClick={(entry: any) => onFilterSelect && onFilterSelect(entry?.label || entry?.payload?.label || '')}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
          >
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              angle={data.length > 5 ? -25 : 0}
              textAnchor={data.length > 5 ? 'end' : 'middle'}
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
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              onClick={(entry: any) => onFilterSelect && onFilterSelect(entry?.label || entry?.payload?.label || '')}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
