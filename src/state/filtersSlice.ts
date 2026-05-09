import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TemporalCell } from '../data/types';

export type SpatialBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type FiltersState = {
  selectedBorough: string;
  selectedComplaintTypes: string[];
  selectedNeighborhoods: string[];
  selectedTemporalCell: TemporalCell | null;
  yearRange: [number, number] | null;
  selectedSpatialBounds: SpatialBounds | null;
};

const initialState: FiltersState = {
  selectedBorough: 'All',
  selectedComplaintTypes: [],
  selectedNeighborhoods: [],
  selectedTemporalCell: null,
  yearRange: null,
  selectedSpatialBounds: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setBorough(state, action: PayloadAction<string>) {
      state.selectedBorough = action.payload;
      state.selectedNeighborhoods = [];
    },
    toggleComplaintType(state, action: PayloadAction<string>) {
      const value = action.payload;
      state.selectedComplaintTypes = state.selectedComplaintTypes.includes(value)
        ? state.selectedComplaintTypes.filter((item) => item !== value)
        : [...state.selectedComplaintTypes, value];
    },
    clearComplaintTypes(state) {
      state.selectedComplaintTypes = [];
    },
    toggleNeighborhood(state, action: PayloadAction<string>) {
      const value = action.payload;
      state.selectedNeighborhoods = state.selectedNeighborhoods.includes(value)
        ? state.selectedNeighborhoods.filter((item) => item !== value)
        : [...state.selectedNeighborhoods, value];
    },
    setTemporalCell(state, action: PayloadAction<TemporalCell | null>) {
      state.selectedTemporalCell = action.payload;
    },
    setYearRange(state, action: PayloadAction<[number, number] | null>) {
      state.yearRange = action.payload;
    },
    setSpatialBounds(state, action: PayloadAction<SpatialBounds | null>) {
      state.selectedSpatialBounds = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setBorough,
  toggleComplaintType,
  clearComplaintTypes,
  toggleNeighborhood,
  setTemporalCell,
  setYearRange,
  setSpatialBounds,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;