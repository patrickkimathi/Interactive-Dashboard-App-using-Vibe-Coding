# Vantage Data Studio

An interactive multi-dimensional analytics dashboard with real-time filtering, customizable chart widgets, in-browser spreadsheet data management, and offline reporting (PDF, PNG, CSV).

---

## Overview

**Vantage Data Studio** allows teams and individuals to explore, visualize, and report on structured data without complex server configurations. Users can paste raw CSV or JSON data, upload spreadsheet files, or explore pre-loaded industry benchmarks. Every chart, KPI card, and summary table reacts instantaneously to global filters, search queries, and interactive chart selections.

---

## Key Features

### 1. Data Hub & In-App Spreadsheet Editor
- **Paste Raw Data**: Direct text paste for CSV (comma, tab, or semicolon separated) or JSON arrays with automatic column type inference (`numeric`, `date`, `categorical`, `currency`, `percentage`).
- **File Upload**: Drag-and-drop or file browser support for `.csv` and `.json` documents.
- **Live Spreadsheet Table**: High-density interactive grid allowing inline cell editing, row additions, and deletions with instant live recalculations across all dashboard charts.
- **Pre-Loaded Industry Datasets**:
  - *Global Enterprise Sales & Revenue* (territory performance, sales reps, profit margins, order quantities, CSAT).
  - *SaaS Product & Cohort Analytics* (MRR, ARR, active subscriber growth, churn rate, CAC, LTV, NPS).
  - *Multi-Channel Marketing & ROAS* (ad spend, impressions, clicks, conversions, CPA, return on ad spend).

### 2. Real-Time Dynamic Filtering
- **Segmented Time Filters**: All Records, Last 30 Days, Last 90 Days, Year-to-Date (YTD), or Custom Date Range.
- **Categorical Multi-Select**: Dynamic filter dropdowns automatically populated from the active dataset's dimensions.
- **Global Text Search**: Instant live keyword filtering across all columns and fields simultaneously.
- **Interactive Click-to-Filter**: Clicking on any bar, donut slice, scatter point, or table row automatically filters the entire dashboard to that segment.
- **Active Criteria Bar**: Visual indicator of active filters with one-click removal and record fraction counters (`tabular-nums`).

### 3. Customizable Multi-Chart Widgets Engine
- **Supported Chart Types**:
  - **KPI Stat Cards**: Headline metric with benchmark goal progress bar, average, min, and max.
  - **Vertical Column Bars**: Standard categorical comparisons with subtle gridlines.
  - **Horizontal Leaderboard Bars**: Ranked category ordering for teams, reps, or products.
  - **Line Trajectory**: Smooth continuous time-series trend lines with hover points.
  - **Gradient Area**: Volume visualization emphasizing cumulative metrics over time.
  - **Donut / Pie**: Proportional contribution breakdown with center summary and interactive hover legend.
  - **Scatter Correlation**: Two-variable distributions identifying performance clusters and outliers.
  - **Radar Polygon**: Multi-axis dimensional scores and operational competencies.
  - **Conversion Funnel**: Step-by-step pipeline progression and drop-off rates.
  - **Cross-Tab Heatmap**: 2D matrix comparing two dimensions with intensity scales.
  - **Pivot Summary Table**: High-density aggregated ledger with relative weight progress bars.
- **Widget Customizer**:
  - Choose primary dimension (X-axis) and secondary dimension (breakdown).
  - Select numeric metric and aggregation function (**Sum**, **Average / Mean**, **Count**, **Maximum**, **Minimum**, **Median**).
  - Adjust grid column span (1/3 width, 1/2 width, 2/3 width, or full width).
  - Curated color palettes (*Indigo Slate*, *Emerald Mint*, *Warm Amber*, *Rose Crimson*, *Cyan Ocean*, *Monochrome Slate*).
  - Reorder, duplicate, resize, or delete widgets on the fly.

### 4. Offline Reporting & Multi-Format Export
- **Per-Widget PNG Snapshot**: Download individual high-resolution 2x retina images of any chart (UI buttons are automatically excluded from the capture).
- **Per-Widget Aggregated CSV**: Download the exact mathematical data backing that specific visualization.
- **Executive PDF Report**: Generate branded offline PDF executive reports containing title, dataset metadata, active filter settings, record counts, and visual dashboard graphics.
- **Full Dashboard PNG**: Standalone high-res canvas image of the entire dashboard workspace.
- **Filtered Records CSV & JSON**: Export all records currently matching active filter criteria.
- **Print Layout**: Dedicated `@media print` styling for clean browser printing to Letter or A4 paper.

---

## Tech Stack

- **Framework**: React 19 (SPA) with TypeScript
- **Styling**: Tailwind CSS v4 with custom dark slate design system
- **Charts & Visualization**: Recharts & custom SVG renderers
- **Export Engines**: `html2canvas` (canvas capture) & `jspdf` (PDF generation)
- **Icons**: Lucide React
- **Build Tool**: Vite 8

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

1. Clone or open the project directory:
   ```bash
   cd vantage-data-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Production Build

To compile a production build:
```bash
npm run build
```

---

## Usage Guide

1. **Importing Your Data**:
   - Click **"Provide / Import Data"** in the top navigation bar.
   - Choose **"Paste Raw Data"** to paste comma-separated values or a JSON array, or **"Upload File"** to select a `.csv` or `.json` file from your device.
   - Click **"Validate & Preview Data"** to verify inferred column types, then click **"Populate Dashboard"**.

2. **Editing Records In-Place**:
   - Open the **Data Hub** and select the **"Live Data Spreadsheet"** tab.
   - Click into any cell to edit values directly, or use **"Add Row"** / **"Delete"** to modify the dataset. Changes update all charts in real time.

3. **Customizing or Adding Widgets**:
   - Click **"Add Widget"** in the toolbar or click the pencil icon on any existing widget card.
   - Select your preferred chart type, configure dimensions and metrics, and adjust the layout width.

4. **Generating Offline Reports**:
   - Click **"Export"** in the toolbar.
   - Select **"Executive PDF Report (.pdf)"** for a ready-to-share document, **"Dashboard Overview PNG"** for presentations, or **"Filtered Records Spreadsheet (.csv)"** for spreadsheet analysis.

---

## License

Apache-2.0
