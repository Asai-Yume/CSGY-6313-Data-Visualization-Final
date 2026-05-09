import { useMemo } from 'react';
import { scaleLinear } from 'd3';
import type { ComplaintRecord, TemporalMatrixRecord } from '../../data/types';
import { buildTemporalMatrix } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { setTemporalCell } from '../../state/filtersSlice';
import { DAY_LABELS, formatHour } from '../../utils/time';
import { Panel } from '../shared/Panel';
import { EmptyState } from '../shared/EmptyState';

type TemporalHeatmapProps = {
  records: ComplaintRecord[];
  precomputedMatrix: TemporalMatrixRecord[];
  totalPointCount: number;
};

function dayToIndex(dayLabel: string): number | null {
  const normalized = dayLabel.trim().toLowerCase();

  if (normalized.startsWith('mon')) return 0;
  if (normalized.startsWith('tue')) return 1;
  if (normalized.startsWith('wed')) return 2;
  if (normalized.startsWith('thu')) return 3;
  if (normalized.startsWith('fri')) return 4;
  if (normalized.startsWith('sat')) return 5;
  if (normalized.startsWith('sun')) return 6;

  return null;
}

function buildMatrixFromPrecomputed(precomputedMatrix: TemporalMatrixRecord[]) {
  const matrix = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: 0,
    })),
  );

  for (const row of precomputedMatrix) {
    const dayIndex = dayToIndex(row.dayOfWeek);
    if (dayIndex === null) continue;
    if (row.hour < 0 || row.hour > 23) continue;

    matrix[dayIndex][row.hour] = {
      day: dayIndex,
      hour: row.hour,
      value: row.count,
    };
  }

  return matrix;
}

export function TemporalHeatmap({
  records,
  precomputedMatrix,
  totalPointCount,
}: TemporalHeatmapProps) {
  const dispatch = useAppDispatch();
  const selectedCell = useAppSelector((state) => state.filters.selectedTemporalCell);

  const derivedMatrix = useMemo(() => buildTemporalMatrix(records), [records]);

  const matrix = useMemo(() => {
    const usePrecomputed = records.length === totalPointCount;

    if (usePrecomputed) {
      return buildMatrixFromPrecomputed(precomputedMatrix);
    }

    return derivedMatrix;
  }, [records.length, totalPointCount, precomputedMatrix, derivedMatrix]);

  const flat = matrix.flat();
  const maxValue = Math.max(...flat.map((cell) => cell.value), 1);

  const color = scaleLinear<string>()
    .domain([0, maxValue * 0.2, maxValue * 0.45, maxValue * 0.7, maxValue])
    .range(['#0b1220', '#2563eb', '#22c55e', '#f59e0b', '#dc2626']);

  const totalValue = flat.reduce((sum, cell) => sum + cell.value, 0);

  if (totalValue === 0) {
    return (
      <Panel title="Temporal heatmap" subtitle="Rows = day of week, columns = hour of day">
        <EmptyState />
      </Panel>
    );
  }

  return (
    <Panel
      title="Temporal heatmap"
      subtitle="Click a cell to filter every view to a specific day-hour window"
      actions={
        selectedCell ? (
          <button className="button-secondary" onClick={() => dispatch(setTemporalCell(null))}>
            Clear time filter
          </button>
        ) : null
      }
    >
      <div className="temporal-grid">
        <div className="temporal-grid__hours">
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour}>{hour % 2 === 0 ? hour : ''}</span>
          ))}
        </div>

        {matrix.map((row, rowIndex) => (
          <div className="temporal-grid__row" key={DAY_LABELS[rowIndex]}>
            <div className="temporal-grid__label">{DAY_LABELS[rowIndex]}</div>
            <div className="temporal-grid__cells">
              {row.map((cell) => {
                const isSelected = selectedCell?.day === cell.day && selectedCell.hour === cell.hour;

                return (
                  <button
                    key={`${cell.day}-${cell.hour}`}
                    type="button"
                    className={`temporal-cell ${isSelected ? 'temporal-cell--selected' : ''}`}
                    style={{ background: color(cell.value) }}
                    title={`${DAY_LABELS[cell.day]} ${formatHour(cell.hour)} · ${cell.value.toLocaleString()} complaints`}
                    onClick={() =>
                      dispatch(
                        isSelected ? setTemporalCell(null) : setTemporalCell({ day: cell.day, hour: cell.hour }),
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="temporal-legend" aria-hidden="true">
        <span>Low</span>
        <div className="temporal-legend__ramp" />
        <span>High</span>
      </div>
    </Panel>
  );
}