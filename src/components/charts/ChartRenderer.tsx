import React from 'react';
import { WidgetConfig, DataRecord, ColumnMeta } from '../../types/dashboard';
import { aggregateWidgetData } from '../../utils/dataEngine';
import { BarChartWidget } from './BarChartWidget';
import { LineAreaChartWidget } from './LineAreaChartWidget';
import { PieDonutWidget } from './PieDonutWidget';
import { RadarChartWidget } from './RadarChartWidget';
import { ScatterChartWidget } from './ScatterChartWidget';
import { FunnelChartWidget } from './FunnelChartWidget';
import { KpiWidget } from './KpiWidget';
import { HeatmapWidget } from './HeatmapWidget';
import { TableWidget } from './TableWidget';

interface ChartRendererProps {
  records: DataRecord[];
  config: WidgetConfig;
  columns: ColumnMeta[];
  onFilterSelect?: (dimension: string, value: string) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  records,
  config,
  onFilterSelect,
}) => {
  const handleDimensionFilter = (val: string) => {
    if (onFilterSelect && config.dimension) {
      onFilterSelect(config.dimension, val);
    }
  };

  if (config.chartType === 'kpi') {
    return <KpiWidget records={records} config={config} />;
  }

  if (config.chartType === 'heatmap') {
    return (
      <HeatmapWidget
        records={records}
        config={config}
        onFilterSelect={handleDimensionFilter}
      />
    );
  }

  // For charts that require aggregated groups
  const aggregatedData = aggregateWidgetData(records, config);

  switch (config.chartType) {
    case 'bar':
    case 'horizontal_bar':
      return (
        <BarChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'line':
    case 'area':
      return (
        <LineAreaChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'donut':
      return (
        <PieDonutWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'radar':
      return (
        <RadarChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'scatter':
      return (
        <ScatterChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'funnel':
      return (
        <FunnelChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    case 'table':
      return (
        <TableWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );

    default:
      return (
        <BarChartWidget
          data={aggregatedData}
          config={config}
          onFilterSelect={handleDimensionFilter}
        />
      );
  }
};
