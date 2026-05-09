import { useCallback, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Map, { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ComplaintRecord } from '../../data/types';
import { NYC_VIEW_STATE } from '../../utils/geo';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { setSpatialBounds } from '../../state/filtersSlice';
import { Panel } from '../shared/Panel';
import { EmptyState } from '../shared/EmptyState';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function NoiseHeatmap({ records }: { records: ComplaintRecord[] }) {
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapRef | null>(null);
  const spatialBounds = useAppSelector((state) => state.filters.selectedSpatialBounds);

  const syncBoundsToFilter = useCallback(() => {
    const bounds = mapRef.current?.getBounds();
    if (!bounds) return;

    dispatch(
      setSpatialBounds({
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
      }),
    );
  }, [dispatch]);

  const layers = useMemo(() => {
    return [
      new HeatmapLayer<ComplaintRecord>({
        id: 'noise-heatmap',
        data: records,
        getPosition: (d) => [d.longitude, d.latitude],
        getWeight: () => 1,
        radiusPixels: 45,
        intensity: 1,
        threshold: 0.03,
      }),
    ];
  }, [records]);

  if (records.length === 0) {
    return (
      <Panel title="Geo heatmap" subtitle="Spatial distribution of currently filtered complaints">
        <EmptyState />
      </Panel>
    );
  }

  return (
    <Panel
      title="Geo heatmap"
      subtitle="Try to pan or zoom the map"
      actions={
        spatialBounds ? (
          <button className="button-secondary" onClick={() => dispatch(setSpatialBounds(null))}>
            Clear spatial filter
          </button>
        ) : null
      }
    >
      {!MAPBOX_TOKEN ? (
        <div className="status-card">
          Add <code>VITE_MAPBOX_TOKEN</code> to render the live basemap. The filtered records are already connected to this view.
        </div>
      ) : null}

      <div className="map-shell">
        {MAPBOX_TOKEN ? (
          <DeckGL initialViewState={NYC_VIEW_STATE} controller layers={layers}>
            <Map
              ref={mapRef}
              reuseMaps
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              onMoveEnd={syncBoundsToFilter}
            />
          </DeckGL>
        ) : (
          <div className="map-fallback">
            <strong>{records.length.toLocaleString()}</strong>
            <span>filtered complaints ready for mapping</span>
          </div>
        )}
      </div>
    </Panel>
  );
}