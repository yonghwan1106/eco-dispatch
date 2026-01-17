'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, trainTypeConfig, minutesToTime } from '@/lib/data/mock-trains';
import { GridStatus } from '@/lib/data/mock-grid';
import { ArrowRight, TrendingDown, Leaf, Clock, Zap } from 'lucide-react';

interface ScheduleComparisonProps {
  trains: Train[];
  gridData: GridStatus[];
}

export function ScheduleComparison({ trains, gridData }: ScheduleComparisonProps) {
  // 비용 계산
  const costAnalysis = useMemo(() => {
    let originalCost = 0;
    let optimizedCost = 0;
    let greenWindowTrains = 0;

    trains.forEach((train) => {
      const originalHour = Math.floor(train.scheduledDeparture / 60);
      const optimizedHour = Math.floor((train.optimizedDeparture ?? train.scheduledDeparture) / 60);

      originalCost += train.energyConsumption * gridData[originalHour].smp;
      optimizedCost += train.energyConsumption * gridData[optimizedHour].smp;

      if (gridData[optimizedHour].isGreenWindow) {
        greenWindowTrains++;
      }
    });

    const savings = originalCost - optimizedCost;
    const savingsPercent = originalCost > 0 ? (savings / originalCost) * 100 : 0;

    return {
      originalCost,
      optimizedCost,
      savings,
      savingsPercent,
      greenWindowTrains,
      greenWindowPercent: trains.length > 0 ? (greenWindowTrains / trains.length) * 100 : 0,
    };
  }, [trains, gridData]);

  // 최적화된 열차 목록 (변경된 것만)
  const optimizedTrains = useMemo(() => {
    return trains
      .filter((train) => train.optimizedDeparture !== undefined && train.optimizedDeparture !== train.scheduledDeparture)
      .sort((a, b) => {
        const aSavings = Math.abs((a.optimizedDeparture ?? 0) - a.scheduledDeparture);
        const bSavings = Math.abs((b.optimizedDeparture ?? 0) - b.scheduledDeparture);
        return bSavings - aSavings;
      })
      .slice(0, 10);
  }, [trains]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 비용 비교 카드 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            비용 비교 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 기존 vs 최적화 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg bg-secondary/30 p-4">
              <div className="text-sm text-muted-foreground">기존 스케줄</div>
              <div className="mt-1 font-mono text-2xl font-bold text-muted-foreground">
                {Math.round(costAnalysis.originalCost / 10000).toLocaleString()}
                <span className="ml-1 text-sm font-normal">만원</span>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-primary" />
            <div className="flex-1 rounded-lg bg-primary/10 p-4 border border-primary/30">
              <div className="text-sm text-primary">AI 최적화</div>
              <div className="mt-1 font-mono text-2xl font-bold text-primary">
                {Math.round(costAnalysis.optimizedCost / 10000).toLocaleString()}
                <span className="ml-1 text-sm font-normal">만원</span>
              </div>
            </div>
          </div>

          {/* 절감액 */}
          <div className="rounded-lg bg-primary/20 p-4 text-center">
            <div className="text-sm text-muted-foreground">일일 절감액</div>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-bold text-primary glow-text">
                {Math.round(costAnalysis.savings / 10000).toLocaleString()}
              </span>
              <span className="text-lg text-primary">만원</span>
              <Badge className="bg-primary/30 text-primary">
                -{costAnalysis.savingsPercent.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* 추가 지표 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3">
              <Leaf className="h-8 w-8 text-[#00ffd5]" />
              <div>
                <div className="text-xs text-muted-foreground">Green Window 활용</div>
                <div className="font-mono text-lg font-bold text-[#00ffd5]">
                  {costAnalysis.greenWindowPercent.toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3">
              <Zap className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-xs text-muted-foreground">연간 예상 절감</div>
                <div className="font-mono text-lg font-bold text-yellow-400">
                  {Math.round((costAnalysis.savings * 365) / 100000000).toLocaleString()}억
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스케줄 변경 상세 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            스케줄 변경 상세
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">열차</th>
                  <th className="pb-2 font-medium">기존</th>
                  <th className="pb-2 font-medium">최적화</th>
                  <th className="pb-2 font-medium">변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {optimizedTrains.map((train) => {
                  const shift = (train.optimizedDeparture ?? 0) - train.scheduledDeparture;
                  const config = trainTypeConfig[train.type as keyof typeof trainTypeConfig];

                  return (
                    <tr key={train.id}>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: config?.color || '#6b7280' }}
                          />
                          <span className="font-mono text-primary">{train.id}</span>
                        </div>
                      </td>
                      <td className="py-2 font-mono text-muted-foreground">
                        {minutesToTime(train.scheduledDeparture)}
                      </td>
                      <td className="py-2 font-mono">
                        {minutesToTime(train.optimizedDeparture ?? train.scheduledDeparture)}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant={shift > 0 ? 'secondary' : 'default'}
                          className={shift < 0 ? 'bg-primary/20 text-primary border-primary/50' : ''}
                        >
                          {shift > 0 ? `+${shift}` : shift}분
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {optimizedTrains.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                AI 최적화를 실행하면 스케줄 변경 내역이 표시됩니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
