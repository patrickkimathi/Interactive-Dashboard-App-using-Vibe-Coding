import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { getPaletteColors } from '../../utils/dataEngine';
import { CustomTooltip } from './CustomTooltip';

interface RadarChartWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const RadarChartWidget: React.FC<RadarChartWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const colors = getPaletteColors(config.colorPalette);
  const strokeColor = colors[0] || '#f43f5e';

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No data points available for current filters
      </div>
    );
  }

  // Radar charts work best with at least 3 vertices
  const radarData = data.slice(0, 8);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
          <PolarGrid stroke="#334155" opacity={0.4} />
          <PolarAngleAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            cursor="pointer"
            onClick={(entry) => entry && onFilterSelect && onFilterSelect(entry.value)}
          />
          <PolarRadiusAxis stroke="#475569" fontSize={9} />
          <Tooltip
            content={
              <CustomTooltip
                prefix={config.prefix}
                suffix={config.suffix}
              />
            }
          />
          <Radar
            name={config.title}
            dataKey="value"
            stroke={strokeColor}
            fill={strokeColor}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
