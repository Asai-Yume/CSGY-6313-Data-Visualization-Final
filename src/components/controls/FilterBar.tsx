import { useMemo } from 'react';
import {
  getAvailableBoroughs,
  getAvailableComplaintTypes,
  getAvailableYears,
} from '../../state/selectors';
import { ComplaintRecord } from '../../data/types';
import { useAppDispatch, useAppSelector } from '../../state/store';
import {
  resetFilters,
  setBorough,
  setYearRange,
  toggleComplaintType,
} from '../../state/filtersSlice';

export function FilterBar({ records }: { records: ComplaintRecord[] }) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  const boroughs = useMemo(() => getAvailableBoroughs(records), [records]);
  const complaintTypes = useMemo(() => getAvailableComplaintTypes(records), [records]);
  const years = useMemo(() => getAvailableYears(records), [records]);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="borough">Borough</label>
        <select
          id="borough"
          value={filters.selectedBorough}
          onChange={(event) => dispatch(setBorough(event.target.value))}
        >
          {boroughs.map((borough) => (
            <option key={borough} value={borough}>
              {borough}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--wide">
        <span className="filter-label">Complaint types</span>
        <div className="pill-list">
          {complaintTypes.map((type) => {
            const isActive = filters.selectedComplaintTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                className={`pill ${isActive ? 'pill--active' : ''}`}
                onClick={() => dispatch(toggleComplaintType(type))}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="yearStart">Start year</label>
        <select
          id="yearStart"
          value={filters.yearRange?.[0] ?? ''}
          onChange={(event) => {
            if (event.target.value === '') {
              dispatch(setYearRange(null));
              return;
            }
            const nextStart = Number(event.target.value);
            const end = filters.yearRange?.[1] ?? years[years.length - 1];
            dispatch(setYearRange([Math.min(nextStart, end), Math.max(nextStart, end)]));
          }}
        >
          <option value="">All</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="yearEnd">End year</label>
        <select
          id="yearEnd"
          value={filters.yearRange?.[1] ?? ''}
          onChange={(event) => {
            if (event.target.value === '') {
              dispatch(setYearRange(null));
              return;
            }
            const nextEnd = Number(event.target.value);
            const start = filters.yearRange?.[0] ?? years[0];
            dispatch(setYearRange([Math.min(start, nextEnd), Math.max(start, nextEnd)]));
          }}
        >
          <option value="">All</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--actions">
        <button type="button" className="button-secondary" onClick={() => dispatch(resetFilters())}>
          Reset filters
        </button>
      </div>
    </div>
  );
}
