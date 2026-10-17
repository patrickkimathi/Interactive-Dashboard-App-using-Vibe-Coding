import React, { useState, useMemo, useEffect } from 'react';
import {
  Dataset,
  WidgetConfig,
  GlobalFilterState,
  ChartType,
  DataRecord,
} from './types/dashboard';
import {
  ALL_DATASETS,
  SALES_DATASET,
  SAAS_DATASET,
  MARKETING_DATASET,
  DEFAULT_SALES_WIDGETS,
} from './data/sampleDatasets';
import { filterRecords, inferColumns } from './utils/dataEngine';
import { Header } from './components/Header';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { FilterBar } from './components/FilterBar';
import { WidgetGrid } from './components/WidgetGrid';
import { WidgetEditorModal } from './components/WidgetEditorModal';
import { DataManagerModal } from './components/DataManagerModal';
import { ExportModal } from './components/ExportModal';

// Template widgets for SaaS dataset
const DEFAULT_SAAS_WIDGETS: WidgetConfig[] = [
  {
    id: 'saas_kpi_mrr',
    title: 'Monthly Recurring Revenue (MRR)',
    description: 'Current recurring subscription run-rate',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'tier',
    metric: 'mrr',
    aggregation: 'sum',
    colorPalette: 'indigo',
    prefix: '$',
    benchmarkGoal: 500000,
  },
  {
    id: 'saas_kpi_users',
    title: 'Total Active Subscribers',
    description: 'Platform licensed seats and accounts',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'tier',
    metric: 'active_users',
    aggregation: 'sum',
    colorPalette: 'emerald',
    benchmarkGoal: 200000,
  },
  {
    id: 'saas_kpi_nps',
    title: 'Net Promoter Score (NPS)',
    description: 'Customer loyalty and sentiment benchmark',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'region',
    metric: 'nps',
    aggregation: 'avg',
    colorPalette: 'amber',
    suffix: 'pts',
    benchmarkGoal: 70,
  },
  {
    id: 'saas_mrr_by_tier_bar',
    title: 'MRR Contribution by Subscription Tier',
    description: 'Revenue split among Starter, Pro, and Enterprise',
    chartType: 'bar',
    colSpan: 6,
    dimension: 'tier',
    metric: 'mrr',
    aggregation: 'sum',
    colorPalette: 'indigo',
    sortBy: 'value_desc',
    showGrid: true,
    prefix: '$',
  },
  {
    id: 'saas_tier_share_donut',
    title: 'Active User Distribution',
    description: 'Proportion of active user base per tier',
    chartType: 'donut',
    colSpan: 6,
    dimension: 'tier',
    metric: 'active_users',
    aggregation: 'sum',
    colorPalette: 'cyan',
    sortBy: 'value_desc',
  },
  {
    id: 'saas_mrr_timeline',
    title: 'Monthly Recurring Revenue Growth Timeline',
    description: 'Trajectory of recurring revenue by monthly cohort',
    chartType: 'area',
    colSpan: 8,
    dimension: 'month',
    metric: 'mrr',
    aggregation: 'sum',
    colorPalette: 'indigo',
    sortBy: 'label_asc',
    showGrid: true,
    prefix: '$',
  },
  {
    id: 'saas_churn_radar',
    title: 'Regional Churn Mitigation Profile',
    description: 'Average churn rate across geographical branches',
    chartType: 'radar',
    colSpan: 4,
    dimension: 'region',
    metric: 'churn_rate',
    aggregation: 'avg',
    colorPalette: 'rose',
    suffix: '%',
  },
  {
    id: 'saas_cohort_table',
    title: 'Monthly Cohort & Tier Breakdown Ledger',
    description: 'Granular analytical table with user counts and ARRs',
    chartType: 'table',
    colSpan: 12,
    dimension: 'tier',
    metric: 'arr',
    aggregation: 'sum',
    colorPalette: 'monochrome',
    prefix: '$',
  },
];

// Template widgets for Marketing dataset
const DEFAULT_MARKETING_WIDGETS: WidgetConfig[] = [
  {
    id: 'mkt_kpi_spend',
    title: 'Total Advertising Outlay',
    description: 'Aggregate campaign media investment',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'channel',
    metric: 'spend',
    aggregation: 'sum',
    colorPalette: 'rose',
    prefix: '$',
    benchmarkGoal: 150000,
  },
  {
    id: 'mkt_kpi_conversions',
    title: 'Total Inbound Conversions',
    description: 'Direct qualified sign-ups and leads',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'channel',
    metric: 'conversions',
    aggregation: 'sum',
    colorPalette: 'emerald',
    benchmarkGoal: 10000,
  },
  {
    id: 'mkt_kpi_roas',
    title: 'Average ROAS Multiplier',
    description: 'Return on ad spend across active campaigns',
    chartType: 'kpi',
    colSpan: 4,
    dimension: 'channel',
    metric: 'roas',
    aggregation: 'avg',
    colorPalette: 'amber',
    suffix: 'x',
    benchmarkGoal: 5.0,
  },
  {
    id: 'mkt_spend_bar',
    title: 'Media Spend Distribution by Channel',
    description: 'Capital deployment across search, social, and outbound',
    chartType: 'bar',
    colSpan: 6,
    dimension: 'channel',
    metric: 'spend',
    aggregation: 'sum',
    colorPalette: 'rose',
    sortBy: 'value_desc',
    showGrid: true,
    prefix: '$',
  },
  {
    id: 'mkt_conversion_donut',
    title: 'Acquisition Share by Channel',
    description: 'Relative percentage of inbound customer conversions',
    chartType: 'donut',
    colSpan: 6,
    dimension: 'channel',
    metric: 'conversions',
    aggregation: 'sum',
    colorPalette: 'emerald',
    sortBy: 'value_desc',
  },
  {
    id: 'mkt_funnel_progression',
    title: 'Audience Conversion Funnel',
    description: 'Acquisition efficiency across customer segments',
    chartType: 'funnel',
    colSpan: 6,
    dimension: 'channel',
    metric: 'clicks',
    aggregation: 'sum',
    colorPalette: 'indigo',
  },
  {
    id: 'mkt_spend_scatter',
    title: 'Spend vs Conversion Correlation',
    description: 'Efficiency scatter across marketing initiatives',
    chartType: 'scatter',
    colSpan: 6,
    dimension: 'campaign',
    metric: 'conversions',
    aggregation: 'sum',
    colorPalette: 'amber',
  },
  {
    id: 'mkt_summary_table',
    title: 'Channel Efficiency & CPA Performance Matrix',
    description: 'Performance overview sorted by gross conversions',
    chartType: 'table',
    colSpan: 12,
    dimension: 'channel',
    metric: 'conversions',
    aggregation: 'sum',
    colorPalette: 'monochrome',
  },
];

export default function App() {
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>(ALL_DATASETS);
  const [activeDataset, setActiveDataset] = useState<Dataset>(SALES_DATASET);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_SALES_WIDGETS);

  // Active top navigation tab
  const [activeNavView, setActiveNavView] = useState<string>('all');

  // Filter State
  const [filters, setFilters] = useState<GlobalFilterState>({
    dateRange: { preset: 'all' },
    categorical: {},
    searchQuery: '',
  });

  // Modal Visibility
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isWidgetEditorOpen, setIsWidgetEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Switch dataset helper
  const handleSelectDataset = (dataset: Dataset) => {
    setActiveDataset(dataset);
    setFilters({
      dateRange: { preset: 'all' },
      categorical: {},
      searchQuery: '',
    });

    // Load appropriate widgets
    if (dataset.id === 'sales_revenue') {
      setWidgets(DEFAULT_SALES_WIDGETS);
    } else if (dataset.id === 'saas_growth') {
      setWidgets(DEFAULT_SAAS_WIDGETS);
    } else if (dataset.id === 'marketing_performance') {
      setWidgets(DEFAULT_MARKETING_WIDGETS);
    } else {
      // Auto-adapt widgets for custom dataset
      generateCustomDatasetWidgets(dataset);
    }
  };

  // Automatically generate balanced widgets for any user-uploaded or pasted dataset
  const generateCustomDatasetWidgets = (dataset: Dataset) => {
    const numCols = dataset.columns.filter((c) => c.type === 'number');
    const catCols = dataset.columns.filter((c) => c.type === 'string');
    const dateCol = dataset.columns.find((c) => c.type === 'date');

    const primaryMetric = numCols[0]?.key || '__count__';
    const secondaryMetric = numCols[1]?.key || primaryMetric;
    const primaryDim = catCols[0]?.key || dataset.columns[0]?.key || 'category';
    const secondaryDim = catCols[1]?.key || primaryDim;

    const newWidgets: WidgetConfig[] = [
      {
        id: `custom_kpi_1_${Date.now()}`,
        title: `Total ${numCols[0]?.label || 'Records'}`,
        description: 'Primary aggregated metric',
        chartType: 'kpi',
        colSpan: 6,
        dimension: primaryDim,
        metric: primaryMetric,
        aggregation: 'sum',
        colorPalette: 'indigo',
        prefix: numCols[0]?.isCurrency ? '$' : undefined,
        suffix: numCols[0]?.isPercentage ? '%' : undefined,
      },
      {
        id: `custom_kpi_2_${Date.now()}`,
        title: `Average ${numCols[1]?.label || numCols[0]?.label || 'Metric'}`,
        description: 'Mean calculation across filtered population',
        chartType: 'kpi',
        colSpan: 6,
        dimension: secondaryDim,
        metric: secondaryMetric,
        aggregation: 'avg',
        colorPalette: 'emerald',
        prefix: numCols[1]?.isCurrency ? '$' : undefined,
        suffix: numCols[1]?.isPercentage ? '%' : undefined,
      },
      {
        id: `custom_bar_${Date.now()}`,
        title: `${numCols[0]?.label || 'Metric'} by ${catCols[0]?.label || 'Dimension'}`,
        description: 'Categorical distribution breakdown',
        chartType: 'bar',
        colSpan: 6,
        dimension: primaryDim,
        metric: primaryMetric,
        aggregation: 'sum',
        colorPalette: 'indigo',
        sortBy: 'value_desc',
        showGrid: true,
        prefix: numCols[0]?.isCurrency ? '$' : undefined,
      },
      {
        id: `custom_donut_${Date.now()}`,
        title: `Proportion by ${catCols[0]?.label || 'Dimension'}`,
        description: 'Relative contribution to grand total',
        chartType: 'donut',
        colSpan: 6,
        dimension: primaryDim,
        metric: primaryMetric,
        aggregation: 'sum',
        colorPalette: 'cyan',
        sortBy: 'value_desc',
        prefix: numCols[0]?.isCurrency ? '$' : undefined,
      },
    ];

    if (dateCol) {
      newWidgets.push({
        id: `custom_timeline_${Date.now()}`,
        title: `${numCols[0]?.label || 'Value'} Chronological Trajectory`,
        description: 'Time series analysis over observation dates',
        chartType: 'area',
        colSpan: 12,
        dimension: dateCol.key,
        metric: primaryMetric,
        aggregation: 'sum',
        colorPalette: 'indigo',
        sortBy: 'label_asc',
        showGrid: true,
        prefix: numCols[0]?.isCurrency ? '$' : undefined,
      });
    }

    newWidgets.push({
      id: `custom_table_${Date.now()}`,
      title: 'Aggregated Dimension Ledger Table',
      description: 'Group-by summary with relative contribution bars',
      chartType: 'table',
      colSpan: 12,
      dimension: primaryDim,
      metric: primaryMetric,
      aggregation: 'sum',
      colorPalette: 'monochrome',
      prefix: numCols[0]?.isCurrency ? '$' : undefined,
    });

    setWidgets(newWidgets);
  };

  // Custom dataset apply callback
  const handleApplyCustomDataset = (newDataset: Dataset) => {
    setAvailableDatasets((prev) => [newDataset, ...prev]);
    setActiveDataset(newDataset);
    generateCustomDatasetWidgets(newDataset);
    setFilters({
      dateRange: { preset: 'all' },
      categorical: {},
      searchQuery: '',
    });
  };

  // Update records in-place (e.g. from live spreadsheet editor)
  const handleUpdateActiveRecords = (updatedRecords: DataRecord[]) => {
    const updatedColumns = inferColumns(updatedRecords);
    const updatedDataset: Dataset = {
      ...activeDataset,
      records: updatedRecords,
      columns: updatedColumns,
    };

    setActiveDataset(updatedDataset);
    setAvailableDatasets((prev) =>
      prev.map((d) => (d.id === activeDataset.id ? updatedDataset : d))
    );
  };

  // Nav View Handler
  const handleNavSelect = (view: string) => {
    setActiveNavView(view);
    if (view === 'sales') {
      handleSelectDataset(SALES_DATASET);
    } else if (view === 'saas') {
      handleSelectDataset(SAAS_DATASET);
    } else if (view === 'marketing') {
      handleSelectDataset(MARKETING_DATASET);
    }
  };

  // Widget management handlers
  const handleSaveWidget = (savedWidget: WidgetConfig) => {
    setWidgets((prev) => {
      const exists = prev.some((w) => w.id === savedWidget.id);
      if (exists) {
        return prev.map((w) => (w.id === savedWidget.id ? savedWidget : w));
      }
      return [savedWidget, ...prev];
    });
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleDuplicateWidget = (widgetToDup: WidgetConfig) => {
    const dup: WidgetConfig = {
      ...widgetToDup,
      id: `widget_${Date.now()}`,
      title: `${widgetToDup.title} (Copy)`,
    };
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === widgetToDup.id);
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  };

  const handleMoveWidget = (widgetId: string, direction: 'prev' | 'next') => {
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === widgetId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
  };

  const handleQuickChartTypeChange = (widgetId: string, newType: ChartType) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, chartType: newType } : w))
    );
  };

  const handleToggleWidgetWidth = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w;
        let nextSpan: 4 | 6 | 8 | 12 = 6;
        if (w.colSpan === 4) nextSpan = 6;
        else if (w.colSpan === 6) nextSpan = 12;
        else if (w.colSpan === 8) nextSpan = 12;
        else nextSpan = 4;
        return { ...w, colSpan: nextSpan };
      })
    );
  };

  const handleInteractiveFilterSelect = (dimensionKey: string, value: string) => {
    const currentList = filters.categorical[dimensionKey] || [];
    let updated: string[];

    if (currentList.includes(value)) {
      updated = currentList.filter((item) => item !== value);
    } else {
      updated = [...currentList, value];
    }

    const newCategorical = { ...filters.categorical };
    if (updated.length === 0) {
      delete newCategorical[dimensionKey];
    } else {
      newCategorical[dimensionKey] = updated;
    }

    setFilters({
      ...filters,
      categorical: newCategorical,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: { preset: 'all' },
      categorical: {},
      searchQuery: '',
    });
  };

  const handleResetLayout = () => {
    if (activeDataset.id === 'sales_revenue') {
      setWidgets(DEFAULT_SALES_WIDGETS);
    } else if (activeDataset.id === 'saas_growth') {
      setWidgets(DEFAULT_SAAS_WIDGETS);
    } else if (activeDataset.id === 'marketing_performance') {
      setWidgets(DEFAULT_MARKETING_WIDGETS);
    } else {
      generateCustomDatasetWidgets(activeDataset);
    }
  };

  // Filtered records computed with real-time reactivity
  const filteredRecords = useMemo(() => {
    return filterRecords(
      activeDataset.records,
      filters,
      activeDataset.columns,
      activeDataset.defaultDateColumn
    );
  }, [activeDataset, filters]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Strict Top Bar Contract Header */}
      <Header
        activeView={activeNavView}
        onSelectView={handleNavSelect}
        onOpenDataManager={() => setIsDataManagerOpen(true)}
        onAddWidget={() => {
          setEditingWidget(null);
          setIsWidgetEditorOpen(true);
        }}
        onExport={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Body */}
      <main id="dashboard-content-area" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workspace Toolbar with context & action controls */}
        <WorkspaceToolbar
          dataset={activeDataset}
          totalWidgetsCount={widgets.length}
          onAddWidget={() => {
            setEditingWidget(null);
            setIsWidgetEditorOpen(true);
          }}
          onOpenDataManager={() => setIsDataManagerOpen(true)}
          onExport={() => setIsExportOpen(true)}
          onResetLayout={handleResetLayout}
        />

        {/* Real-Time Filter Bar */}
        <FilterBar
          filters={filters}
          columns={activeDataset.columns}
          totalRecordsCount={activeDataset.records.length}
          filteredRecordsCount={filteredRecords.length}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Dynamic 12-Column Responsive Widget Grid */}
        <WidgetGrid
          widgets={widgets}
          records={filteredRecords}
          columns={activeDataset.columns}
          onEditWidget={(w) => {
            setEditingWidget(w);
            setIsWidgetEditorOpen(true);
          }}
          onDeleteWidget={handleDeleteWidget}
          onDuplicateWidget={handleDuplicateWidget}
          onMoveWidget={handleMoveWidget}
          onQuickChartTypeChange={handleQuickChartTypeChange}
          onToggleWidth={handleToggleWidgetWidth}
          onFilterSelect={handleInteractiveFilterSelect}
          onAddWidget={() => {
            setEditingWidget(null);
            setIsWidgetEditorOpen(true);
          }}
        />
      </main>

      {/* Modals */}
      <WidgetEditorModal
        isOpen={isWidgetEditorOpen}
        widget={editingWidget}
        columns={activeDataset.columns}
        onSave={handleSaveWidget}
        onClose={() => {
          setIsWidgetEditorOpen(false);
          setEditingWidget(null);
        }}
      />

      <DataManagerModal
        isOpen={isDataManagerOpen}
        activeDataset={activeDataset}
        availableDatasets={availableDatasets}
        onSelectDataset={handleSelectDataset}
        onApplyCustomDataset={handleApplyCustomDataset}
        onUpdateActiveRecords={handleUpdateActiveRecords}
        onClose={() => setIsDataManagerOpen(false)}
      />

      <ExportModal
        isOpen={isExportOpen}
        records={filteredRecords}
        columns={activeDataset.columns}
        datasetName={activeDataset.name}
        filters={filters}
        totalRecordsCount={activeDataset.records.length}
        dashboardElementId="dashboard-content-area"
        onClose={() => setIsExportOpen(false)}
      />

      {/* Quiet, clean editorial footer (per Constitution Section 1.B) */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Vantage Data Studio</span>
            <span>·</span>
            <span>Client-side analytical computation engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDataManagerOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Dataset Hub
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleResetLayout}
              className="hover:text-slate-300 transition-colors"
            >
              Reset Layout
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
