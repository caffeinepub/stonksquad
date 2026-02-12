import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { MarketCapTrendPoint } from '../../backend';
import {
  normalizeTrendData,
  scaleToSVG,
  generateSVGPath,
  formatTimestamp,
  formatAxisValue,
  getYAxisTicks,
} from '../../utils/trendChart';
import { formatMarketCap } from '../../utils/currency';

interface MarketCapTrendDialogProps {
  data: MarketCapTrendPoint[] | undefined;
  isLoading: boolean;
  userName: string;
  trigger?: React.ReactNode;
}

export function MarketCapTrendDialog({ data, isLoading, userName, trigger }: MarketCapTrendDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="font-mono">
            <Activity className="h-4 w-4 mr-1" />
            View Trend
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Market Cap Trend</DialogTitle>
          <DialogDescription className="font-mono">{userName}'s creator market cap over time</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <TrendChartContent data={data} userName={userName} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TrendChartContent({ data, userName }: { data: MarketCapTrendPoint[] | undefined; userName: string }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground font-mono text-center">
            No trend data available yet.
            <br />
            Market cap history will appear after trading activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  const points = normalizeTrendData(data);
  const width = 700;
  const height = 300;
  const dimensions = {
    width,
    height,
    paddingTop: 20,
    paddingBottom: 40,
    paddingLeft: 60,
    paddingRight: 20,
  };

  const scaledPoints = scaleToSVG(points, dimensions);
  const pathData = generateSVGPath(scaledPoints);

  // Calculate statistics
  const firstValue = points[0]?.y || 0;
  const lastValue = points[points.length - 1]?.y || 0;
  const maxValue = Math.max(...points.map((p) => p.y));
  const minValue = Math.min(...points.map((p) => p.y));
  const change = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? ((change / firstValue) * 100).toFixed(2) : '0.00';
  const isPositive = change >= 0;

  // Y-axis ticks
  const yTicks = getYAxisTicks(points, 5);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground font-mono mb-1">Current</div>
            <div className="text-2xl font-bold font-mono">{formatMarketCap(BigInt(lastValue))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground font-mono mb-1">Change</div>
            <div className={`text-2xl font-bold font-mono flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {isPositive ? '+' : ''}
              {changePercent}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground font-mono mb-1">Peak</div>
            <div className="text-2xl font-bold font-mono">{formatMarketCap(BigInt(maxValue))}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Y-axis grid lines and labels */}
            {yTicks.map((tick, index) => {
              const yPos =
                dimensions.paddingTop +
                (1 - (tick - minValue) / (maxValue - minValue || 1)) * (height - dimensions.paddingTop - dimensions.paddingBottom);

              return (
                <g key={index}>
                  <line
                    x1={dimensions.paddingLeft}
                    y1={yPos}
                    x2={width - dimensions.paddingRight}
                    y2={yPos}
                    stroke="oklch(var(--border))"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                  <text
                    x={dimensions.paddingLeft - 10}
                    y={yPos}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs font-mono fill-muted-foreground"
                  >
                    {formatAxisValue(tick)}
                  </text>
                </g>
              );
            })}

            {/* X-axis */}
            <line
              x1={dimensions.paddingLeft}
              y1={height - dimensions.paddingBottom}
              x2={width - dimensions.paddingRight}
              y2={height - dimensions.paddingBottom}
              stroke="oklch(var(--border))"
              strokeWidth="1"
            />

            {/* Y-axis */}
            <line
              x1={dimensions.paddingLeft}
              y1={dimensions.paddingTop}
              x2={dimensions.paddingLeft}
              y2={height - dimensions.paddingBottom}
              stroke="oklch(var(--border))"
              strokeWidth="1"
            />

            {/* Trend line */}
            <path
              d={pathData}
              fill="none"
              stroke={isPositive ? 'oklch(var(--success))' : 'oklch(var(--chart-2))'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {scaledPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={isPositive ? 'oklch(var(--success))' : 'oklch(var(--chart-2))'}
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>
                  {formatTimestamp(points[index].timestamp)}: {formatMarketCap(points[index].marketCap)}
                </title>
              </circle>
            ))}

            {/* X-axis labels (first and last timestamp) */}
            {points.length > 0 && (
              <>
                <text
                  x={dimensions.paddingLeft}
                  y={height - dimensions.paddingBottom + 20}
                  textAnchor="start"
                  className="text-xs font-mono fill-muted-foreground"
                >
                  {formatTimestamp(points[0].timestamp)}
                </text>
                {points.length > 1 && (
                  <text
                    x={width - dimensions.paddingRight}
                    y={height - dimensions.paddingBottom + 20}
                    textAnchor="end"
                    className="text-xs font-mono fill-muted-foreground"
                  >
                    {formatTimestamp(points[points.length - 1].timestamp)}
                  </text>
                )}
              </>
            )}
          </svg>
        </CardContent>
      </Card>
    </div>
  );
}
