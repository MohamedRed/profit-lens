import type { OfferStatsDay } from '../../../lib/types/offer';

export interface ProfitMonthPoint {
  monthIndex: number;
  label: string;
  averageProfitEuro: number;
}

export interface ProfitYearSeries {
  year: number;
  months: ProfitMonthPoint[];
  averageProfitEuro: number;
  growthPercent: number | null;
}

export interface ProfitChartGeometry {
  width: number;
  height: number;
  plotTop: number;
  plotRight: number;
  plotBottom: number;
  plotLeft: number;
  yTicks: number[];
  gridLinesY: number[];
  monthLineX: number[];
  thresholdY: number;
  profitLinePath: string;
  areaPath: string;
}

const chartLayout = {
  width: 720,
  height: 352,
  plotTop: 20,
  plotRight: 18,
  plotBottom: 56,
  plotLeft: 36,
  yTickCount: 6,
} as const;

export const extractProfitYears = (stats: OfferStatsDay[]): number[] => {
  const years = new Set<number>();
  for (const entry of stats) {
    years.add(entry.dayStart.getUTCFullYear());
  }
  if (years.size === 0) {
    years.add(new Date().getUTCFullYear());
  }
  return [...years].sort((a, b) => b - a);
};

export const buildProfitYearSeries = (
  stats: OfferStatsDay[],
  year: number,
  locale: string,
): ProfitYearSeries => {
  const monthAccum = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    label: formatMonthLabel(locale, monthIndex),
    netProfit: 0,
    offerCount: 0,
  }));

  let yearNetProfit = 0;
  let yearOfferCount = 0;
  let previousYearNetProfit = 0;
  let previousYearOfferCount = 0;

  for (const entry of stats) {
    const entryYear = entry.dayStart.getUTCFullYear();
    if (entryYear === year) {
      const month = monthAccum[entry.dayStart.getUTCMonth()];
      month.netProfit += entry.netProfitEuro;
      month.offerCount += entry.offerCount;
      yearNetProfit += entry.netProfitEuro;
      yearOfferCount += entry.offerCount;
      continue;
    }
    if (entryYear === year - 1) {
      previousYearNetProfit += entry.netProfitEuro;
      previousYearOfferCount += entry.offerCount;
    }
  }

  const months: ProfitMonthPoint[] = monthAccum.map((month) => ({
    monthIndex: month.monthIndex,
    label: month.label,
    averageProfitEuro: month.offerCount > 0 ? month.netProfit / month.offerCount : 0,
  }));

  const averageProfitEuro = yearOfferCount > 0 ? yearNetProfit / yearOfferCount : 0;
  const previousAverageProfit =
    previousYearOfferCount > 0 ? previousYearNetProfit / previousYearOfferCount : null;

  const growthPercent =
    previousAverageProfit !== null && Math.abs(previousAverageProfit) > 0.01
      ? ((averageProfitEuro - previousAverageProfit) / Math.abs(previousAverageProfit)) * 100
      : null;

  return {
    year,
    months,
    averageProfitEuro,
    growthPercent,
  };
};

export const buildProfitChartGeometry = (months: ProfitMonthPoint[]): ProfitChartGeometry => {
  const width = chartLayout.width;
  const height = chartLayout.height;
  const plotTop = chartLayout.plotTop;
  const plotRight = width - chartLayout.plotRight;
  const plotBottom = height - chartLayout.plotBottom;
  const plotLeft = chartLayout.plotLeft;

  const values = months.map((month) => month.averageProfitEuro);
  const valueMin = Math.min(...values, 0);
  const valueMax = Math.max(...values, 0);
  const valueRange = Math.max(valueMax - valueMin, 1);
  const paddedMin = valueMin - valueRange * 0.14;
  const paddedMax = valueMax + valueRange * 0.14;

  const toY = (value: number): number => {
    const normalized = (value - paddedMin) / (paddedMax - paddedMin || 1);
    return plotBottom - normalized * (plotBottom - plotTop);
  };

  const yTicks = Array.from({ length: chartLayout.yTickCount }, (_, index) => {
    return paddedMax - (index / (chartLayout.yTickCount - 1)) * (paddedMax - paddedMin);
  });

  const monthLineX = months.map((_, index) => {
    const widthRange = plotRight - plotLeft;
    return plotLeft + (index / 11) * widthRange;
  });

  const points = monthLineX.map((x, index) => ({
    x,
    y: toY(months[index].averageProfitEuro),
  }));

  return {
    width,
    height,
    plotTop,
    plotRight,
    plotBottom,
    plotLeft,
    yTicks,
    gridLinesY: yTicks.map((tick) => toY(tick)),
    monthLineX,
    thresholdY: toY(0),
    profitLinePath: buildSmoothPath(points),
    areaPath: buildAreaPath(points, plotBottom),
  };
};

export const formatAxisValue = (locale: string, value: number): string => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
};

const formatMonthLabel = (locale: string, monthIndex: number): string => {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, monthIndex, 1)));
};

const buildSmoothPath = (points: Array<{ x: number; y: number }>): string => {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = current.x;
    const controlY = current.y;
    const endX = (current.x + next.x) / 2;
    const endY = (current.y + next.y) / 2;
    path += ` Q ${controlX} ${controlY} ${endX} ${endY}`;
  }

  const penultimate = points[points.length - 2];
  const last = points[points.length - 1];
  path += ` Q ${penultimate.x} ${penultimate.y} ${last.x} ${last.y}`;
  return path;
};

const buildAreaPath = (points: Array<{ x: number; y: number }>, baselineY: number): string => {
  if (points.length === 0) {
    return '';
  }
  const linePath = buildSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
};
