import { useMemo } from 'react';
import { max, scaleLinear } from 'd3';
import type { ComplaintRecord, ComplaintTypeCountRecord } from '../../data/types';
import { buildComplaintTypeBreakdown } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { toggleComplaintType } from '../../state/filtersSlice';
import { Panel } from '../shared/Panel';
import { EmptyState } from '../shared/EmptyState';

type ComplaintTypeChartProps = {
  records: ComplaintRecord[];
  precomputedCounts: ComplaintTypeCountRecord[];
  totalPointCount: number;
};

export function ComplaintTypeChart({
  records,
  precomputedCounts,
  totalPointCount,
}: ComplaintTypeChartProps) {
  const dispatch = useAppDispatch();
  const selectedTypes = useAppSelector((state) => state.filters.selectedComplaintTypes);

  const derivedData = useMemo(() => buildComplaintTypeBreakdown(records), [records]);

  const data = useMemo(() => {
    const usePrecomputed = records.length === totalPointCount;

    if (usePrecomputed) {
      return precomputedCounts
        .map((item) => ({
          label: item.complaintType,
          value: item.count,
        }))
        .sort((a, b) => b.value - a.value);
    }

    return derivedData;
  }, [records.length, totalPointCount, precomputedCounts, derivedData]);

  const maxValue = max(data, (d) => d.value) ?? 1;
  const x = scaleLinear().domain([0, maxValue]).range([0, 100]);

  if (data.length === 0) {
    return (
      <Panel title="Complaint type breakdown" subtitle="Which complaint types dominate the active selection?">
        <EmptyState />
      </Panel>
    );
  }

  return (
    <Panel
      title="Complaint type breakdown"
      subtitle="Click a category to add or remove a filter"
    >
      <div className="bar-list">
        {data.map((item) => {
          const isActive = selectedTypes.includes(item.label);

          return (
            <button
              type="button"
              key={item.label}
              className={`bar-row ${isActive ? 'bar-row--active' : ''}`}
              onClick={() => dispatch(toggleComplaintType(item.label))}
            >
              <div className="bar-row__meta">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="bar-row__track">
                <div className="bar-row__fill" style={{ width: `${x(item.value)}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}