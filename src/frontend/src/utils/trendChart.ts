import type { MarketCapTrendPoint } from '../backend';

export interface ChartPoint {
  x: number;
  y: number;
  timestamp: bigint;
  marketCap: bigint;
}

export interface ChartDimensions {
  width: number;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

/**
 * Normalize trend data for chart rendering
 */
export function normalizeTrendData(data: MarketCapTrendPoint[]): ChartPoint[] {
  if (data.length === 0) return [];

  return data.map((point, index) => ({
    x: index,
    y: Number(point.marketCap),
    timestamp: point.timestamp,
    marketCap: point.marketCap,
  }));
}

/**
 * Scale data points to SVG coordinates
 */
export function scaleToSVG(
  points: ChartPoint[],
  dimensions: ChartDimensions
): Array<{ x: number; y: number }> {
  if (points.length === 0) return [];

  const { width, height, paddingTop, paddingBottom, paddingLeft, paddingRight } = dimensions;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find min/max values
  const yValues = points.map((p) => p.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY || 1; // Avoid division by zero

  // Scale points
  return points.map((point, index) => {
    const xScale = points.length > 1 ? index / (points.length - 1) : 0.5;
    const yScale = (point.y - minY) / yRange;

    return {
      x: paddingLeft + xScale * chartWidth,
      y: paddingTop + (1 - yScale) * chartHeight, // Invert Y axis for SVG
    };
  });
}

/**
 * Generate SVG path from scaled points
 */
export function generateSVGPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    // Single point: draw a small circle
    return `M ${points[0].x - 2},${points[0].y} a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0`;
  }

  return points.map((point, index) => (index === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`)).join(' ');
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format market cap value for axis labels
 */
export function formatAxisValue(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Get Y-axis tick values
 */
export function getYAxisTicks(points: ChartPoint[], tickCount: number = 5): number[] {
  if (points.length === 0) return [];

  const yValues = points.map((p) => p.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const range = maxY - minY || 1;

  const ticks: number[] = [];
  for (let i = 0; i < tickCount; i++) {
    ticks.push(minY + (range * i) / (tickCount - 1));
  }

  return ticks;
}
