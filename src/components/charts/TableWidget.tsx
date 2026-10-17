import React, { useState } from 'react';
import { AggregatedDataPoint, WidgetConfig } from '../../types/dashboard';
import { formatMetric, getPaletteColors } from '../../utils/dataEngine';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TableWidgetProps {
  data: AggregatedDataPoint[];
  config: WidgetConfig;
  onFilterSelect?: (value: string) => void;
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  data,
  config,
  onFilterSelect,
}) => {
  const [sortField, setSortField] = useState<'label' | 'value' | 'count'>('value');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const colors = getPaletteColors(config.colorPalette);
  const barColor = colors[0] || '#6366f1';

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No records match the current filter criteria
      </div>
    );
  }

  const grandTotal = data.reduce((sum, item) => sum + item.value, 0);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const sortedData = [...data].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'label') cmp = a.label.localeCompare(b.label);
    else if (sortField === 'value') cmp = a.value - b.value;
    else if (sortField === 'count') cmp = a.count - b.count;
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: 'label' | 'value' | 'count') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-medium">
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => toggleSort('label')}
            >
              <div className="flex items-center gap-1">
                <span>{config.dimension}</span>
                {sortField === 'label' && (
                  sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </th>
            <th
              className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => toggleSort('count')}
            >
              <div className="flex items-center justify-end gap-1">
                <span>Records</span>
                {sortField === 'count' && (
                  sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </th>
            <th
              className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-200 transition-colors"
              onClick={() => toggleSort('value')}
            >
              <div className="flex items-center justify-end gap-1">
                <span>
                  {config.aggregation.toUpperCase()} of {config.metric}
                </span>
                {sortField === 'value' && (
                  sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </th>
            <th className="py-2.5 px-3 text-right w-44">Share of Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
          {sortedData.map((row, idx) => {
            const pct = grandTotal > 0 ? ((row.value / grandTotal) * 100).toFixed(1) : '0';
            const barWidth = Math.max(3, Math.round((row.value / maxVal) * 100));

            return (
              <tr
                key={idx}
                onClick={() => onFilterSelect && onFilterSelect(row.label)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {row.label}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-400">{row.count}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-100">
                  {formatMetric(row.value, { prefix: config.prefix, suffix: config.suffix })}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="w-10 text-right text-slate-400 text-[11px]">{pct}%</span>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-700/80 font-mono tabular-nums font-semibold text-slate-200">
            <td className="py-3 px-3 font-sans">Summary Total ({data.length} categories)</td>
            <td className="py-3 px-3 text-right">
              {data.reduce((sum, d) => sum + d.count, 0)}
            </td>
            <td className="py-3 px-3 text-right text-indigo-400">
              {formatMetric(grandTotal, { prefix: config.prefix, suffix: config.suffix })}
            </td>
            <td className="py-3 px-3 text-right text-slate-400">100.0%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
