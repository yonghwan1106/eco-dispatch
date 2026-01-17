'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GridStatus } from '@/lib/data/mock-grid';

interface DuckCurveChartProps {
  gridData: GridStatus[];
  currentHour?: number;
}

export function DuckCurveChart({ gridData, currentHour }: DuckCurveChartProps) {
  const chartData = useMemo(() => {
    return gridData.map((g) => ({
      hour: `${g.hour}:00`,
      hourNum: g.hour,
      solar: g.solarGeneration,
      wind: g.windGeneration,
      demand: g.demand,
      surplus: g.surplus,
      isGreenWindow: g.isGreenWindow,
    }));
  }, [gridData]);

  // Green Window 영역 찾기
  const greenWindowAreas = useMemo(() => {
    const areas: { start: number; end: number }[] = [];
    let start: number | null = null;

    gridData.forEach((g, i) => {
      if (g.isGreenWindow && start === null) {
        start = i;
      } else if (!g.isGreenWindow && start !== null) {
        areas.push({ start, end: i - 1 });
        start = null;
      }
    });

    if (start !== null) {
      areas.push({ start, end: gridData.length - 1 });
    }

    return areas;
  }, [gridData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 font-medium text-foreground">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="text-muted-foreground">태양광:</span>
              <span className="font-mono text-yellow-400">
                {data.solar.toFixed(1)} MW
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-muted-foreground">풍력:</span>
              <span className="font-mono text-blue-400">
                {data.wind.toFixed(1)} MW
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-muted-foreground">수요:</span>
              <span className="font-mono text-red-400">
                {data.demand.toFixed(1)} MW
              </span>
            </p>
            <div className="mt-2 border-t border-border pt-2">
              <p className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    data.surplus > 0 ? 'bg-primary' : 'bg-destructive'
                  }`}
                />
                <span className="text-muted-foreground">잉여:</span>
                <span
                  className={`font-mono ${
                    data.surplus > 0 ? 'text-primary' : 'text-destructive'
                  }`}
                >
                  {data.surplus > 0 ? '+' : ''}
                  {data.surplus.toFixed(1)} MW
                </span>
              </p>
            </div>
            {data.isGreenWindow && (
              <div className="mt-2 rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                Green Window 활성
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          전력 수급 현황 (Duck Curve)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(16, 185, 129, 0.1)"
              />
              <XAxis
                dataKey="hour"
                stroke="#6ee7b7"
                fontSize={12}
                tickLine={false}
                interval={2}
              />
              <YAxis
                stroke="#6ee7b7"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                label={{
                  value: 'MW',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#6ee7b7', fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Green Window 영역 */}
              {greenWindowAreas.map((area, i) => (
                <ReferenceArea
                  key={i}
                  x1={chartData[area.start]?.hour}
                  x2={chartData[area.end]?.hour}
                  fill="#10b981"
                  fillOpacity={0.1}
                />
              ))}

              {/* 현재 시간 표시 */}
              {currentHour !== undefined && (
                <ReferenceLine
                  x={`${currentHour}:00`}
                  stroke="#00ffd5"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}

              <Area
                type="monotone"
                dataKey="solar"
                stackId="1"
                stroke="#fbbf24"
                fill="url(#solarGradient)"
                name="태양광"
              />
              <Area
                type="monotone"
                dataKey="wind"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#windGradient)"
                name="풍력"
              />
              <Area
                type="monotone"
                dataKey="demand"
                stroke="#ef4444"
                fill="none"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="수요"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-muted-foreground">태양광 발전</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">풍력 발전</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-red-400" />
            <span className="text-muted-foreground">전력 수요</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-primary/30" />
            <span className="text-muted-foreground">Green Window</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
