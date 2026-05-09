import { useMemo } from 'react';
import { max, scaleLinear } from 'd3';
import type { ComplaintRecord, NeighborhoodStatRecord } from '../../data/types';
import { buildNeighborhoodRanking } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { toggleNeighborhood } from '../../state/filtersSlice';
import { Panel } from '../shared/Panel';
import { EmptyState } from '../shared/EmptyState';

type NeighborhoodRankingProps = {
  records: ComplaintRecord[];
  precomputedStats: NeighborhoodStatRecord[];
  totalPointCount: number;
};

export function NeighborhoodRanking({
  records,
  precomputedStats,
  totalPointCount,
}: NeighborhoodRankingProps) {
  const dispatch = useAppDispatch();
  const selectedNeighborhoods = useAppSelector((state) => state.filters.selectedNeighborhoods);

  const derivedData = useMemo(() => buildNeighborhoodRanking(records), [records]);

  const data = useMemo(() => {
    const usePrecomputed = records.length === totalPointCount;

    if (usePrecomputed) {
      return precomputedStats
        .map((item) => ({
          label: item.neighborhood,
          value: item.count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
    }

    return derivedData;
  }, [records.length, totalPointCount, precomputedStats, derivedData]);

  const maxValue = max(data, (d) => d.value) ?? 1;
  const x = scaleLinear().domain([0, maxValue]).range([0, 100]);

  if (data.length === 0) {
    return (
      <Panel title="Neighborhood ranking" subtitle="Top neighborhoods under the active filters">
        <EmptyState />
      </Panel>
    );
  }

  return (
    <Panel
      title="Neighborhood ranking"
      subtitle="Try selecting a neighborhood"
    >
      <div className="bar-list">
        {data.map((item) => {
          const isActive = selectedNeighborhoods.includes(item.label);

          return (
            <button
              type="button"
              key={item.label}
              className={`bar-row ${isActive ? 'bar-row--active' : ''}`}
              onClick={() => dispatch(toggleNeighborhood(item.label))}
            >
              <div className="bar-row__meta">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="bar-row__track">
                <div className="bar-row__fill bar-row__fill--alt" style={{ width: `${x(item.value)}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}