import React from 'react';
import type { MarketCapTrendPoint } from '../../backend';
import { normalizeTrendData, scaleToSVG, generateSVGPath } from '../../utils/trendChart';

interface MarketCapSparklineProps {
  data: MarketCapTrendPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function MarketCapSparkline({ data, width = 80, height = 30, className = '' }: MarketCapSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  const points = normalizeTrendData(data);
  const dimensions = {
    width,
    height,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 2,
  };

  const scaledPoints = scaleToSVG(points, dimensions);
  const pathData = generateSVGPath(scaledPoints);

  // Determine trend direction
  const firstValue = points[0]?.y || 0;
  const lastValue = points[points.length - 1]?.y || 0;
  const isPositive = lastValue >= firstValue;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={pathData}
        fill="none"
        stroke={isPositive ? 'oklch(var(--success))' : 'oklch(var(--destructive))'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
