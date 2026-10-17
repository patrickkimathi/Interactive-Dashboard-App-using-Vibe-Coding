import React from 'react';
import { WidgetConfig } from '../../types/dashboard';
import { generateCrossTabMatrix, formatMetric, getPaletteColors } from '../../utils/dataEngine';

interface HeatmapWidgetProps {
  records: any[];
  config: WidgetConfig;
  onFilterSelect?: (dimValue: string) => void;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  records,
  config,
  onFilterSelect,
}) => {
  const rowDim = config.dimension;
  const colDim = config.secondaryDimension || 'category';
  const colors = getPaletteColors(config.colorPalette);
  const baseColor = colors[0] || '#06b6d4';

  const { rows, cols, matrix, maxValue } = generateCrossTabMatrix(
    records,
    rowDim,
    colDim,
    config.metric,
    config.aggregation
  );

  if (!records || records.length === 0 || rows.length === 0 || cols.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Requires at least 2 dimensions to render cross-tab heatmap matrix
      </div>
    );
  }

  const getCellData = (r: string, c: string) => {
    return matrix.find((m) => m.row === r && m.col === c);
  };

  return (
    <div className="w-full h-64 overflow-x-auto flex flex-col justify-center">
      <div className="min-w-[400px]">
        {/* Column Headers */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `100px repeat(${cols.length}, minmax(0, 1fr))` }}>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold truncate self-end pb-1">
            {rowDim} \ {colDim}
          </div>
          {cols.map((col, idx) => (
            <div
              key={idx}
              className="text-[11px] text-slate-400 font-medium truncate text-center px-1"
              title={col}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Matrix Rows */}
        <div className="space-y-1">
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid gap-1 items-center"
              style={{ gridTemplateColumns: `100px repeat(${cols.length}, minmax(0, 1fr))` }}
            >
              {/* Row Label */}
              <button
                onClick={() => onFilterSelect && onFilterSelect(row)}
                className="text-[11px] text-slate-300 font-medium truncate text-left hover:text-white transition-colors cursor-pointer"
                title={row}
              >
                {row}
              </button>

              {/* Cell values */}
              {cols.map((col, cIdx) => {
                const cell = getCellData(row, col);
                const val = cell?.value || 0;
                const ratio = maxValue > 0 ? val / maxValue : 0;
                const opacity = val === 0 ? 0.05 : Math.max(0.18, ratio);

                return (
                  <div
                    key={cIdx}
                    onClick={() => onFilterSelect && onFilterSelect(row)}
                    className="h-9 rounded-sm flex flex-col items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 hover:ring-1 hover:ring-white/40"
                    style={{
                      backgroundColor: baseColor,
                      opacity: opacity,
                    }}
                    title={`${row} + ${col}: ${formatMetric(val, { prefix: config.prefix })} (${cell?.count || 0} items)`}
                  >
                    <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] truncate">
                      {val > 0 ? formatMetric(val, { compact: true, prefix: config.prefix }) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend Scale */}
        <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-slate-400 font-mono">
          <span>0</span>
          <div
            className="w-24 h-2 rounded-xs"
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.1), ${baseColor})`,
            }}
          />
          <span>{formatMetric(maxValue, { compact: true, prefix: config.prefix })}</span>
        </div>
      </div>
    </div>
  );
};
