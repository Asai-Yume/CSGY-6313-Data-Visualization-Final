import { ComplaintRecord } from '../data/types';
import { FiltersState } from './filtersSlice';
import { getDateParts, matchesTemporalCell } from '../data/transforms';

export function getAvailableYears(records: ComplaintRecord[]) {
  return Array.from(new Set(records.map((record) => getDateParts(record.createdAt).year))).sort((a, b) => a - b);
}

export function getAvailableBoroughs(records: ComplaintRecord[]) {
  return ['All', ...Array.from(new Set(records.map((record) => record.borough))).sort()];
}

export function getAvailableComplaintTypes(records: ComplaintRecord[]) {
  return Array.from(new Set(records.map((record) => record.complaintType))).sort();
}

export function filterComplaints(records: ComplaintRecord[], filters: FiltersState) {
  return records.filter((record) => {
    if (filters.selectedBorough !== 'All' && record.borough !== filters.selectedBorough) {
      return false;
    }

    if (
      filters.selectedComplaintTypes.length > 0 &&
      !filters.selectedComplaintTypes.includes(record.complaintType)
    ) {
      return false;
    }

    if (
      filters.selectedNeighborhoods.length > 0 &&
      !filters.selectedNeighborhoods.includes(record.neighborhood)
    ) {
      return false;
    }

    if (filters.yearRange) {
      const year = getDateParts(record.createdAt).year;
      if (year < filters.yearRange[0] || year > filters.yearRange[1]) {
        return false;
      }
    }

    if (!matchesTemporalCell(record, filters.selectedTemporalCell)) {
      return false;
    }

    if (filters.selectedSpatialBounds) {
      const { west, south, east, north } = filters.selectedSpatialBounds;

      if (
        record.longitude < west ||
        record.longitude > east ||
        record.latitude < south ||
        record.latitude > north
      ) {
        return false;
      }
    }

    return true;
  });
}

export function buildTemporalMatrix(records: ComplaintRecord[]) {
  const matrix = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({ day, hour, value: 0 })),
  );

  records.forEach((record) => {
    const { day, hour } = getDateParts(record.createdAt);
    matrix[day][hour].value += 1;
  });

  return matrix;
}

export function buildComplaintTypeBreakdown(records: ComplaintRecord[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    counts.set(record.complaintType, (counts.get(record.complaintType) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildNeighborhoodRanking(records: ComplaintRecord[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    counts.set(record.neighborhood, (counts.get(record.neighborhood) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}