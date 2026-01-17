'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Train, trainTypeConfig, minutesToTime } from '@/lib/data/mock-trains';
import { GridStatus } from '@/lib/data/mock-grid';
import { Calendar, Clock, Zap } from 'lucide-react';

interface GanttChartProps {
  trains: Train[];
  gridData: GridStatus[];
  showOptimized?: boolean;
  onTrainClick?: (train: Train) => void;
  onTrainDrag?: (trainId: string, newDeparture: number) => void;
}

export function GanttChart({
  trains,
  gridData,
  showOptimized = true,
  onTrainClick,
  onTrainDrag,
}: GanttChartProps) {
  const [hoveredTrain, setHoveredTrain] = useState<string | null>(null);

  // Green Window 영역 계산
  const greenWindowAreas = useMemo(() => {
    const areas: { start: number; end: number }[] = [];
    let start: number | null = null;

    gridData.forEach((g, i) => {
      if (g.isGreenWindow && start === null) {
        start = i;
      } else if (!g.isGreenWindow && start !== null) {
        areas.push({ start, end: i });
        start = null;
      }
    });

    if (start !== null) {
      areas.push({ start, end: 24 });
    }

    return areas;
  }, [gridData]);

  // 열차를 유형별로 그룹화
  const groupedTrains = useMemo(() => {
    const groups: Record<string, Train[]> = {};
    trains.forEach((train) => {
      if (!groups[train.type]) {
        groups[train.type] = [];
      }
      groups[train.type].push(train);
    });
    return groups;
  }, [trains]);

  // 시간 눈금 생성
  const timeMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            열차 스케줄 간트차트
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="mr-1 h-2 w-2 rounded-full bg-muted-foreground inline-block" />
              기존 스케줄
            </Badge>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              <span className="mr-1 h-2 w-2 rounded-full bg-primary inline-block" />
              AI 최적화
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* 헤더: 시간 눈금 */}
            <div className="flex border-b border-border sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <div className="w-40 flex-shrink-0 border-r border-border p-2">
                <span className="text-sm font-medium text-muted-foreground">열차</span>
              </div>
              <div className="flex-1 relative">
                {/* Green Window 배경 */}
                {greenWindowAreas.map((area, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 bg-primary/10"
                    style={{
                      left: `${(area.start / 24) * 100}%`,
                      width: `${((area.end - area.start) / 24) * 100}%`,
                    }}
                  />
                ))}
                <div className="flex">
                  {timeMarkers.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 text-center border-r border-border/30 py-2"
                      style={{ minWidth: '40px' }}
                    >
                      <span className="text-xs text-muted-foreground">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 열차 행 */}
            <TooltipProvider>
              <div className="divide-y divide-border/30">
                {Object.entries(groupedTrains).map(([type, typeTrains]) => (
                  <div key={type}>
                    {/* 그룹 헤더 */}
                    <div className="flex bg-secondary/20">
                      <div className="w-40 flex-shrink-0 border-r border-border p-2 flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: trainTypeConfig[type as keyof typeof trainTypeConfig]?.color || '#6b7280' }}
                        />
                        <span className="text-sm font-medium">
                          {trainTypeConfig[type as keyof typeof trainTypeConfig]?.name || type}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {typeTrains.length}
                        </Badge>
                      </div>
                      <div className="flex-1" />
                    </div>

                    {/* 개별 열차 */}
                    {typeTrains.map((train) => {
                      const originalStart = train.scheduledDeparture;
                      const originalEnd = train.scheduledArrival;
                      const optimizedStart = train.optimizedDeparture ?? originalStart;
                      const optimizedEnd = train.optimizedArrival ?? originalEnd;

                      const originalLeft = (originalStart / 1440) * 100;
                      const originalWidth = ((originalEnd - originalStart) / 1440) * 100;
                      const optimizedLeft = (optimizedStart / 1440) * 100;
                      const optimizedWidth = ((optimizedEnd - optimizedStart) / 1440) * 100;

                      const hasOptimization = train.optimizedDeparture !== undefined;
                      const config = trainTypeConfig[train.type as keyof typeof trainTypeConfig];

                      return (
                        <div
                          key={train.id}
                          className={`flex hover:bg-secondary/10 transition-colors ${
                            hoveredTrain === train.id ? 'bg-secondary/20' : ''
                          }`}
                          onMouseEnter={() => setHoveredTrain(train.id)}
                          onMouseLeave={() => setHoveredTrain(null)}
                        >
                          {/* 열차 정보 */}
                          <div className="w-40 flex-shrink-0 border-r border-border p-2">
                            <div
                              className="text-sm font-mono text-primary cursor-pointer hover:underline"
                              onClick={() => onTrainClick?.(train)}
                            >
                              {train.id}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {train.departureStation} → {train.arrivalStation}
                            </div>
                          </div>

                          {/* 간트 바 영역 */}
                          <div className="flex-1 relative h-14 py-1">
                            {/* Green Window 배경 */}
                            {greenWindowAreas.map((area, i) => (
                              <div
                                key={i}
                                className="absolute top-0 bottom-0 bg-primary/5"
                                style={{
                                  left: `${(area.start / 24) * 100}%`,
                                  width: `${((area.end - area.start) / 24) * 100}%`,
                                }}
                              />
                            ))}

                            {/* 기존 스케줄 바 */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute h-4 top-1 rounded-sm opacity-50"
                                  style={{
                                    left: `${originalLeft}%`,
                                    width: `${Math.max(originalWidth, 0.5)}%`,
                                    backgroundColor: '#6b7280',
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-medium">기존 스케줄</div>
                                  <div>{minutesToTime(originalStart)} - {minutesToTime(originalEnd)}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>

                            {/* 최적화 스케줄 바 */}
                            {showOptimized && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    className={`absolute h-5 bottom-1 rounded-sm cursor-pointer ${
                                      hasOptimization ? 'glow-green' : ''
                                    }`}
                                    style={{
                                      left: `${optimizedLeft}%`,
                                      width: `${Math.max(optimizedWidth, 0.5)}%`,
                                      backgroundColor: hasOptimization ? config?.color || '#10b981' : '#4b5563',
                                    }}
                                    initial={hasOptimization ? { opacity: 0, x: -10 } : {}}
                                    animate={hasOptimization ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => onTrainClick?.(train)}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <div className="h-full flex items-center justify-center px-1 overflow-hidden">
                                      <span className="text-[10px] text-white font-medium truncate">
                                        {train.name}
                                      </span>
                                    </div>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs space-y-1">
                                    <div className="font-medium">{train.name}</div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {minutesToTime(optimizedStart)} - {minutesToTime(optimizedEnd)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      {(train.energyConsumption / 1000).toFixed(1)} MWh
                                    </div>
                                    {hasOptimization && (
                                      <div className="text-primary">
                                        {optimizedStart > originalStart
                                          ? `+${optimizedStart - originalStart}분 지연`
                                          : optimizedStart < originalStart
                                          ? `${originalStart - optimizedStart}분 앞당김`
                                          : '변경 없음'}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 border-t border-border bg-secondary/20">
          {Object.entries(trainTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-8 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-muted-foreground">{config.name}</span>
            </div>
          ))}
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-8 rounded-sm bg-primary/30" />
            <span className="text-muted-foreground">Green Window</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
