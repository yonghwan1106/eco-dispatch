'use client';

import { useEffect, useMemo, useState } from 'react';
import { GanttChart } from '@/components/schedule/GanttChart';
import { ScheduleComparison } from '@/components/schedule/ScheduleComparison';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, Train, TrainType, trainTypeConfig, minutesToTime } from '@/lib/data/mock-trains';
import { optimizeAllTrains } from '@/lib/simulation/train-engine';
import { useSimulationStore } from '@/store/simulation-store';
import { Play, RotateCcw, Filter, Download, Zap, Clock, Train as TrainIcon } from 'lucide-react';

export default function SchedulePage() {
  const { initializeData, gridData, trains, runOptimization, optimizationResults } = useSimulationStore();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  // 데이터 초기화
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 데이터가 없으면 생성
  const displayGridData = useMemo(() => {
    return gridData.length > 0 ? gridData : generateGridData();
  }, [gridData]);

  const displayTrains = useMemo(() => {
    return trains.length > 0 ? trains : generateMockTrains();
  }, [trains]);

  // 필터링된 열차 목록
  const filteredTrains = useMemo(() => {
    if (selectedType === 'all') return displayTrains;
    return displayTrains.filter((train) => train.type === selectedType);
  }, [displayTrains, selectedType]);

  // 최적화 실행
  const handleOptimize = async () => {
    setIsOptimizing(true);

    // 시뮬레이션 효과를 위한 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1500));

    runOptimization();
    setIsOptimizing(false);
  };

  // 리셋
  const handleReset = () => {
    initializeData();
    setSelectedTrain(null);
  };

  // 열차 통계
  const trainStats = useMemo(() => {
    const stats = {
      total: displayTrains.length,
      optimized: displayTrains.filter((t) => t.optimizedDeparture !== undefined).length,
      totalEnergy: displayTrains.reduce((sum, t) => sum + t.energyConsumption, 0),
      avgFlexibility: displayTrains.reduce((sum, t) => sum + t.flexibility, 0) / displayTrains.length,
    };
    return stats;
  }, [displayTrains]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">열차 스케줄</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            열차 운행 스케줄을 시각화하고 AI 최적화를 적용합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="열차 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 열차</SelectItem>
              {Object.entries(trainTypeConfig).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowOptimized(!showOptimized)}
          >
            {showOptimized ? '최적화 숨기기' : '최적화 표시'}
          </Button>

          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="bg-primary hover:bg-primary/90"
          >
            {isOptimizing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                최적화 중...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                AI 최적화 실행
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            리셋
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/20">
              <TrainIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">총 열차</div>
              <div className="font-mono text-2xl font-bold">{trainStats.total}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">최적화 완료</div>
              <div className="font-mono text-2xl font-bold text-primary">
                {trainStats.optimized}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / {trainStats.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-400/20">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">총 에너지</div>
              <div className="font-mono text-2xl font-bold text-yellow-400">
                {Math.round(trainStats.totalEnergy / 1000)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">MWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00ffd5]/20">
              <Clock className="h-6 w-6 text-[#00ffd5]" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">평균 유연성</div>
              <div className="font-mono text-2xl font-bold text-[#00ffd5]">
                {(trainStats.avgFlexibility * 100).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 간트차트 */}
      <GanttChart
        trains={filteredTrains}
        gridData={displayGridData}
        showOptimized={showOptimized}
        onTrainClick={setSelectedTrain}
      />

      {/* 비용 비교 */}
      <ScheduleComparison trains={displayTrains} gridData={displayGridData} />

      {/* 선택된 열차 상세 정보 */}
      {selectedTrain && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${trainTypeConfig[selectedTrain.type as TrainType]?.color}20`,
                  }}
                >
                  <TrainIcon
                    className="h-6 w-6"
                    style={{ color: trainTypeConfig[selectedTrain.type as TrainType]?.color }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedTrain.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTrain.route} | {selectedTrain.departureStation} → {selectedTrain.arrivalStation}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedTrain(null)}>
                닫기
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="text-xs text-muted-foreground">기존 출발</div>
                <div className="font-mono text-lg font-medium">
                  {minutesToTime(selectedTrain.scheduledDeparture)}
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 border border-primary/30">
                <div className="text-xs text-primary">최적화 출발</div>
                <div className="font-mono text-lg font-medium text-primary">
                  {minutesToTime(selectedTrain.optimizedDeparture ?? selectedTrain.scheduledDeparture)}
                </div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="text-xs text-muted-foreground">에너지 소비</div>
                <div className="font-mono text-lg font-medium">
                  {(selectedTrain.energyConsumption / 1000).toFixed(1)} MWh
                </div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="text-xs text-muted-foreground">유연성</div>
                <div className="font-mono text-lg font-medium">
                  {(selectedTrain.flexibility * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
