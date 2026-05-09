"""Minimal preprocessing script for NYC 311 noise complaints.

Usage:
    python scripts/preprocess_311.py --input raw_311.csv --output public/data/complaints.json

Expected columns in the raw CSV:
    created_date, complaint_type, borough, latitude, longitude, incident_zip, descriptor, status

This starter keeps the transformation intentionally small. In the full project, you will likely:
1. Download via the Socrata API rather than manual CSV exports.
2. Filter only noise-related complaint types.
3. Join a neighborhood / NTA boundary lookup.
4. Produce multiple outputs:
   - complaints_points.json for the map
   - temporal_matrix.json for the calendar heatmap
   - complaint_type_counts.json for category summaries
   - neighborhood_stats.json for ranking and per-capita normalization
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

NOISE_KEYWORDS = ["Noise"]


def infer_neighborhood(row: pd.Series) -> str:
    """Placeholder neighborhood assignment.

    Replace this with a spatial join against NYC NTA or community district polygons.
    """
    return row.get("incident_zip") or "Unknown"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to a raw 311 CSV export")
    parser.add_argument("--output", required=True, help="Path to write the cleaned JSON")
    args = parser.parse_args()

    df = pd.read_csv(args.input, low_memory=False)

    df = df[df["complaint_type"].astype(str).str.contains("|".join(NOISE_KEYWORDS), case=False, na=False)].copy()
    df = df.dropna(subset=["created_date", "latitude", "longitude", "borough"])

    df["neighborhood"] = df.apply(infer_neighborhood, axis=1)

    records = []
    for index, row in df.iterrows():
        records.append(
            {
                "id": str(index),
                "createdAt": pd.to_datetime(row["created_date"], utc=True).isoformat(),
                "complaintType": str(row["complaint_type"]),
                "borough": str(row["borough"]),
                "neighborhood": str(row["neighborhood"]),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "status": str(row.get("status", "Unknown")),
            }
        )

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} cleaned records to {output_path}")


if __name__ == "__main__":
    main()
