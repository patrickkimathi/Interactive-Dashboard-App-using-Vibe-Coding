import React, { useState } from 'react';
import { DataRecord, ColumnMeta, GlobalFilterState } from '../types/dashboard';
import { downloadCSV, downloadJSON } from '../utils/dataEngine';
import { exportDashboardAsPDF, exportElementAsPNG } from '../utils/exportUtils';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Image,
  Printer,
  Check,
  Loader2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  records: DataRecord[];
  columns: ColumnMeta[];
  datasetName: string;
  filters: GlobalFilterState;
  totalRecordsCount: number;
  dashboardElementId?: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  records,
  columns,
  datasetName,
  filters,
  totalRecordsCount,
  dashboardElementId = 'dashboard-content-area',
  onClose,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setSuccessMessage(null);

    const success = await exportDashboardAsPDF({
      dashboardElementId,
      datasetName,
      filters,
      columns,
      totalRecordsCount,
      filteredRecordsCount: records.length,
    });

    setIsGeneratingPDF(false);
    if (success) {
      setSuccessMessage('Offline PDF Report generated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }
  };

  const handleDownloadDashboardPNG = async () => {
    setIsGeneratingPNG(true);
    setSuccessMessage(null);

    const safeName = datasetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const success = await exportElementAsPNG(dashboardElementId, `${safeName}_dashboard_overview`);

    setIsGeneratingPNG(false);
    if (success) {
      setSuccessMessage('Full Dashboard PNG exported successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }
  };

  const handleDownloadCSV = () => {
    downloadCSV(records, `${datasetName.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    setSuccessMessage('CSV data exported successfully!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleDownloadJSON = () => {
    downloadJSON(records, `${datasetName.toLowerCase().replace(/\s+/g, '_')}_export.json`);
    setSuccessMessage('JSON data exported successfully!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleBrowserPrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              Export Dashboard & Visual Charts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate offline reports in PDF, PNG image, or CSV spreadsheet formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="space-y-2.5 pt-1">
          {/* 1. PDF Executive Report */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>Executive PDF Report (.pdf)</span>
                  <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                    Offline
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Branded executive summary with active filters, KPIs, and chart graphics
                </div>
              </div>
            </div>
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* 2. PNG Visual Snapshot */}
          <button
            onClick={handleDownloadDashboardPNG}
            disabled={isGeneratingPNG}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Dashboard Overview PNG (.png)
                </div>
                <div className="text-[11px] text-slate-400">
                  High-resolution 2x canvas screenshot suitable for slide decks
                </div>
              </div>
            </div>
            {isGeneratingPNG ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* 3. CSV Dataset Export */}
          <button
            onClick={handleDownloadCSV}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Filtered Records Spreadsheet (.csv)
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {records.length} records · Compatible with Microsoft Excel, Sheets, R, Python
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          {/* 4. JSON Raw Export */}
          <button
            onClick={handleDownloadJSON}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Structured JSON Document (.json)
                </div>
                <div className="text-[11px] text-slate-400">
                  Raw document array for software integration and backend pipelines
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          {/* 5. Browser Print / PDF */}
          <button
            onClick={handleBrowserPrint}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 text-slate-300 rounded-lg group-hover:bg-slate-700 transition-colors">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Print to PDF via Browser
                </div>
                <div className="text-[11px] text-slate-400">
                  Opens browser system print dialog formatted for Letter / A4 paper
                </div>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-500">
          <span>Targeting {records.length} currently active records</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
