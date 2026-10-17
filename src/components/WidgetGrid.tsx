import React from 'react';
import { WidgetConfig, DataRecord, ColumnMeta, ChartType } from '../types/dashboard';
import { WidgetCard } from './WidgetCard';
import { Plus, LayoutGrid } from 'lucide-react';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  records: DataRecord[];
  columns: ColumnMeta[];
  onEditWidget: (widget: WidgetConfig) => void;
  onDeleteWidget: (widgetId: string) => void;
  onDuplicateWidget: (widget: WidgetConfig) => void;
  onMoveWidget: (widgetId: string, direction: 'prev' | 'next') => void;
  onQuickChartTypeChange: (widgetId: string, newType: ChartType) => void;
  onToggleWidth: (widgetId: string) => void;
  onFilterSelect?: (dimension: string, value: string) => void;
  onAddWidget: () => void;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  records,
  columns,
  onEditWidget,
  onDeleteWidget,
  onDuplicateWidget,
  onMoveWidget,
  onQuickChartTypeChange,
  onToggleWidth,
  onFilterSelect,
  onAddWidget,
}) => {
  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <LayoutGrid className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No active widgets</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
          All widgets have been removed. Add custom chart widgets or reload the default layout.
        </p>
        <button
          onClick={onAddWidget}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add First Widget</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      {widgets.map((widget, idx) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          records={records}
          columns={columns}
          onEdit={onEditWidget}
          onDelete={onDeleteWidget}
          onDuplicate={onDuplicateWidget}
          onMove={onMoveWidget}
          onQuickChartTypeChange={onQuickChartTypeChange}
          onToggleWidth={onToggleWidth}
          onFilterSelect={onFilterSelect}
          canMovePrev={idx > 0}
          canMoveNext={idx < widgets.length - 1}
        />
      ))}
    </div>
  );
};
