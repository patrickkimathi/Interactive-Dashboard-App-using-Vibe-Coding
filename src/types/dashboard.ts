export type ColumnType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  key: string;
  label: string;
  type: ColumnType;
  uniqueValues?: string[];
  min?: number;
  max?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export type DataRecord = Record<string, string | number | boolean | null | undefined>;

export interface Dataset {
  id: string;
  name: string;
  category: string;
  description: string;
  records: DataRecord[];
  columns: ColumnMeta[];
  defaultDateColumn?: string;
  defaultMetricColumn?: string;
  defaultDimensionColumn?: string;
}

export type ChartType =
  | 'kpi'
  | 'bar'
  | 'stacked_bar'
  | 'horizontal_bar'
  | 'line'
  | 'area'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'heatmap'
  | 'table';

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median';

export type PaletteName = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'monochrome';

export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  chartType: ChartType;
  colSpan: 4 | 6 | 8 | 12; // Grid column span out of 12
  dimension: string; // Grouping/X-axis
  secondaryDimension?: string; // Stacking / Heatmap row / breakdown
  metric: string; // Metric column
  aggregation: AggregationType;
  colorPalette: PaletteName;
  limit?: number; // Top N items
  sortBy?: 'value_desc' | 'value_asc' | 'label_asc';
  showGrid?: boolean;
  showLegend?: boolean;
  prefix?: string;
  suffix?: string;
  benchmarkGoal?: number;
}

export interface DateFilter {
  preset: 'all' | '30d' | '90d' | 'ytd' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface GlobalFilterState {
  dateRange: DateFilter;
  categorical: Record<string, string[]>; // columnKey -> array of selected values
  searchQuery: string;
  metricRange?: {
    columnKey: string;
    min?: number;
    max?: number;
  };
}

export interface AggregatedDataPoint {
  label: string;
  value: number;
  secondaryLabel?: string;
  count: number;
  rawRecords?: DataRecord[];
  [seriesKey: string]: any;
}
