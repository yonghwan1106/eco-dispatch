'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RLParameterPanel } from '@/components/simulation/RLParameterPanel';
import { RewardVisualization } from '@/components/simulation/RewardVisualization';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, Train, minutesToTime } from '@/lib/data/mock-trains';
import { defaultWeights, RLWeights, runEpisode, EpisodeResult } from '@/lib/simulation/rl-agent';
import { useSimulationStore } from '@/store/simulation-store';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  Zap,
  Timer,
  Train as TrainIcon,
  MapPin,
} from 'lucide-react';

export default function SimulationPage() {
  const { initializeData, gridData, trains, weights, setWeights, episodeResults } = useSimulationStore();

  // 로컬 상태
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0); // 분 단위
  const [localEpisodeResults, setLocalEpisodeResults] = useState<EpisodeResult[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [optimizedTrains, setOptimizedTrains] = useState<Train[]>([]);
  const [localWeights, setLocalWeights] = useState<RLWeights>(defaultWeights);

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

  // 현재 시간대 정보
  const currentHour = Math.floor(currentTime / 60);
  const currentMinute = currentTime % 60;
  const currentGridStatus = displayGridData[currentHour] || displayGridData[0];

  // 시뮬레이션 실행
  const runSimulation = useCallback(async () => {
    if (isRunning && !isPaused) {
      // 에피소드 실행
      const result = runEpisode(displayTrains, displayGridData, localWeights, currentEpisode);

      setLocalEpisodeResults((prev) => [...prev, result]);
      setCurrentEpisode((prev) => prev + 1);

      // 최적화된 열차 스케줄 적용
      const newOptimizedTrains = displayTrains.map((train) => {
        const action = result.actions.find((a) => a.trainId === train.id);
        if (action) {
          const newDeparture = train.scheduledDeparture + action.departureShift;
          const duration = train.scheduledArrival - train.scheduledDeparture;
          return {
            ...train,
            optimizedDeparture: newDeparture,
            optimizedArrival: newDeparture + duration,
          };
        }
        return train;
      });
      setOptimizedTrains(newOptimizedTrains);
    }
  }, [isRunning, isPaused, displayTrains, displayGridData, localWeights, currentEpisode]);

  // 시뮬레이션 루프
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      // 시간 진행
      setCurrentTime((prev) => (prev + simulationSpeed) % 1440);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, simulationSpeed]);

  // 에피소드 자동 실행
  useEffect(() => {
    if (!isRunning || isPaused) return;
    if (currentEpisode >= 100) {
      setIsRunning(false);
      return;
    }

    const episodeInterval = setInterval(() => {
      runSimulation();
    }, 2000 / simulationSpeed);

    return () => clearInterval(episodeInterval);
  }, [isRunning, isPaused, simulationSpeed, currentEpisode, runSimulation]);

  // 컨트롤 핸들러
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setCurrentEpisode(0);
    setLocalEpisodeResults([]);
    setOptimizedTrains([]);
    setLocalWeights(defaultWeights);
    initializeData();
  };

  const handleWeightsChange = (newWeights: Partial<RLWeights>) => {
    setLocalWeights((prev) => ({ ...prev, ...newWeights }));
  };

  // 단일 에피소드 실행
  const handleRunSingleEpisode = () => {
    const result = runEpisode(displayTrains, displayGridData, localWeights, currentEpisode);
    setLocalEpisodeResults((prev) => [...prev, result]);
    setCurrentEpisode((prev) => prev + 1);

    const newOptimizedTrains = displayTrains.map((train) => {
      const action = result.actions.find((a) => a.trainId === train.id);
      if (action) {
        const newDeparture = train.scheduledDeparture + action.departureShift;
        const duration = train.scheduledArrival - train.scheduledDeparture;
        return {
          ...train,
          optimizedDeparture: newDeparture,
          optimizedArrival: newDeparture + duration,
        };
      }
      return train;
    });
    setOptimizedTrains(newOptimizedTrains);
  };

  // 현재 시간대 운행 중인 열차
  const runningTrains = useMemo(() => {
    const trainsToCheck = optimizedTrains.length > 0 ? optimizedTrains : displayTrains;
    return trainsToCheck.filter((train) => {
      const dep = train.optimizedDeparture ?? train.scheduledDeparture;
      const arr = train.optimizedArrival ?? train.scheduledArrival;
      return currentTime >= dep && currentTime <= arr;
    });
  }, [optimizedTrains, displayTrains, currentTime]);

  // 최신 에피소드 결과
  const latestResult = localEpisodeResults[localEpisodeResults.length - 1];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI 시뮬레이션</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            강화학습 기반 열차 스케줄 최적화 시뮬레이션을 실행합니다.
          </p>
        </div>

        {/* 시뮬레이션 컨트롤 */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" />
              시뮬레이션 시작
            </Button>
          ) : isPaused ? (
            <Button onClick={handleResume} className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" />
              재개
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              일시정지
            </Button>
          )}

          <Button variant="outline" onClick={handleRunSingleEpisode} disabled={isRunning && !isPaused}>
            <Activity className="mr-2 h-4 w-4" />
            1 에피소드 실행
          </Button>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            리셋
          </Button>
        </div>
      </div>

      {/* 시뮬레이션 상태 바 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* 현재 시간 */}
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">시뮬레이션 시간</div>
                <div className="font-mono text-lg font-bold">
                  {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* 에피소드 */}
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-xs text-muted-foreground">현재 에피소드</div>
                <div className="font-mono text-lg font-bold text-yellow-400">
                  {currentEpisode} / 100
                </div>
              </div>
            </div>

            {/* 속도 조절 */}
            <div className="flex items-center gap-3">
              <FastForward className="h-5 w-5 text-[#00ffd5]" />
              <div className="w-32">
                <div className="text-xs text-muted-foreground mb-1">
                  속도: {simulationSpeed}x
                </div>
                <Slider
                  value={[simulationSpeed]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(v) => setSimulationSpeed(v[0])}
                />
              </div>
            </div>

            {/* 상태 */}
            <Badge
              variant={isRunning ? (isPaused ? 'secondary' : 'default') : 'outline'}
              className={isRunning && !isPaused ? 'bg-primary/20 text-primary animate-pulse' : ''}
            >
              {isRunning ? (isPaused ? '일시정지' : '실행 중') : '대기'}
            </Badge>

            {/* 진행률 */}
            <div className="flex-1 min-w-[200px]">
              <Progress value={(currentEpisode / 100) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메인 그리드 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 파라미터 패널 */}
        <div>
          <RLParameterPanel
            weights={localWeights}
            onWeightsChange={handleWeightsChange}
            onReset={() => setLocalWeights(defaultWeights)}
          />
        </div>

        {/* 보상 시각화 */}
        <div className="lg:col-span-2">
          <RewardVisualization
            episodeResults={localEpisodeResults}
            currentEpisode={currentEpisode}
          />
        </div>
      </div>

      {/* 하단 정보 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 현재 전력망 상태 */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              현재 전력망 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="text-xs text-muted-foreground">SMP</div>
                <div className={`font-mono text-2xl font-bold ${
                  currentGridStatus.smp < 50 ? 'text-primary' :
                  currentGridStatus.smp < 150 ? 'text-yellow-400' : 'text-destructive'
                }`}>
                  {currentGridStatus.smp}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">원/kWh</span>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="text-xs text-muted-foreground">잉여 전력</div>
                <div className={`font-mono text-2xl font-bold ${
                  currentGridStatus.surplus > 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {currentGridStatus.surplus > 0 ? '+' : ''}{currentGridStatus.surplus.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">MW</span>
                </div>
              </div>
              <div className="rounded-lg p-3 border border-primary/30 bg-primary/10">
                <div className="text-xs text-primary">Green Window</div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {currentGridStatus.isGreenWindow ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="rounded-lg p-3 border border-[#00ffd5]/30 bg-[#00ffd5]/10">
                <div className="text-xs text-[#00ffd5]">플러스 DR</div>
                <div className="font-mono text-2xl font-bold text-[#00ffd5]">
                  {currentGridStatus.isPlusDR ? '발령' : '대기'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 에피소드 결과 요약 */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              최근 에피소드 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestResult ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="text-xs text-muted-foreground">총 보상</div>
                  <div className="font-mono text-2xl font-bold text-primary">
                    {Math.round(latestResult.totalReward).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="text-xs text-muted-foreground">비용 절감</div>
                  <div className="font-mono text-2xl font-bold text-yellow-400">
                    {Math.round(latestResult.costSavings / 10000).toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">만원</span>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="text-xs text-muted-foreground">정시성</div>
                  <div className="font-mono text-2xl font-bold text-blue-400">
                    {latestResult.punctualityRate}%
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="text-xs text-muted-foreground">Green Window 활용</div>
                  <div className="font-mono text-2xl font-bold text-[#00ffd5]">
                    {latestResult.greenWindowUtilization}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-2">시뮬레이션 결과가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 운행 중인 열차 시각화 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrainIcon className="h-5 w-5 text-primary" />
            현재 운행 열차 ({runningTrains.length}편)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-24 rounded-lg bg-secondary/30 overflow-hidden">
            {/* 노선 표시 */}
            <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 bg-border rounded-full" />

            {/* 역 표시 */}
            {['서울', '대전', '동대구', '부산'].map((station, i) => (
              <div
                key={station}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${5 + i * 30}%` }}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">{station}</span>
              </div>
            ))}

            {/* 열차 애니메이션 */}
            {runningTrains.slice(0, 10).map((train, index) => {
              const dep = train.optimizedDeparture ?? train.scheduledDeparture;
              const arr = train.optimizedArrival ?? train.scheduledArrival;
              const progress = (currentTime - dep) / (arr - dep);

              return (
                <motion.div
                  key={train.id}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${5 + progress * 90}%` }}
                  animate={{ x: [-2, 2, -2] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{
                      backgroundColor: train.type === 'KTX' ? '#ef4444' :
                        train.type === 'SRT' ? '#8b5cf6' :
                        train.type === 'FREIGHT' ? '#84cc16' : '#10b981',
                    }}
                  >
                    {index + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {runningTrains.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              현재 시간대에 운행 중인 열차가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
