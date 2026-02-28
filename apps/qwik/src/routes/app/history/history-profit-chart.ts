import type { OfferStatsDay } from '../../../lib/types/offer';

export interface ProfitChartGeometry {
  width: number;
  height: number;
  plotTop: number;
  plotRight: number;
  plotBottom: number;
  plotLeft: number;
  tickValues: number[];
  gridLinesY: number[];
  thresholdY: number;
  linePath: string;
  areaPath: string;
}

export interface ProfitSparklineGeometry {
  width: number;
  height: number;
  path: string;
}

const chartLayout = {
  width: 720,
  height: 352,
  plotTop: 20,
  plotRight: 18,
  plotBottom: 56,
  plotLeft: 12,
} as const;

export const buildProfitSeriesValues = (stats: OfferStatsDay[]): number[] => {
  return [...stats]
    .sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime())
    .map((entry) => (entry.offerCount > 0 ? entry.netProfitEuro / entry.offerCount : 0))
    .filter((value) => Number.isFinite(value));
};

export const buildProfitChartGeometry = (values: number[]): ProfitChartGeometry => {
  const width = chartLayout.width;
  const height = chartLayout.height;
  const plotTop = chartLayout.plotTop;
  const plotRight = width - chartLayout.plotRight;
  const plotBottom = height - chartLayout.plotBottom;
  const plotLeft = chartLayout.plotLeft;

  const maxAbsValue = values.length > 0 ? values.reduce((acc, value) => Math.max(acc, Math.abs(value)), 0) : 0;
  const normalizedMax = maxAbsValue > 0 ? maxAbsValue : 1;
  const normalizedMin = -normalizedMax;

  const usableWidth = plotRight - plotLeft;
  const usableHeight = plotBottom - plotTop;

  const toY = (value: number): number => {
    const ratio = (value - normalizedMin) / (normalizedMax - normalizedMin || 1);
    return plotBottom - ratio * usableHeight;
  };

  const points = values.map((value, index) => {
    const x =
      plotLeft +
      (values.length <= 1 ? usableWidth / 2 : (index / (values.length - 1)) * usableWidth);
    return {
      x,
      y: toY(value),
    };
  });

  const tickValues = [normalizedMax, normalizedMax / 2, 0, normalizedMin / 2, normalizedMin];
  const gridLinesY = tickValues.map((value) => toY(value));
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`
      : '';

  return {
    width,
    height,
    plotTop,
    plotRight,
    plotBottom,
    plotLeft,
    tickValues,
    gridLinesY,
    thresholdY: toY(0),
    linePath,
    areaPath,
  };
};

export const buildProfitSparklineGeometry = (
  values: number[],
  width = 140,
  height = 64,
  padding = 6,
): ProfitSparklineGeometry => {
  const normalized = values.filter((value) => Number.isFinite(value));
  if (normalized.length === 0) {
    const centerY = height / 2;
    return {
      width,
      height,
      path: `M ${padding} ${centerY} L ${width - padding} ${centerY}`,
    };
  }

  const minValue = Math.min(...normalized);
  const maxValue = Math.max(...normalized);
  const spread = maxValue - minValue || 1;
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);

  const path = normalized
    .map((value, index) => {
      const x =
        padding +
        (normalized.length <= 1 ? usableWidth / 2 : (index / (normalized.length - 1)) * usableWidth);
      const ratio = (value - minValue) / spread;
      const y = height - padding - ratio * usableHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return {
    width,
    height,
    path,
  };
};
