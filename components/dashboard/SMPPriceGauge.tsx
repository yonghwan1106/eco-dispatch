'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GridStatus } from '@/lib/data/mock-grid';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SMPPriceGaugeProps {
  gridData: GridStatus[];
  currentHour: number;
}

export function SMPPriceGauge({ gridData, currentHour }: SMPPriceGaugeProps) {
  const currentSMP = gridData[currentHour].smp;
  const prevSMP = gridData[(currentHour - 1 + 24) % 24].smp;
  const avgSMP = useMemo(
    () => gridData.reduce((sum, g) => sum + g.smp, 0) / 24,
    [gridData]
  );

  const chartData = gridData.map((g) => ({
    hour: g.hour,
    smp: g.smp,
  }));

  // 가격 수준 판단
  const priceLevel = useMemo(() => {
    if (currentSMP < 0) return { level: 'negative', label: '마이너스', color: 'text-[#00ffd5]' };
    if (currentSMP < 50) return { level: 'veryLow', label: '매우 저렴', color: 'text-primary' };
    if (currentSMP < 100) return { level: 'low', label: '저렴', color: 'text-green-400' };
    if (currentSMP < 150) return { level: 'normal', label: '보통', color: 'text-yellow-400' };
    if (currentSMP < 200) return { level: 'high', label: '높음', color: 'text-orange-400' };
    return { level: 'veryHigh', label: '매우 높음', color: 'text-destructive' };
  }, [currentSMP]);

  // 변동 방향
  const trend = currentSMP > prevSMP ? 'up' : currentSMP < prevSMP ? 'down' : 'stable';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            SMP 가격
          </div>
          <Badge
            variant="outline"
            className={`${priceLevel.color} border-current`}
          >
            {priceLevel.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 현재 가격 표시 */}
        <div className="mb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className={`font-mono text-4xl font-bold ${priceLevel.color}`}>
                {currentSMP >= 0 ? '' : '-'}
                {Math.abs(currentSMP)}
              </span>
              <span className="text-lg text-muted-foreground">원/kWh</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-destructive" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-primary" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`text-sm ${
                  trend === 'up'
                    ? 'text-destructive'
                    : trend === 'down'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {trend === 'up'
                  ? `+${currentSMP - prevSMP}`
                  : trend === 'down'
                  ? `${currentSMP - prevSMP}`
                  : '변동 없음'}
              </span>
            </div>
          </div>
        </div>

        {/* 가격 게이지 바 */}
        <div className="mb-4">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            {/* 그라데이션 배경 */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #00ffd5 0%, #10b981 25%, #fbbf24 50%, #f97316 75%, #ef4444 100%)',
              }}
            />
            {/* 현재 위치 표시 */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg"
              style={{
                left: `${Math.min(Math.max((currentSMP + 50) / 300 * 100, 0), 100)}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>-50</span>
            <span>50</span>
            <span>150</span>
            <span>250</span>
          </div>
        </div>

        {/* 24시간 추이 차트 */}
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="hour"
                stroke="#6ee7b7"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={5}
              />
              <YAxis hide domain={[-100, 250]} />
              <ReferenceLine y={0} stroke="#6ee7b7" strokeOpacity={0.3} />
              <ReferenceLine
                x={currentHour}
                stroke="#00ffd5"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="smp"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 통계 */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-secondary/30 p-2">
            <div className="text-muted-foreground">최저</div>
            <div className="font-mono font-medium text-primary">
              {Math.min(...gridData.map((g) => g.smp))}원
            </div>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2">
            <div className="text-muted-foreground">평균</div>
            <div className="font-mono font-medium text-yellow-400">
              {Math.round(avgSMP)}원
            </div>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2">
            <div className="text-muted-foreground">최고</div>
            <div className="font-mono font-medium text-destructive">
              {Math.max(...gridData.map((g) => g.smp))}원
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
