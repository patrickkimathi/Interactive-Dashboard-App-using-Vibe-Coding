import React, { useState, useEffect } from 'react';
import { WidgetConfig, ColumnMeta, ChartType, AggregationType, PaletteName } from '../types/dashboard';
import { X, Check } from 'lucide-react';

interface WidgetEditorModalProps {
  isOpen: boolean;
  widget: WidgetConfig | null;
  columns: ColumnMeta[];
  onSave: (widget: WidgetConfig) => void;
  onClose: () => void;
}

export const WidgetEditorModal: React.FC<WidgetEditorModalProps> = ({
  isOpen,
  widget,
  columns,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<WidgetConfig>({
    id: `widget_${Date.now()}`,
    title: 'New Visual Widget',
    description: '',
    chartType: 'bar',
    colSpan: 6,
    dimension: columns[0]?.key || '',
    secondaryDimension: '',
    metric: columns.find((c) => c.type === 'number')?.key || columns[0]?.key || '',
    aggregation: 'sum',
    colorPalette: 'indigo',
    limit: 10,
    sortBy: 'value_desc',
    showGrid: true,
    showLegend: true,
    prefix: '',
    suffix: '',
    benchmarkGoal: undefined,
  });

  useEffect(() => {
    if (widget) {
      setFormData(widget);
    } else {
      const defaultNum = columns.find((c) => c.type === 'number')?.key || columns[0]?.key || '';
      const defaultCat = columns.find((c) => c.type === 'string' || c.type === 'date')?.key || columns[0]?.key || '';
      setFormData({
        id: `widget_${Date.now()}`,
        title: 'New Visual Widget',
        description: '',
        chartType: 'bar',
        colSpan: 6,
        dimension: defaultCat,
        secondaryDimension: '',
        metric: defaultNum,
        aggregation: 'sum',
        colorPalette: 'indigo',
        limit: 10,
        sortBy: 'value_desc',
        showGrid: true,
        showLegend: true,
        prefix: '',
        suffix: '',
        benchmarkGoal: undefined,
      });
    }
  }, [widget, columns]);

  if (!isOpen) return null;

  const chartTypes: { type: ChartType; label: string; desc: string }[] = [
    { type: 'kpi', label: 'KPI Stat Card', desc: 'Single headline figure with target progress' },
    { type: 'bar', label: 'Vertical Bar', desc: 'Standard column chart for categorical comparison' },
    { type: 'horizontal_bar', label: 'Horizontal Bar', desc: 'Ranked leaderboard layout with labels' },
    { type: 'line', label: 'Line Trajectory', desc: 'Continuous trend line over time or sequences' },
    { type: 'area', label: 'Area Fill', desc: 'Smooth gradient area emphasizing volume' },
    { type: 'donut', label: 'Donut / Pie', desc: 'Proportional contribution and shares of total' },
    { type: 'scatter', label: 'Scatter Correlation', desc: 'Two-variable distribution and outliers' },
    { type: 'radar', label: 'Radar Polygon', desc: 'Multi-axis category score visualization' },
    { type: 'funnel', label: 'Funnel Pipeline', desc: 'Step-by-step attrition and conversion flow' },
    { type: 'heatmap', label: 'Cross-Tab Heatmap', desc: '2D matrix intensity across two dimensions' },
    { type: 'table', label: 'Pivot Summary Table', desc: 'High-density aggregated analytical table' },
  ];

  const palettes: { name: PaletteName; label: string; preview: string[] }[] = [
    { name: 'indigo', label: 'Indigo Slate', preview: ['#6366f1', '#818cf8', '#4f46e5'] },
    { name: 'emerald', label: 'Emerald Mint', preview: ['#10b981', '#34d399', '#059669'] },
    { name: 'amber', label: 'Warm Amber', preview: ['#f59e0b', '#fbbf24', '#d97706'] },
    { name: 'rose', label: 'Rose Crimson', preview: ['#f43f5e', '#fb7185', '#e11d48'] },
    { name: 'cyan', label: 'Cyan Ocean', preview: ['#06b6d4', '#22d3ee', '#0891b2'] },
    { name: 'monochrome', label: 'Monochrome Slate', preview: ['#cbd5e1', '#94a3b8', '#64748b'] },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">
              {widget ? 'Configure Visual Widget' : 'Add New Widget'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize visualization type, metrics, dimensions, and styling
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Widget Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sales by Territory"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short contextual footnote"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Chart Type Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Visualization Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chartTypes.map((ct) => (
                <button
                  type="button"
                  key={ct.type}
                  onClick={() => setFormData({ ...formData, chartType: ct.type })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    formData.chartType === ct.type
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-semibold">{ct.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension & Metric Data Binding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.chartType !== 'kpi' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Grouping Dimension (X-Axis / Category)
                </label>
                <select
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.chartType === 'heatmap' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Secondary Dimension (Columns)
                </label>
                <select
                  value={formData.secondaryDimension || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryDimension: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="">-- Select Column Dimension --</option>
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Metric Column (Y-Axis / Value)
              </label>
              <select
                value={formData.metric}
                onChange={(e) => {
                  const mKey = e.target.value;
                  const col = columns.find((c) => c.key === mKey);
                  setFormData({
                    ...formData,
                    metric: mKey,
                    prefix: col?.isCurrency ? '$' : formData.prefix,
                    suffix: col?.isPercentage ? '%' : formData.suffix,
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="__count__">Row Count / Number of Records</option>
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label} {col.type === 'number' ? '(Numeric)' : `(${col.type})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Aggregation Function
              </label>
              <select
                value={formData.aggregation}
                onChange={(e) => setFormData({ ...formData, aggregation: e.target.value as AggregationType })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="sum">Sum (Total accumulated)</option>
                <option value="avg">Average / Mean</option>
                <option value="count">Count of records</option>
                <option value="max">Maximum value</option>
                <option value="min">Minimum value</option>
                <option value="median">Median value</option>
              </select>
            </div>
          </div>

          {/* Sizing, Palette & Formatting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Grid Width
              </label>
              <select
                value={formData.colSpan}
                onChange={(e) => setFormData({ ...formData, colSpan: Number(e.target.value) as 4 | 6 | 8 | 12 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value={4}>1/3 Width (4 Cols)</option>
                <option value={6}>1/2 Width (6 Cols)</option>
                <option value={8}>2/3 Width (8 Cols)</option>
                <option value={12}>Full Width (12 Cols)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Value Prefix
              </label>
              <input
                type="text"
                value={formData.prefix || ''}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="e.g. $ or €"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Value Suffix
              </label>
              <input
                type="text"
                value={formData.suffix || ''}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                placeholder="e.g. % or hrs"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Benchmark Target (for KPI) or Limit (for charts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.chartType === 'kpi' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Benchmark Goal / Target (Optional)
                </label>
                <input
                  type="number"
                  value={formData.benchmarkGoal || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      benchmarkGoal: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Max Items Limit
                </label>
                <select
                  value={formData.limit || 10}
                  onChange={(e) => setFormData({ ...formData, limit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value={5}>Top 5 items</option>
                  <option value={8}>Top 8 items</option>
                  <option value={10}>Top 10 items</option>
                  <option value={15}>Top 15 items</option>
                  <option value={50}>All items (up to 50)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sorting Order
              </label>
              <select
                value={formData.sortBy || 'value_desc'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortBy: e.target.value as 'value_desc' | 'value_asc' | 'label_asc',
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="value_desc">Highest Value First (Descending)</option>
                <option value="value_asc">Lowest Value First (Ascending)</option>
                <option value="label_asc">Dimension Label Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {palettes.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({ ...formData, colorPalette: p.name })}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                    formData.colorPalette === p.name
                      ? 'bg-slate-800 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-xs font-medium">{p.label}</span>
                  <div className="flex gap-1">
                    {p.preview.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          {formData.chartType !== 'kpi' && formData.chartType !== 'table' && (
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showGrid ?? true}
                  onChange={(e) => setFormData({ ...formData, showGrid: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                Show Subtle Gridlines
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showLegend ?? true}
                  onChange={(e) => setFormData({ ...formData, showLegend: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                Show Legend
              </label>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              {widget ? 'Update Widget' : 'Add Widget to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
