import { component$ } from '@builder.io/qwik';

const VIEWBOX_WIDTH = 660;
const VIEWBOX_HEIGHT = 220;
const PADDING_LEFT = 18;
const PADDING_RIGHT = 10;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 22;
const GRID_ROW_COUNT = 4;

export interface MultiLineChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  showArea?: boolean;
}

interface MultiLineChartProps {
  labels: string[];
  series: MultiLineChartSeries[];
  emptyMessage?: string;
}

export const MultiLineChart = component$<MultiLineChartProps>((props) => {
  const pointCount = props.labels.length;
  if (pointCount < 2 || props.series.length === 0) {
    return <div class="admin-chart-empty">{props.emptyMessage ?? 'Not enough data for this range.'}</div>;
  }

  const width = VIEWBOX_WIDTH;
  const height = VIEWBOX_HEIGHT;
  const plotWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const plotBottom = PADDING_TOP + plotHeight;
  const allValues = props.series.flatMap((series) => series.values.map(sanitizeValue));
  const maxValue = Math.max(1, ...allValues);
  const tickIndexes = computeTickIndexes(pointCount);

  return (
    <div class="admin-multi-line-chart">
      <div class="admin-chart-legend">
        {props.series.map((series) => (
          <span key={series.id} class="admin-chart-legend-item">
            <span class="admin-chart-legend-dot" style={{ background: series.color }}></span>
            <span>{series.label}</span>
          </span>
        ))}
      </div>

      <div class="admin-chart-svg-wrap">
        <svg
          class="admin-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Overview trend chart"
          preserveAspectRatio="none"
        >
          {Array.from({ length: GRID_ROW_COUNT + 1 }).map((_, index) => {
            const ratio = index / GRID_ROW_COUNT;
            const y = PADDING_TOP + ratio * plotHeight;
            return (
              <line
                key={`grid-${index}`}
                x1={PADDING_LEFT}
                y1={y}
                x2={width - PADDING_RIGHT}
                y2={y}
                class="admin-chart-grid-line"
              />
            );
          })}

          {props.series.map((series) => {
            if (!series.showArea) {
              return null;
            }
            const normalizedValues = normalizeSeriesValues(series.values, pointCount);
            const points = normalizedValues.map((value, index) => ({
              x: toX(index, pointCount, plotWidth),
              y: toY(value, maxValue, plotHeight),
            }));
            return (
              <path
                key={`${series.id}-area`}
                d={buildAreaPath(points, plotBottom)}
                fill={series.color}
                class="admin-chart-area"
                transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}
              />
            );
          })}

          {props.series.map((series) => {
            const normalizedValues = normalizeSeriesValues(series.values, pointCount);
            const points = normalizedValues.map((value, index) => ({
              x: toX(index, pointCount, plotWidth),
              y: toY(value, maxValue, plotHeight),
            }));
            return (
              <path
                key={series.id}
                d={buildLinePath(points)}
                stroke={series.color}
                stroke-width="2.4"
                class="admin-chart-line"
                transform={`translate(${PADDING_LEFT}, ${PADDING_TOP})`}
              />
            );
          })}
        </svg>
      </div>

      <div class="admin-chart-axis">
        {tickIndexes.map((index) => (
          <span key={`${props.labels[index]}-${index}`}>{props.labels[index]}</span>
        ))}
      </div>
    </div>
  );
});

function normalizeSeriesValues(values: number[], targetLength: number): number[] {
  if (values.length === targetLength) {
    return values.map(sanitizeValue);
  }
  const normalized: number[] = [];
  for (let i = 0; i < targetLength; i += 1) {
    normalized.push(sanitizeValue(values[i] ?? 0));
  }
  return normalized;
}

function sanitizeValue(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

function toX(index: number, count: number, plotWidth: number): number {
  if (count <= 1) {
    return plotWidth / 2;
  }
  return (index / (count - 1)) * plotWidth;
}

function toY(value: number, maxValue: number, plotHeight: number): number {
  return plotHeight - (value / maxValue) * plotHeight;
}

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return '';
  }
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function buildAreaPath(points: Array<{ x: number; y: number }>, bottomY: number): string {
  if (points.length === 0) {
    return '';
  }
  const first = points[0];
  const last = points[points.length - 1];
  const linePath = buildLinePath(points);
  return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
}

function computeTickIndexes(pointCount: number): number[] {
  if (pointCount <= 1) {
    return [0];
  }
  const ticks = new Set<number>([
    0,
    Math.floor((pointCount - 1) * 0.33),
    Math.floor((pointCount - 1) * 0.66),
    pointCount - 1,
  ]);
  return Array.from(ticks).sort((left, right) => left - right);
}
