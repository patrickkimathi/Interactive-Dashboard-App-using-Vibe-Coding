import {
  ColumnMeta,
  ColumnType,
  DataRecord,
  GlobalFilterState,
  WidgetConfig,
  AggregatedDataPoint,
  AggregationType,
} from '../types/dashboard';

/**
 * Automatically inspects records and infers column types, ranges, and formatting hints.
 */
export function inferColumns(records: DataRecord[]): ColumnMeta[] {
  if (!records || records.length === 0) return [];

  // Gather all unique keys across all records
  const keySet = new Set<string>();
  records.forEach((row) => {
    Object.keys(row).forEach((k) => keySet.add(k));
  });

  const columns: ColumnMeta[] = [];

  keySet.forEach((key) => {
    let numberCount = 0;
    let dateCount = 0;
    let booleanCount = 0;
    let validSampleCount = 0;

    let min = Infinity;
    let max = -Infinity;
    const uniqueValuesSet = new Set<string>();

    const sampleSize = Math.min(records.length, 200);

    for (let i = 0; i < sampleSize; i++) {
      const val = records[i][key];
      if (val === undefined || val === null || val === '') continue;

      validSampleCount++;
      const strVal = String(val).trim();

      // Check Boolean
      if (
        strVal.toLowerCase() === 'true' ||
        strVal.toLowerCase() === 'false' ||
        typeof val === 'boolean'
      ) {
        booleanCount++;
      }

      // Check Number (strip currency or % signs if present for inspection)
      const cleanedNumStr = strVal.replace(/[$,€£%]/g, '').trim();
      const numVal = Number(cleanedNumStr);
      if (!isNaN(numVal) && cleanedNumStr !== '') {
        numberCount++;
        if (numVal < min) min = numVal;
        if (numVal > max) max = numVal;
      }

      // Check Date
      if (isNaN(numVal)) {
        const parsedDate = Date.parse(strVal);
        if (
          !isNaN(parsedDate) &&
          (strVal.includes('-') || strVal.includes('/') || strVal.includes('20')) &&
          strVal.length >= 6
        ) {
          dateCount++;
        }
      }

      if (uniqueValuesSet.size < 50) {
        uniqueValuesSet.add(strVal);
      }
    }

    let type: ColumnType = 'string';
    if (validSampleCount > 0) {
      if (numberCount / validSampleCount > 0.8) {
        type = 'number';
      } else if (dateCount / validSampleCount > 0.7) {
        type = 'date';
      } else if (booleanCount / validSampleCount > 0.8) {
        type = 'boolean';
      }
    }

    const lowerKey = key.toLowerCase();
    const isCurrency =
      type === 'number' &&
      (lowerKey.includes('price') ||
        lowerKey.includes('revenue') ||
        lowerKey.includes('cost') ||
        lowerKey.includes('sales') ||
        lowerKey.includes('profit') ||
        lowerKey.includes('spend') ||
        lowerKey.includes('budget') ||
        lowerKey.includes('mrr') ||
        lowerKey.includes('arr') ||
        lowerKey.includes('amount') ||
        lowerKey.includes('ltv') ||
        lowerKey.includes('cac'));

    const isPercentage =
      type === 'number' &&
      (lowerKey.includes('pct') ||
        lowerKey.includes('rate') ||
        lowerKey.includes('percent') ||
        lowerKey.includes('margin') ||
        lowerKey.includes('ratio') ||
        lowerKey.includes('share') ||
        lowerKey.includes('roi') ||
        lowerKey.includes('roas'));

    // Label formatting: "first_name" -> "First Name", "orderDate" -> "Order Date"
    const label = key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    columns.push({
      key,
      label,
      type,
      uniqueValues: Array.from(uniqueValuesSet),
      min: min !== Infinity ? min : undefined,
      max: max !== -Infinity ? max : undefined,
      isCurrency,
      isPercentage,
    });
  });

  return columns;
}

/**
 * Parses CSV raw text into an array of DataRecords
 */
export function parseCSV(csvText: string): DataRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header line respecting quotes
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const records: DataRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = parseCSVLine(rawLine);
    const record: DataRecord = {};

    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index].trim() : '';
      val = val.replace(/^["']|["']$/g, '');

      // Try casting to number
      const cleaned = val.replace(/[$,€£]/g, '').trim();
      const num = Number(cleaned);
      if (val !== '' && !isNaN(num) && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(val)) {
        record[header] = num;
      } else if (val.toLowerCase() === 'true') {
        record[header] = true;
      } else if (val.toLowerCase() === 'false') {
        record[header] = false;
      } else {
        record[header] = val;
      }
    });

    records.push(record);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parses JSON into an array of DataRecords
 */
export function parseJSON(jsonText: string): DataRecord[] {
  try {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object') {
      // Find the first array property
      for (const val of Object.values(parsed)) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          return val as DataRecord[];
        }
      }
      return [parsed as DataRecord];
    }
    return [];
  } catch (err) {
    console.error('Invalid JSON provided:', err);
    throw new Error('Failed to parse JSON. Please verify the syntax.');
  }
}

/**
 * Applies real-time global filters to the dataset records
 */
export function filterRecords(
  records: DataRecord[],
  filters: GlobalFilterState,
  columns: ColumnMeta[],
  dateColumnKey?: string
): DataRecord[] {
  if (!records || records.length === 0) return [];

  const dateCol = dateColumnKey || columns.find((c) => c.type === 'date')?.key;

  return records.filter((row) => {
    // 1. Search query across all keys
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchesSearch = Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
      if (!matchesSearch) return false;
    }

    // 2. Date Filter
    if (dateCol && row[dateCol] && filters.dateRange.preset !== 'all') {
      const rowDateVal = String(row[dateCol]);
      const rowTimestamp = Date.parse(rowDateVal);

      if (!isNaN(rowTimestamp)) {
        const now = new Date();

        if (filters.dateRange.preset === '30d') {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
          if (rowTimestamp < past30) return false;
        } else if (filters.dateRange.preset === '90d') {
          const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).getTime();
          if (rowTimestamp < past90) return false;
        } else if (filters.dateRange.preset === 'ytd') {
          const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
          if (rowTimestamp < startOfYear) return false;
        } else if (filters.dateRange.preset === 'custom') {
          if (filters.dateRange.startDate) {
            const startLimit = Date.parse(filters.dateRange.startDate);
            if (!isNaN(startLimit) && rowTimestamp < startLimit) return false;
          }
          if (filters.dateRange.endDate) {
            const endLimit = Date.parse(filters.dateRange.endDate) + 24 * 60 * 60 * 1000;
            if (!isNaN(endLimit) && rowTimestamp > endLimit) return false;
          }
        }
      }
    }

    // 3. Categorical Filters
    for (const [colKey, selectedVals] of Object.entries(filters.categorical)) {
      if (selectedVals && selectedVals.length > 0) {
        const rowVal = String(row[colKey] ?? '');
        if (!selectedVals.includes(rowVal)) {
          return false;
        }
      }
    }

    // 4. Metric Range Thresholds
    if (filters.metricRange && filters.metricRange.columnKey) {
      const { columnKey, min, max } = filters.metricRange;
      const num = Number(row[columnKey]);
      if (!isNaN(num)) {
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
      }
    }

    return true;
  });
}

/**
 * Aggregates records for a specific widget configuration
 */
export function aggregateWidgetData(
  records: DataRecord[],
  widget: WidgetConfig
): AggregatedDataPoint[] {
  if (!records || records.length === 0) return [];

  const { dimension, secondaryDimension, metric, aggregation, sortBy, limit } = widget;

  // Group by primary dimension
  const groups = new Map<string, { values: number[]; records: DataRecord[]; subMap?: Map<string, number[]> }>();

  records.forEach((row) => {
    const rawDim = row[dimension];
    const dimLabel = rawDim !== null && rawDim !== undefined && String(rawDim).trim() !== ''
      ? String(rawDim)
      : 'Uncategorized';

    let metricVal = 1;
    if (metric && metric !== '__count__') {
      const rawMetric = row[metric];
      const parsed = typeof rawMetric === 'number' ? rawMetric : Number(String(rawMetric).replace(/[$,€£%]/g, ''));
      metricVal = !isNaN(parsed) ? parsed : 0;
    }

    if (!groups.has(dimLabel)) {
      groups.set(dimLabel, {
        values: [],
        records: [],
        subMap: secondaryDimension ? new Map<string, number[]>() : undefined,
      });
    }

    const group = groups.get(dimLabel)!;
    group.values.push(metricVal);
    group.records.push(row);

    if (secondaryDimension && group.subMap) {
      const rawSec = row[secondaryDimension];
      const secLabel = rawSec !== null && rawSec !== undefined && String(rawSec).trim() !== ''
        ? String(rawSec)
        : 'Other';

      if (!group.subMap.has(secLabel)) {
        group.subMap.set(secLabel, []);
      }
      group.subMap.get(secLabel)!.push(metricVal);
    }
  });

  // Calculate aggregated value
  const computeAgg = (vals: number[], agg: typeof aggregation): number => {
    if (!vals || vals.length === 0) return 0;
    if (agg === 'count') return vals.length;
    if (agg === 'sum') return vals.reduce((a, b) => a + b, 0);
    if (agg === 'avg') return vals.reduce((a, b) => a + b, 0) / vals.length;
    if (agg === 'max') return Math.max(...vals);
    if (agg === 'min') return Math.min(...vals);
    if (agg === 'median') {
      const sorted = [...vals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return vals.reduce((a, b) => a + b, 0);
  };

  const points: AggregatedDataPoint[] = [];

  groups.forEach((data, label) => {
    const value = computeAgg(data.values, aggregation);
    const point: AggregatedDataPoint = {
      label,
      value: Math.round(value * 100) / 100,
      count: data.values.length,
      rawRecords: data.records,
    };

    if (secondaryDimension && data.subMap) {
      data.subMap.forEach((subVals, subKey) => {
        point[subKey] = Math.round(computeAgg(subVals, aggregation) * 100) / 100;
      });
    }

    points.push(point);
  });

  // Sort points
  if (sortBy === 'value_desc') {
    points.sort((a, b) => b.value - a.value);
  } else if (sortBy === 'value_asc') {
    points.sort((a, b) => a.value - b.value);
  } else if (sortBy === 'label_asc') {
    points.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  } else {
    // Default: descending by value
    points.sort((a, b) => b.value - a.value);
  }

  // Apply limit
  if (limit && limit > 0 && points.length > limit) {
    return points.slice(0, limit);
  }

  return points;
}

/**
 * Calculates a single KPI metric value with optional previous period or benchmark comparison
 */
export function calculateKpi(
  records: DataRecord[],
  metricKey: string,
  aggregation: AggregationType
): { value: number; count: number; min: number; max: number; avg: number } {
  if (!records || records.length === 0) {
    return { value: 0, count: 0, min: 0, max: 0, avg: 0 };
  }

  const values: number[] = [];
  records.forEach((row) => {
    if (metricKey === '__count__') {
      values.push(1);
    } else {
      const raw = row[metricKey];
      const parsed = typeof raw === 'number' ? raw : Number(String(raw).replace(/[$,€£%]/g, ''));
      if (!isNaN(parsed)) values.push(parsed);
    }
  });

  if (values.length === 0) {
    return { value: 0, count: 0, min: 0, max: 0, avg: 0 };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  let finalValue = sum;
  if (aggregation === 'count') finalValue = values.length;
  else if (aggregation === 'avg') finalValue = avg;
  else if (aggregation === 'max') finalValue = max;
  else if (aggregation === 'min') finalValue = min;
  else if (aggregation === 'median') {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    finalValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return {
    value: Math.round(finalValue * 100) / 100,
    count: values.length,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
  };
}

/**
 * Generates Cross-Tabulation Matrix for Heatmap
 */
export function generateCrossTabMatrix(
  records: DataRecord[],
  rowDimension: string,
  colDimension: string,
  metric: string,
  aggregation: AggregationType
): { rows: string[]; cols: string[]; matrix: { row: string; col: string; value: number; count: number }[]; maxValue: number } {
  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const cellMap = new Map<string, number[]>();

  records.forEach((r) => {
    const rowKey = String(r[rowDimension] ?? 'Uncategorized');
    const colKey = String(r[colDimension] ?? 'Uncategorized');
    rowSet.add(rowKey);
    colSet.add(colKey);

    const cellKey = `${rowKey}:::${colKey}`;
    let val = 1;
    if (metric && metric !== '__count__') {
      const rawVal = r[metric];
      const parsed = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(/[$,€£%]/g, ''));
      val = !isNaN(parsed) ? parsed : 0;
    }

    if (!cellMap.has(cellKey)) {
      cellMap.set(cellKey, []);
    }
    cellMap.get(cellKey)!.push(val);
  });

  const rows = Array.from(rowSet).slice(0, 10);
  const cols = Array.from(colSet).slice(0, 10);

  let maxValue = 0;
  const matrix: { row: string; col: string; value: number; count: number }[] = [];

  rows.forEach((row) => {
    cols.forEach((col) => {
      const cellKey = `${row}:::${col}`;
      const vals = cellMap.get(cellKey) || [];
      let val = 0;
      if (vals.length > 0) {
        if (aggregation === 'count') val = vals.length;
        else if (aggregation === 'avg') val = vals.reduce((a, b) => a + b, 0) / vals.length;
        else if (aggregation === 'max') val = Math.max(...vals);
        else if (aggregation === 'min') val = Math.min(...vals);
        else val = vals.reduce((a, b) => a + b, 0);
      }
      val = Math.round(val * 10) / 10;
      if (val > maxValue) maxValue = val;
      matrix.push({ row, col, value: val, count: vals.length });
    });
  });

  return { rows, cols, matrix, maxValue };
}

/**
 * Format metric value with currency, compact number or percentage
 */
export function formatMetric(
  val: number | undefined | null,
  options?: { isCurrency?: boolean; isPercentage?: boolean; prefix?: string; suffix?: string; compact?: boolean }
): string {
  if (val === undefined || val === null || isNaN(val)) return '0';

  const { isCurrency, isPercentage, prefix = '', suffix = '', compact = false } = options || {};

  let formatted = '';
  if (compact && Math.abs(val) >= 1_000_000) {
    formatted = (val / 1_000_000).toFixed(1) + 'M';
  } else if (compact && Math.abs(val) >= 1_000) {
    formatted = (val / 1_000).toFixed(1) + 'K';
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(val);
  }

  if (isCurrency || prefix === '$') {
    return `$${formatted}`;
  }
  if (isPercentage || suffix === '%') {
    return `${formatted}%`;
  }

  return `${prefix}${formatted}${suffix ? ' ' + suffix : ''}`;
}

/**
 * Palette color scales for charts
 */
export const PALETTES: Record<string, string[]> = {
  indigo: ['#6366f1', '#818cf8', '#4f46e5', '#a5b4fc', '#3730a3', '#c7d2fe'],
  emerald: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857', '#a7f3d0'],
  amber: ['#f59e0b', '#fbbf24', '#d97706', '#fcd34d', '#b45309', '#fde68a'],
  rose: ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#be123c', '#fecdd3'],
  cyan: ['#06b6d4', '#22d3ee', '#0891b2', '#67e8f9', '#0e7490', '#a5f3fc'],
  monochrome: ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'],
};

export function getPaletteColors(palette: string): string[] {
  return PALETTES[palette] || PALETTES.indigo;
}

/**
 * Triggers browser download of CSV
 */
export function downloadCSV(records: DataRecord[], filename = 'export.csv') {
  if (!records || records.length === 0) return;
  const headers = Object.keys(records[0]);
  const rows = records.map((r) =>
    headers
      .map((h) => {
        const val = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser download of JSON
 */
export function downloadJSON(records: DataRecord[], filename = 'export.json') {
  const jsonContent = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
