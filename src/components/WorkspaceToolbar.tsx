import React from 'react';
import { Dataset } from '../types/dashboard';
import { Plus, Database, Download, RotateCcw, Layers } from 'lucide-react';

interface WorkspaceToolbarProps {
  dataset: Dataset;
  totalWidgetsCount: number;
  onAddWidget: () => void;
  onOpenDataManager: () => void;
  onExport: () => void;
  onResetLayout: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  dataset,
  totalWidgetsCount,
  onAddWidget,
  onOpenDataManager,
  onExport,
  onResetLayout,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-800/80">
      {/* Breadcrumb & active dataset label */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Datasets</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400">{dataset.category || 'General'}</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
          {dataset.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          {dataset.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onAddWidget}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Widget</span>
        </button>

        <button
          onClick={onOpenDataManager}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Edit Data ({dataset.records.length})</span>
        </button>

        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
        </button>

        <button
          onClick={onResetLayout}
          title="Reset default widgets layout"
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
