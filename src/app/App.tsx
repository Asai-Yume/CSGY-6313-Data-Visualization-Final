import { useEffect, useMemo, useState } from 'react';
import { loadAppData } from '../data/loadData';
import { AppData } from '../data/types';
import { DashboardLayout } from './layout';
import { FilterBar } from '../components/controls/FilterBar';
import { NoiseHeatmap } from '../components/map/NoiseHeatmap';
import { TemporalHeatmap } from '../components/charts/TemporalHeatmap';
import { ComplaintTypeChart } from '../components/charts/ComplaintTypeChart';
import { NeighborhoodRanking } from '../components/charts/NeighborhoodRanking';
import { LoadingState } from '../components/shared/LoadingState';
import { useAppSelector } from '../state/store';
import { filterComplaints } from '../state/selectors';

export default function App() {
  const filters = useAppSelector((state) => state.filters);

  const [data, setData] = useState<AppData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function run() {
      try {
        setStatus('loading');
        const result = await loadAppData();
        setData(result);
        setStatus('ready');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown load failure');
        setStatus('error');
      }
    }

    void run();
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterComplaints(data.points, filters);
  }, [data, filters]);

  const filteredWithoutTemporal = useMemo(() => {
  if (!data) return [];

    return filterComplaints(data.points, {
      ...filters,
      selectedTemporalCell: null,
    });
  }, [data, filters]);

  return (
    <DashboardLayout>
      {status === 'loading' ? <LoadingState label="Loading 311 data…" /> : null}
      {status === 'error' ? <div className="status-card">{error}</div> : null}

      {status === 'ready' && data ? (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <span>Total records loaded</span>
              <strong>{data.points.length.toLocaleString()}</strong>
            </div>
            <div className="stat-card">
              <span>Records after filters</span>
              <strong>{filtered.length.toLocaleString()}</strong>
            </div>
            <div className="stat-card">
              <span>Active borough</span>
              <strong>{filters.selectedBorough}</strong>
            </div>
            <div className="stat-card">
              <span>Temporal filter</span>
              <strong>{filters.selectedTemporalCell ? 'Active' : 'None'}</strong>
            </div>
          </div>

          <FilterBar records={data.points} />

          <div className="dashboard-grid">
            <div className="dashboard-grid__wide">
              <NoiseHeatmap records={filtered} />
            </div>
            <TemporalHeatmap
              records={filteredWithoutTemporal}
              precomputedMatrix={data.temporal}
              totalPointCount={data.points.length}
            />
            <ComplaintTypeChart
              records={filtered}
              precomputedCounts={data.complaintTypes}
              totalPointCount={data.points.length}
            />
            <NeighborhoodRanking
              records={filtered}
              precomputedStats={data.neighborhoods}
              totalPointCount={data.points.length}
            />
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
}