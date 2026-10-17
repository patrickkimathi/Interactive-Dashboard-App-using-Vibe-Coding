import React from 'react';
import { formatMetric } from '../../utils/dataEngine';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  prefix,
  suffix,
  isCurrency,
  isPercentage,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur-md text-xs">
      <div className="font-semibold text-slate-200 mb-1 border-b border-slate-800 pb-1">
        {label || payload[0]?.payload?.label || 'Item'}
      </div>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const val = typeof entry.value === 'number' ? entry.value : Number(entry.value);
          const formattedVal = formatMetric(val, {
            prefix,
            suffix,
            isCurrency,
            isPercentage,
          });

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-2 h-2 rounded-xs inline-block"
                  style={{ backgroundColor: entry.color || entry.fill || '#6366f1' }}
                />
                {entry.name || 'Value'}:
              </span>
              <span className="font-mono tabular-nums text-slate-100 font-medium">
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
