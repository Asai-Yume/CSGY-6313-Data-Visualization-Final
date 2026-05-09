# NYC 311 Noise Complaints Visualization Dashboard

This project is an interactive web dashboard for exploring NYC 311 noise complaint data. It visualizes spatial, categorical, neighborhood-level, and temporal patterns in 2025 noise complaints.

The dashboard includes four coordinated views:

- **Geo heatmap** showing where noise complaints are geographically concentrated
- **Temporal heatmap** showing complaint volume by day of week and hour of day
- **Complaint type breakdown** showing the distribution of noise complaint categories
- **Neighborhood ranking** showing the highest complaint-count ZIP-code areas

The project uses a preprocessing pipeline to download and clean NYC 311 records, then exports frontend-ready JSON files that the React app loads at runtime.

---

## Data Notice

Large generated data files are **not included in this GitHub repository**.

The processed NYC 311 data files are too large for normal GitHub upload limits, so they are ignored by Git. To run the dashboard with data, use one of the following options:

1. Download the prepared data from Google Drive:

   [link to data and demo video]()

2. Regenerate the data using the preprocessing notebook/script in the `scripts/` folder.

After downloading or regenerating the data, place the generated files in:

```text
public/data/
```

The app expects the following frontend data files:

```text
public/data/complaints_points.json
public/data/temporal_matrix.json
public/data/complaint_type_counts.json
public/data/neighborhood_stats.json
public/data/complaints.json
```

Depending on the preprocessing version, a full `complaints.json` file may also be generated, but it is not required if the app is configured to use `complaints_points.json`.

---

## Project Structure

```text
CSGY-6313-Data-Visualization-Final/
├── .env.example
├── .gitignore
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── data/
│       ├── complaints_points.json              # generated; not committed
│       ├── temporal_matrix.json                # generated; not committed
│       ├── complaint_type_counts.json          # generated; not committed
│       ├── complaints.json                     # generated; not committed
│       └── neighborhood_stats.json             # generated; not committed
├── scripts/
│   └── 311_preprocessing_starter_api_2025.ipynb
└── src/
    ├── main.tsx
    ├── vite-env.d.ts
    ├── app/
    │   ├── App.tsx
    │   └── layout.tsx
    ├── components/
    │   ├── charts/
    │   │   ├── ComplaintTypeChart.tsx
    │   │   ├── NeighborhoodRanking.tsx
    │   │   └── TemporalHeatmap.tsx
    │   ├── controls/
    │   │   └── FilterBar.tsx
    │   ├── map/
    │   │   └── NoiseHeatmap.tsx
    │   └── shared/
    │       ├── EmptyState.tsx
    │       ├── LoadingState.tsx
    │       └── Panel.tsx
    ├── data/
    │   ├── loadData.ts
    │   ├── transforms.ts
    │   └── types.ts
    ├── state/
    │   ├── filtersSlice.ts
    │   ├── selectors.ts
    │   └── store.ts
    ├── styles/
    │   └── app.css
    └── utils/
        ├── colors.ts
        ├── geo.ts
        └── time.ts
```

---

## Requirements

You need:

- Node.js
- npm
- A Mapbox access token for the map basemap (I have included mine in the comments in Brightspace)
- Python/Jupyter only if you want to regenerate the data

---

## Setup

Install frontend dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Then open `.env` and add your Mapbox token:

```env
VITE_MAPBOX_TOKEN=your_real_mapbox_token_here
```

---

## Data Setup

The dashboard requires preprocessed JSON files inside:

```text
public/data/
```

Because these files are generated and can be very large, they are not included in the repository.

### Option 1: Use Prepared Data

Download the prepared data from Google Drive:

[link to data and demo video]()

Then place the files here:

```text
public/data/complaints_points.json
public/data/temporal_matrix.json
public/data/complaint_type_counts.json
public/data/neighborhood_stats.json
public/data/complaints.json
```

### Option 2: Regenerate the Data

Use the preprocessing notebook:

```text
scripts/311_preprocessing_starter_api_2025.ipynb
```

The preprocessing pipeline:

1. Downloads 2025 NYC 311 service request records from NYC Open Data.
2. Filters to selected noise complaint types.
3. Cleans timestamp, borough, complaint type, latitude, and longitude fields.
4. Derives time fields such as year, month, hour, and day of week.
5. Creates a ZIP-code-based neighborhood placeholder.
6. Exports frontend-ready JSON files for the dashboard.

Expected output files:

```text
public/data/complaints_points.json
public/data/temporal_matrix.json
public/data/complaint_type_counts.json
public/data/neighborhood_stats.json
public/data/complaints.json
```

---

## Run Locally

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal. It is usually:

```text
http://localhost:5173/
```

If the map does not show, check that your `.env` file contains a valid Mapbox token.

---

## Build

Compile the production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Main Files

### App Composition

```text
src/app/App.tsx
```

This file loads the data, manages the main dashboard layout, and passes filtered records into the visualization components.

### Data Loading

```text
src/data/loadData.ts
```

This file loads the preprocessed JSON files from `public/data/`.

### Data Types

```text
src/data/types.ts
```

This file defines the TypeScript types used for complaint records, temporal matrix records, complaint type counts, neighborhood statistics, and filter state.

### Shared Filtering and Aggregation

```text
src/state/selectors.ts
```

This file contains the main filtering and aggregation helpers, including logic for:

- Filtering complaints by borough
- Filtering by complaint type
- Filtering by neighborhood
- Filtering by year range
- Filtering by selected temporal heatmap cell
- Building chart-ready complaint type breakdowns
- Building neighborhood rankings
- Building temporal heatmap matrices

### Filter State

```text
src/state/filtersSlice.ts
```

This file manages the shared Redux filter state. The linked views use this shared state so that interactions in one visualization update the rest of the dashboard.

### Visualizations

```text
src/components/map/NoiseHeatmap.tsx
src/components/charts/TemporalHeatmap.tsx
src/components/charts/ComplaintTypeChart.tsx
src/components/charts/NeighborhoodRanking.tsx
```

These files implement the main visualizations.

---

## Dashboard Interactions

The dashboard supports linked interaction across views.

Examples:

- Selecting a borough filters all charts and the map.
- Selecting a complaint type updates the map, ranking, and temporal heatmap.
- Selecting a temporal heatmap cell filters the other views to that day-hour window.
- Selecting map bounds can filter the charts to the visible geographic region.
- Resetting filters restores the dashboard to the broader data view.

---

## Notes on Neighborhoods

The current preprocessing pipeline uses `incident_zip` as a ZIP-code-based neighborhood placeholder. Therefore, the neighborhood ranking should be interpreted as a ZIP-code-based local ranking rather than an official NYC neighborhood boundary analysis.

A future improvement would be to perform a spatial join with official NYC neighborhood, NTA, or community district boundary files.

---

## Troubleshooting

### The dashboard loads but the map is blank

Check that `.env` contains:

```env
VITE_MAPBOX_TOKEN=your_real_mapbox_token_here
```

Then restart the development server.

### The dashboard loads but charts are empty

Check that the generated JSON files are in:

```text
public/data/
```

At minimum, the app expects:

```text
complaints_points.json
temporal_matrix.json
complaint_type_counts.json
neighborhood_stats.json
complaints.json
```