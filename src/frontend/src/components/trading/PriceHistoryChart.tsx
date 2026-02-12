import { useMemo } from 'react';
import type { PricePoint } from '../../backend';
import { formatPrice } from '../../utils/currency';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface PriceHistoryChartProps {
  data: PricePoint[];
  symbol: string;
  isLoading?: boolean;
}

export function PriceHistoryChart({ data, symbol, isLoading }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort by timestamp ascending
    const sorted = [...data].sort((a, b) => Number(a.timestamp - b.timestamp));
    
    const prices = sorted.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // SVG dimensions
    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Map data points to SVG coordinates
    const points = sorted.map((point, index) => {
      const x = padding.left + (index / (sorted.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      return { x, y, price: point.price };
    });

    // Create SVG path
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Determine trend
    const firstPrice = sorted[0].price;
    const lastPrice = sorted[sorted.length - 1].price;
    const trend = lastPrice >= firstPrice ? 'up' : 'down';

    return {
      pathData,
      points,
      minPrice,
      maxPrice,
      width,
      height,
      padding,
      trend,
      currentPrice: lastPrice,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center bg-muted/20 rounded border border-border">
        <div className="text-center space-y-2">
          <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-sm font-mono text-muted-foreground">Loading price data...</p>
        </div>
      </div>
    );
  }

  if (!chartData || data.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center bg-muted/20 rounded border border-border">
        <div className="text-center space-y-2">
          <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-mono text-muted-foreground">
            No price history available yet. Place the first order to start tracking prices.
          </p>
        </div>
      </div>
    );
  }

  const { pathData, points, minPrice, maxPrice, width, height, padding, trend, currentPrice } = chartData;
  const trendColor = trend === 'up' ? 'text-accent' : 'text-destructive';
  const strokeColor = trend === 'up' ? 'oklch(var(--accent))' : 'oklch(var(--destructive))';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trend === 'up' ? (
            <TrendingUp className={`h-5 w-5 ${trendColor}`} />
          ) : (
            <TrendingDown className={`h-5 w-5 ${trendColor}`} />
          )}
          <span className="font-mono text-sm text-muted-foreground">Price Chart</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-muted-foreground">Current Price</div>
          <div className={`text-lg font-bold font-mono ${trendColor}`}>
            ${formatPrice(currentPrice)}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: '200px' }}
        >
          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="oklch(var(--border))"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="oklch(var(--border))"
            strokeWidth="1"
          />

          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={strokeColor}
              className="opacity-60"
            />
          ))}

          {/* Y-axis labels */}
          <text
            x={padding.left - 10}
            y={padding.top}
            textAnchor="end"
            className="text-xs font-mono fill-muted-foreground"
            dominantBaseline="middle"
          >
            ${formatPrice(maxPrice)}
          </text>
          <text
            x={padding.left - 10}
            y={height - padding.bottom}
            textAnchor="end"
            className="text-xs font-mono fill-muted-foreground"
            dominantBaseline="middle"
          >
            ${formatPrice(minPrice)}
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-xs font-mono fill-muted-foreground"
          >
            {data.length} price points
          </text>
        </svg>
      </div>
    </div>
  );
}
