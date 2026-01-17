'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RLParameterPanel } from '@/components/simulation/RLParameterPanel';
import { RewardVisualization } from '@/components/simulation/RewardVisualization';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, Train } from '@/lib/data/mock-trains';
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
  Cpu,
  Hexagon,
  Brain,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function SimulationPage() {
  const { initializeData, gridData, trains } = useSimulationStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [localEpisodeResults, setLocalEpisodeResults] = useState<EpisodeResult[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [optimizedTrains, setOptimizedTrains] = useState<Train[]>([]);
  const [localWeights, setLocalWeights] = useState<RLWeights>(defaultWeights);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const displayGridData = useMemo(() => {
    return gridData.length > 0 ? gridData : generateGridData();
  }, [gridData]);

  const displayTrains = useMemo(() => {
    return trains.length > 0 ? trains : generateMockTrains();
  }, [trains]);

  const currentHour = Math.floor(currentTime / 60);
  const currentMinute = currentTime % 60;
  const currentGridStatus = displayGridData[currentHour] || displayGridData[0];

  const runSimulation = useCallback(async () => {
    if (isRunning && !isPaused) {
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
    }
  }, [isRunning, isPaused, displayTrains, displayGridData, localWeights, currentEpisode]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev + simulationSpeed) % 1440);
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, simulationSpeed]);

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

  const handleStart = () => { setIsRunning(true); setIsPaused(false); };
  const handlePause = () => { setIsPaused(true); };
  const handleResume = () => { setIsPaused(false); };

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

  const runningTrains = useMemo(() => {
    const trainsToCheck = optimizedTrains.length > 0 ? optimizedTrains : displayTrains;
    return trainsToCheck.filter((train) => {
      const dep = train.optimizedDeparture ?? train.scheduledDeparture;
      const arr = train.optimizedArrival ?? train.scheduledArrival;
      return currentTime >= dep && currentTime <= arr;
    });
  }, [optimizedTrains, displayTrains, currentTime]);

  const latestResult = localEpisodeResults[localEpisodeResults.length - 1];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary/80 via-secondary/40 to-transparent p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/20 border border-[#7c3aed]/30">
                  <Brain className="h-5 w-5 text-[#7c3aed]" />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-[#7c3aed] uppercase font-display">
                  AI Simulation
                </span>
              </div>

              <h1 className="text-3xl font-display font-bold tracking-wide mb-3">
                <span className="text-gradient">강화학습</span>
                <span className="text-foreground"> 시뮬레이션</span>
              </h1>

              <p className="text-muted-foreground leading-relaxed max-w-xl">
                Q-Learning 기반 강화학습 에이전트가 열차 스케줄을 최적화합니다.
                보상 함수 가중치를 조정하여 다양한 최적화 전략을 실험할 수 있습니다.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {!isRunning ? (
                <Button onClick={handleStart} className="bg-[#7c3aed] hover:bg-[#7c3aed]/90 btn-glow">
                  <Play className="mr-2 h-4 w-4" />
                  시뮬레이션 시작
                </Button>
              ) : isPaused ? (
                <Button onClick={handleResume} className="bg-[#7c3aed] hover:bg-[#7c3aed]/90">
                  <Play className="mr-2 h-4 w-4" />
                  재개
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" className="border-[#7c3aed]/30">
                  <Pause className="mr-2 h-4 w-4" />
                  일시정지
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleRunSingleEpisode}
                disabled={isRunning && !isPaused}
                className="border-primary/20"
              >
                <Activity className="mr-2 h-4 w-4" />
                1 에피소드 실행
              </Button>

              <Button variant="outline" onClick={handleReset} className="border-primary/20">
                <RotateCcw className="mr-2 h-4 w-4" />
                리셋
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div variants={itemVariants}>
        <div className="holo-card rounded-xl p-5">
          <div className="flex flex-wrap items-center gap-6">
            {/* Current Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">시뮬레이션 시간</div>
                <div className="font-mono text-xl font-bold text-primary">
                  {String(currentHour).padStart(2, '0')}:{String(currentMinute).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Episode */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/20">
                <Cpu className="h-5 w-5 text-[#ffb800]" />
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">현재 에피소드</div>
                <div className="font-mono text-xl font-bold text-[#ffb800]">
                  {currentEpisode} / 100
                </div>
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-3">
              <FastForward className="h-5 w-5 text-accent" />
              <div className="w-32">
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">
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

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={`
                px-4 py-2 font-display text-[10px] tracking-wider uppercase
                ${isRunning && !isPaused
                  ? 'border-[#7c3aed]/50 text-[#7c3aed] bg-[#7c3aed]/10 animate-pulse'
                  : 'border-muted-foreground/30 text-muted-foreground'
                }
              `}
            >
              <div className={`mr-2 h-2 w-2 rounded-full ${isRunning && !isPaused ? 'bg-[#7c3aed]' : 'bg-muted-foreground'}`} />
              {isRunning ? (isPaused ? '일시정지' : '실행 중') : '대기'}
            </Badge>

            {/* Progress */}
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">학습 진행률</div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-primary energy-bar transition-all duration-300"
                  style={{ width: `${(currentEpisode / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <RLParameterPanel
            weights={localWeights}
            onWeightsChange={handleWeightsChange}
            onReset={() => setLocalWeights(defaultWeights)}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <RewardVisualization
            episodeResults={localEpisodeResults}
            currentEpisode={currentEpisode}
          />
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Grid Status */}
        <motion.div variants={itemVariants}>
          <div className="holo-card rounded-xl p-6 corner-deco">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold tracking-wide">현재 전력망 상태</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">SMP</div>
                <div className={`font-mono text-2xl font-bold ${
                  currentGridStatus.smp < 50 ? 'text-primary' :
                  currentGridStatus.smp < 150 ? 'text-[#ffb800]' : 'text-destructive'
                }`}>
                  {currentGridStatus.smp}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">원/kWh</span>
                </div>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">잉여 전력</div>
                <div className={`font-mono text-2xl font-bold ${
                  currentGridStatus.surplus > 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {currentGridStatus.surplus > 0 ? '+' : ''}{currentGridStatus.surplus.toFixed(1)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">MW</span>
                </div>
              </div>
              <div className="rounded-xl p-4 border border-primary/30 bg-primary/10">
                <div className="text-[10px] tracking-wider text-primary uppercase mb-2">Green Window</div>
                <div className="font-mono text-2xl font-bold text-primary text-glow">
                  {currentGridStatus.isGreenWindow ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="rounded-xl p-4 border border-accent/30 bg-accent/10">
                <div className="text-[10px] tracking-wider text-accent uppercase mb-2">플러스 DR</div>
                <div className="font-mono text-2xl font-bold text-accent text-glow-neon">
                  {currentGridStatus.isPlusDR ? '발령' : '대기'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Episode Results */}
        <motion.div variants={itemVariants}>
          <div className="holo-card rounded-xl p-6 corner-deco">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                <Activity className="h-5 w-5 text-[#7c3aed]" />
              </div>
              <h3 className="font-display text-lg font-semibold tracking-wide">최근 에피소드 결과</h3>
            </div>

            {latestResult ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                  <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">총 보상</div>
                  <div className="font-mono text-2xl font-bold text-primary">
                    {Math.round(latestResult.totalReward).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                  <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">비용 절감</div>
                  <div className="font-mono text-2xl font-bold text-[#ffb800]">
                    {Math.round(latestResult.costSavings / 10000).toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">만원</span>
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                  <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">정시성</div>
                  <div className="font-mono text-2xl font-bold text-[#00b4ff]">
                    {latestResult.punctualityRate}%
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
                  <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">Green Window 활용</div>
                  <div className="font-mono text-2xl font-bold text-accent">
                    {latestResult.greenWindowUtilization}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 text-muted-foreground/20" />
                <p className="mt-4">시뮬레이션 결과가 없습니다</p>
                <p className="text-sm text-muted-foreground/60">에피소드를 실행하여 결과를 확인하세요</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Train Visualization */}
      <motion.div variants={itemVariants}>
        <div className="holo-card rounded-xl p-6 corner-deco">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <TrainIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold tracking-wide">
              현재 운행 열차 ({runningTrains.length}편)
            </h3>
          </div>

          <div className="relative h-28 rounded-xl bg-secondary/30 overflow-hidden border border-primary/10">
            {/* Route Line */}
            <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full" />

            {/* Stations */}
            {['서울', '대전', '동대구', '부산'].map((station, i) => (
              <div
                key={station}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${8 + i * 28}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
                <span className="text-[10px] tracking-wider text-muted-foreground mt-2 uppercase">{station}</span>
              </div>
            ))}

            {/* Train Animations */}
            {runningTrains.slice(0, 10).map((train, index) => {
              const dep = train.optimizedDeparture ?? train.scheduledDeparture;
              const arr = train.optimizedArrival ?? train.scheduledArrival;
              const progress = Math.min(1, Math.max(0, (currentTime - dep) / (arr - dep)));

              return (
                <motion.div
                  key={train.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${8 + progress * 84}%` }}
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{
                      backgroundColor: train.type === 'KTX' ? '#ef4444' :
                        train.type === 'SRT' ? '#8b5cf6' :
                        train.type === 'FREIGHT' ? '#84cc16' : '#10b981',
                      boxShadow: `0 0 15px ${train.type === 'KTX' ? 'rgba(239, 68, 68, 0.5)' :
                        train.type === 'SRT' ? 'rgba(139, 92, 246, 0.5)' :
                        train.type === 'FREIGHT' ? 'rgba(132, 204, 22, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`,
                    }}
                  >
                    <TrainIcon className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {runningTrains.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              현재 시간대에 운행 중인 열차가 없습니다.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
