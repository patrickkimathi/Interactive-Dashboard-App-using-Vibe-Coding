import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AggregatedDataPoint, WidgetConfig, GlobalFilterState, ColumnMeta } from '../types/dashboard';

/**
 * Downloads a DOM element (widget or entire dashboard) as a PNG image.
 */
export async function exportElementAsPNG(elementId: string, fileName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for retina/presentation
      useCORS: true,
      logging: false,
      backgroundColor: '#0b0f19', // Match app canvas
      ignoreElements: (el) => {
        // Exclude action menus and floating tooltips from screenshot
        return el.classList.contains('no-export') || el.getAttribute('data-no-export') === 'true';
      },
    });

    const link = document.createElement('a');
    link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export element as PNG:', err);
    return false;
  }
}

/**
 * Exports widget aggregated data points as a clean CSV file
 */
export function exportWidgetAsCSV(
  data: AggregatedDataPoint[],
  config: WidgetConfig,
  fileName?: string
): void {
  if (!data || data.length === 0) return;

  const dimHeader = config.dimension || 'Category';
  const metricHeader = `${config.aggregation.toUpperCase()} of ${config.metric || 'Value'}`;

  const headers = [dimHeader, metricHeader, 'Record Count'];
  const rows = data.map((item) => {
    const label = `"${String(item.label).replace(/"/g, '""')}"`;
    const val = item.value;
    const count = item.count;
    return `${label},${val},${count}`;
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const resolvedFileName = fileName || `${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_data.csv`;
  link.setAttribute('download', resolvedFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a multi-page or structured PDF offline executive report.
 */
export async function exportDashboardAsPDF(options: {
  dashboardElementId: string;
  datasetName: string;
  filters: GlobalFilterState;
  columns: ColumnMeta[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}): Promise<boolean> {
  const {
    dashboardElementId,
    datasetName,
    filters,
    totalRecordsCount,
    filteredRecordsCount,
  } = options;

  const element = document.getElementById(dashboardElementId);
  if (!element) {
    console.error(`Dashboard element with id ${dashboardElementId} not found.`);
    return false;
  }

  try {
    // Capture high-res canvas
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#0b0f19',
      ignoreElements: (el) => {
        return el.classList.contains('no-export') || el.getAttribute('data-no-export') === 'true';
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 30;

    // Header Title
    pdf.setFillColor(11, 15, 25);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(248, 250, 252);
    pdf.text('VANTAGE DATA STUDIO — OFFLINE EXECUTIVE REPORT', margin, 40);

    // Metadata Subtitle
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);

    const dateStr = new Date().toLocaleString();
    const activePeriod = filters.dateRange.preset.toUpperCase();
    const activeSearch = filters.searchQuery ? `"${filters.searchQuery}"` : 'None';
    const filterInfo = `Dataset: ${datasetName}  |  Generated: ${dateStr}  |  Period: ${activePeriod}  |  Search: ${activeSearch}  |  Records: ${filteredRecordsCount} of ${totalRecordsCount}`;

    pdf.text(filterInfo, margin, 58);

    // Hairline divider
    pdf.setDrawColor(51, 65, 85);
    pdf.setLineWidth(1);
    pdf.line(margin, 68, pageWidth - margin, 68);

    // Compute aspect-fit dimensions for dashboard snapshot
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - 85 - margin;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgRatio = canvasWidth / canvasHeight;

    let renderWidth = availableWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const xOffset = margin + (availableWidth - renderWidth) / 2;
    const yOffset = 85;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      'Confidential — Generated for offline business intelligence and presentation purposes.',
      margin,
      pageHeight - 15
    );
    pdf.text(`Page 1 of 1`, pageWidth - margin - 50, pageHeight - 15);

    const safeName = datasetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    pdf.save(`${safeName}_executive_report.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF report:', err);
    return false;
  }
}
