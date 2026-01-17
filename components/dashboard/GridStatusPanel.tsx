'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GridStatus, calculateDailyStats } from '@/lib/data/mock-grid';
import { Sun, Wind, Factory, Battery, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface GridStatusPanelProps {
  gridData: GridStatus[];
  currentHour: number;
}

export function GridStatusPanel({ gridData, currentHour }: GridStatusPanelProps) {
  const currentStatus = gridData[currentHour];
  const dailyStats = calculateDailyStats(gridData);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-primary" />
            전력망 상태
          </div>
          <Badge
            variant="outline"
            className={`${
              currentStatus.surplus > 0
                ? 'border-primary/50 text-primary'
                : 'border-destructive/50 text-destructive'
            }`}
          >
            {currentStatus.surplus > 0 ? '잉여 전력' : '전력 부족'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 발전원별 현황 */}
        <div className="space-y-3">
          {/* 태양광 */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/20">
              <Sun className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">태양광</span>
                <span className="font-mono text-sm font-medium text-yellow-400">
                  {currentStatus.solarGeneration.toFixed(1)} MW
                </span>
              </div>
              <Progress
                value={(currentStatus.solarGeneration / 100) * 100}
                className="mt-1 h-1.5 bg-secondary"
              />
            </div>
          </div>

          {/* 풍력 */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
              <Wind className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">풍력</span>
                <span className="font-mono text-sm font-medium text-blue-400">
                  {currentStatus.windGeneration.toFixed(1)} MW
                </span>
              </div>
              <Progress
                value={(currentStatus.windGeneration / 30) * 100}
                className="mt-1 h-1.5 bg-secondary"
              />
            </div>
          </div>

          {/* 전력 수요 */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/20">
              <Factory className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">수요</span>
                <span className="font-mono text-sm font-medium text-red-400">
                  {currentStatus.demand.toFixed(1)} MW
                </span>
              </div>
              <Progress
                value={(currentStatus.demand / 100) * 100}
                className="mt-1 h-1.5 bg-secondary"
              />
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-border" />

        {/* 일일 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-primary" />
              재생에너지 비율
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-primary">
              {dailyStats.renewableRatio}%
            </div>
          </div>

          <div className="rounded-lg bg-secondary/30 p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 text-[#00ffd5]" />
              탄소 집약도
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-[#00ffd5]">
              {currentStatus.carbonIntensity}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                g/kWh
              </span>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
          <div>
            <div className="text-xs text-muted-foreground">오늘의 Green Window</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-primary">
              {dailyStats.greenWindowHours}시간
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">플러스 DR 발령</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-[#00ffd5]">
              {dailyStats.plusDRHours}시간
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
