import React, { useState } from 'react';
import { WidgetConfig, DataRecord, ColumnMeta, ChartType } from '../types/dashboard';
import { ChartRenderer } from './charts/ChartRenderer';
import { aggregateWidgetData } from '../utils/dataEngine';
import { exportElementAsPNG, exportWidgetAsCSV } from '../utils/exportUtils';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Download,
  Image,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

interface WidgetCardProps {
  widget: WidgetConfig;
  records: DataRecord[];
  columns: ColumnMeta[];
  onEdit: (widget: WidgetConfig) => void;
  onDelete: (widgetId: string) => void;
  onDuplicate: (widget: WidgetConfig) => void;
  onMove: (widgetId: string, direction: 'prev' | 'next') => void;
  onQuickChartTypeChange: (widgetId: string, newType: ChartType) => void;
  onToggleWidth: (widgetId: string) => void;
  onFilterSelect?: (dimension: string, value: string) => void;
  canMovePrev: boolean;
  canMoveNext: boolean;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  records,
  columns,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onQuickChartTypeChange,
  onToggleWidth,
  onFilterSelect,
  canMovePrev,
  canMoveNext,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Quick alternative chart types for instant switching
  const chartTypeIcons: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { type: 'line', label: 'Line', icon: <LineChart className="w-3.5 h-3.5" /> },
    { type: 'area', label: 'Area', icon: <AreaChart className="w-3.5 h-3.5" /> },
    { type: 'donut', label: 'Donut', icon: <PieChart className="w-3.5 h-3.5" /> },
  ];

  // Map column span to Tailwind class (out of 12 columns)
  const colSpanClass =
    widget.colSpan === 12
      ? 'col-span-12'
      : widget.colSpan === 8
      ? 'col-span-12 lg:col-span-8'
      : widget.colSpan === 6
      ? 'col-span-12 lg:col-span-6'
      : 'col-span-12 md:col-span-6 lg:col-span-4';

  const handleExportPNG = async () => {
    setIsExportingPNG(true);
    setShowMenu(false);
    const cardId = `widget-card-${widget.id}`;
    const safeName = widget.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const success = await exportElementAsPNG(cardId, `${safeName}_chart`);
    setIsExportingPNG(false);

    if (success) {
      setDownloadSuccess('PNG Exported');
      setTimeout(() => setDownloadSuccess(null), 2500);
    }
  };

  const handleExportCSV = () => {
    setShowMenu(false);
    const aggregated = aggregateWidgetData(records, widget);
    const safeName = widget.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    exportWidgetAsCSV(aggregated, widget, `${safeName}_aggregated.csv`);
    setDownloadSuccess('CSV Exported');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div
      id={`widget-card-${widget.id}`}
      className={`relative bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 shadow-xs transition-all hover:border-slate-700/80 flex flex-col justify-between ${colSpanClass}`}
    >
      {/* Widget Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 truncate tracking-tight">
              {widget.title}
            </h3>
            {downloadSuccess && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                <Check className="w-2.5 h-2.5" />
                {downloadSuccess}
              </span>
            )}
          </div>

          {/* Clean unboxed metadata (anti-slop rule) */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
            {widget.chartType !== 'kpi' && (
              <>
                <span className="truncate">{widget.dimension}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
              </>
            )}
            <span className="capitalize">{widget.aggregation}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 truncate">{widget.metric}</span>
          </div>

          {widget.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {widget.description}
            </p>
          )}
        </div>

        {/* Action Controls - tagged with no-export so html2canvas ignores buttons */}
        <div className="flex items-center gap-1 shrink-0 no-export" data-no-export="true">
          {/* Quick Chart Switcher for compatible non-KPI charts */}
          {widget.chartType !== 'kpi' && widget.chartType !== 'heatmap' && (
            <div className="hidden sm:flex items-center bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/40">
              {chartTypeIcons.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => onQuickChartTypeChange(widget.id, ct.type)}
                  title={`Switch to ${ct.label}`}
                  className={`p-1.5 rounded-md transition-colors ${
                    widget.chartType === ct.type
                      ? 'bg-slate-700 text-indigo-300 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ct.icon}
                </button>
              ))}
            </div>
          )}

          {/* Expand / Shrink Width */}
          <button
            onClick={() => onToggleWidth(widget.id)}
            title={widget.colSpan >= 8 ? 'Shrink width' : 'Expand width'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {widget.colSpan >= 8 ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(widget)}
            title="Configure Widget"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="More options & export"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-30 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Export Options
                  </div>

                  <button
                    onClick={handleExportPNG}
                    disabled={isExportingPNG}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    <Image className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download Chart as PNG</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Chart Data (CSV)</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Widget Actions
                  </div>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(widget);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    Edit Configuration
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicate(widget);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Duplicate Widget
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    disabled={!canMovePrev}
                    onClick={() => {
                      setShowMenu(false);
                      onMove(widget.id, 'prev');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    Move Backward
                  </button>

                  <button
                    disabled={!canMoveNext}
                    onClick={() => {
                      setShowMenu(false);
                      onMove(widget.id, 'next');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    Move Forward
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(widget.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Remove Widget
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Widget Body / Chart */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <ChartRenderer
          records={records}
          config={widget}
          columns={columns}
          onFilterSelect={onFilterSelect}
        />
      </div>
    </div>
  );
};
