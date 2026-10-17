import React, { useState } from 'react';
import { Dataset, DataRecord, ColumnMeta } from '../types/dashboard';
import { parseCSV, parseJSON, inferColumns } from '../utils/dataEngine';
import {
  X,
  Upload,
  FileText,
  Table as TableIcon,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Database,
  RefreshCw,
} from 'lucide-react';

interface DataManagerModalProps {
  isOpen: boolean;
  activeDataset: Dataset;
  availableDatasets: Dataset[];
  onSelectDataset: (dataset: Dataset) => void;
  onApplyCustomDataset: (dataset: Dataset) => void;
  onUpdateActiveRecords: (records: DataRecord[]) => void;
  onClose: () => void;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  isOpen,
  activeDataset,
  availableDatasets,
  onSelectDataset,
  onApplyCustomDataset,
  onUpdateActiveRecords,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'table' | 'presets'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [datasetName, setDatasetName] = useState('My Custom Dataset');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    records: DataRecord[];
    columns: ColumnMeta[];
  } | null>(null);

  // Table editor state
  const [tableSearch, setTableSearch] = useState('');
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle previewing pasted CSV/JSON
  const handlePreviewPasted = () => {
    setParseError(null);
    if (!pastedText.trim()) {
      setParseError('Please enter or paste CSV or JSON data first.');
      return;
    }

    try {
      const trimmed = pastedText.trim();
      let records: DataRecord[] = [];

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        records = parseJSON(trimmed);
      } else {
        records = parseCSV(trimmed);
      }

      if (!records || records.length === 0) {
        setParseError('No records could be extracted. Please check the header row and format.');
        return;
      }

      const columns = inferColumns(records);
      setParsedPreview({ records, columns });
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse data.');
    }
  };

  // Apply parsed data to dashboard
  const handleApplyPasted = () => {
    if (!parsedPreview || parsedPreview.records.length === 0) return;

    const numCol = parsedPreview.columns.find((c) => c.type === 'number')?.key;
    const catCol = parsedPreview.columns.find((c) => c.type === 'string' || c.type === 'date')?.key;

    const newDataset: Dataset = {
      id: `custom_${Date.now()}`,
      name: datasetName.trim() || 'Imported Dataset',
      category: 'Custom Data',
      description: `User-provided dataset with ${parsedPreview.records.length} records and ${parsedPreview.columns.length} columns.`,
      records: parsedPreview.records,
      columns: parsedPreview.columns,
      defaultDateColumn: parsedPreview.columns.find((c) => c.type === 'date')?.key,
      defaultMetricColumn: numCol,
      defaultDimensionColumn: catCol,
    };

    onApplyCustomDataset(newDataset);
    onClose();
  };

  // Handle file drop/upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedText(content);
        setActiveTab('paste');
        try {
          let records: DataRecord[] = [];
          if (file.name.endsWith('.json')) {
            records = parseJSON(content);
          } else {
            records = parseCSV(content);
          }
          if (records.length > 0) {
            const columns = inferColumns(records);
            setParsedPreview({ records, columns });
          }
        } catch (err: any) {
          setParseError(err.message || 'Could not parse uploaded file');
        }
      }
    };
    reader.readAsText(file);
  };

  // Live table edits
  const handleCellChange = (rowIndex: number, columnKey: string, newValue: string) => {
    const updated = [...activeDataset.records];
    const oldVal = updated[rowIndex][columnKey];

    // Preserve type if numeric
    if (typeof oldVal === 'number') {
      const num = Number(newValue);
      updated[rowIndex][columnKey] = !isNaN(num) ? num : newValue;
    } else {
      updated[rowIndex][columnKey] = newValue;
    }

    onUpdateActiveRecords(updated);
  };

  const handleAddNewRow = () => {
    const newRow: DataRecord = {};
    activeDataset.columns.forEach((col) => {
      if (col.type === 'number') newRow[col.key] = 0;
      else if (col.type === 'date') newRow[col.key] = new Date().toISOString().split('T')[0];
      else if (col.type === 'boolean') newRow[col.key] = false;
      else newRow[col.key] = 'New Entry';
    });

    onUpdateActiveRecords([newRow, ...activeDataset.records]);
    setEditingRowIdx(0);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updated = activeDataset.records.filter((_, idx) => idx !== rowIndex);
    onUpdateActiveRecords(updated);
  };

  const filteredRecordsForTable = activeDataset.records.filter((r) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase().trim();
    return Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Dataset & Data Input Manager
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active: <span className="text-slate-200 font-medium">{activeDataset.name}</span> ({activeDataset.records.length} records · {activeDataset.columns.length} columns)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'paste'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Raw Data (CSV / JSON)
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File (.csv / .json)
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'table'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Live Data Spreadsheet ({activeDataset.records.length})
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Preset Industry Datasets
          </button>
        </div>

        {/* Tab 1: Paste CSV / JSON */}
        {activeTab === 'paste' && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="mt-1 w-64 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Sample format shortcuts */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Insert Sample:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPastedText(`date,region,category,sales,profit,units\n2026-01-10,North America,Hardware,42000,12600,84\n2026-01-15,Europe,Cloud,68000,27200,120\n2026-02-01,Asia-Pacific,Services,31000,9300,45\n2026-02-18,North America,Cloud,89000,35600,160\n2026-03-05,Europe,Hardware,54000,16200,92\n2026-03-22,Latin America,Services,28000,8400,38`);
                    setParseError(null);
                  }}
                  className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                >
                  Sales CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPastedText(JSON.stringify([
                      { month: "2026-01", channel: "Search Ads", spend: 18000, conversions: 920, revenue: 54000 },
                      { month: "2026-01", channel: "Social Ads", spend: 24000, conversions: 1150, revenue: 68000 },
                      { month: "2026-02", channel: "Search Ads", spend: 22000, conversions: 1100, revenue: 64000 },
                      { month: "2026-02", channel: "Email", spend: 3500, conversions: 780, revenue: 46000 }
                    ], null, 2));
                    setParseError(null);
                  }}
                  className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                >
                  Marketing JSON
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Paste your data below (CSV with header row or JSON array):
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setParsedPreview(null);
                }}
                rows={9}
                placeholder={`date,product,region,revenue,quantity\n2026-01-01,Widget Pro,East,12500,50\n2026-01-02,Widget Plus,West,8400,30\n...`}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 selection:bg-indigo-500/40"
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Validation & Preview Card */}
            {parsedPreview && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Successfully parsed {parsedPreview.records.length} records across {parsedPreview.columns.length} columns
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyPasted}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Populate Dashboard with this Data
                  </button>
                </div>

                {/* Detected Columns Badges */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900">
                  {parsedPreview.columns.map((col) => (
                    <div
                      key={col.key}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] font-mono"
                    >
                      <span className="text-slate-300 font-medium">{col.label}</span>{' '}
                      <span className="text-slate-500">({col.type})</span>
                    </div>
                  ))}
                </div>

                {/* Sample Rows Preview */}
                <div className="overflow-x-auto max-h-36 border border-slate-800 rounded-md">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        {parsedPreview.columns.map((c) => (
                          <th key={c.key} className="py-1.5 px-2.5 whitespace-nowrap">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedPreview.records.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60">
                          {parsedPreview.columns.map((c) => (
                            <td key={c.key} className="py-1.5 px-2.5 whitespace-nowrap">
                              {String(row[c.key] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handlePreviewPasted}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                Validate & Preview Data
              </button>
              {parsedPreview && (
                <button
                  type="button"
                  onClick={handleApplyPasted}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Load into Dashboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: File Upload */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-8 flex flex-col items-center text-center transition-colors bg-slate-950/40">
              <Upload className="w-12 h-12 text-slate-500 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">
                Upload CSV or JSON file
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Drag and drop your spreadsheet or export file here, or click to browse from your computer.
              </p>

              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors shadow-xs">
                <span>Select File from Computer</span>
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-[11px] text-slate-500 mt-4">
                Supported formats: Standard Comma-Separated Values (.csv) and JSON arrays (.json)
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Live Spreadsheet Editor */}
        {activeTab === 'table' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Table Actions Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-56 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredRecordsForTable.length} of {activeDataset.records.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddNewRow}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
              </div>
            </div>

            {/* Editable Spreadsheet Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 text-slate-400 font-medium z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center text-slate-600">#</th>
                    {activeDataset.columns.map((col) => (
                      <th key={col.key} className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{col.label}</span>
                          <span className="text-[10px] text-slate-600 font-mono">
                            ({col.type})
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-300">
                  {filteredRecordsForTable.map((row, rIdx) => {
                    const isEditing = editingRowIdx === rIdx;

                    return (
                      <tr
                        key={rIdx}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isEditing ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-600 text-[11px]">
                          {rIdx + 1}
                        </td>
                        {activeDataset.columns.map((col) => {
                          const val = row[col.key];

                          return (
                            <td key={col.key} className="py-1 px-2 whitespace-nowrap">
                              <input
                                type={col.type === 'number' ? 'number' : 'text'}
                                value={val !== undefined && val !== null ? String(val) : ''}
                                onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                                onFocus={() => setEditingRowIdx(rIdx)}
                                className="w-full bg-transparent hover:bg-slate-800 focus:bg-slate-950 focus:border-indigo-500 border border-transparent rounded px-1.5 py-1 text-xs text-slate-200 focus:outline-hidden transition-colors"
                              />
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteRow(rIdx)}
                            title="Delete row"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Switch Preset Dataset */}
        {activeTab === 'presets' && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Choose Pre-loaded Industry Benchmark Datasets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableDatasets.map((ds) => {
                const isSelected = activeDataset.id === ds.id;

                return (
                  <div
                    key={ds.id}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{ds.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{ds.description}</div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <span>{ds.records.length} records</span>
                        <span>·</span>
                        <span>{ds.columns.length} columns</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {isSelected ? (
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Active Dataset
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDataset(ds);
                            onClose();
                          }}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Switch to this Dataset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs">
          <span className="text-slate-400">
            Real-time synchronization: edits immediately re-render all configured charts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
