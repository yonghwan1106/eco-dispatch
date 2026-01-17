'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GanttChart } from '@/components/schedule/GanttChart';
import { ScheduleComparison } from '@/components/schedule/ScheduleComparison';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, Train, TrainType, trainTypeConfig, minutesToTime } from '@/lib/data/mock-trains';
import { useSimulationStore } from '@/store/simulation-store';
import {
  Play,
  RotateCcw,
  Filter,
  Zap,
  Clock,
  Train as TrainIcon,
  Calendar,
  ArrowRight,
  Hexagon,
  X,
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

export default function SchedulePage() {
  const { initializeData, gridData, trains, runOptimization } = useSimulationStore();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const displayGridData = useMemo(() => {
    return gridData.length > 0 ? gridData : generateGridData();
  }, [gridData]);

  const displayTrains = useMemo(() => {
    return trains.length > 0 ? trains : generateMockTrains();
  }, [trains]);

  const filteredTrains = useMemo(() => {
    if (selectedType === 'all') return displayTrains;
    return displayTrains.filter((train) => train.type === selectedType);
  }, [displayTrains, selectedType]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    runOptimization();
    setIsOptimizing(false);
  };

  const handleReset = () => {
    initializeData();
    setSelectedTrain(null);
  };

  const trainStats = useMemo(() => {
    return {
      total: displayTrains.length,
      optimized: displayTrains.filter((t) => t.optimizedDeparture !== undefined).length,
      totalEnergy: displayTrains.reduce((sum, t) => sum + t.energyConsumption, 0),
      avgFlexibility: displayTrains.reduce((sum, t) => sum + t.flexibility, 0) / displayTrains.length,
    };
  }, [displayTrains]);

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
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00b4ff]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00b4ff]/20 border border-[#00b4ff]/30">
                  <Calendar className="h-5 w-5 text-[#00b4ff]" />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-[#00b4ff] uppercase font-display">
                  Train Schedule
                </span>
              </div>

              <h1 className="text-3xl font-display font-bold tracking-wide mb-3">
                <span className="text-gradient">열차 스케줄</span>
                <span className="text-foreground"> 최적화</span>
              </h1>

              <p className="text-muted-foreground leading-relaxed max-w-xl">
                열차 운행 스케줄을 시각화하고 AI 기반 최적화를 적용합니다.
                Green Window 시간대에 맞춰 열차 운행을 자동 조정합니다.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-44 bg-secondary/50 border-primary/20">
                  <Filter className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="열차 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 열차</SelectItem>
                  {Object.entries(trainTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                        {config.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowOptimized(!showOptimized)}
                className="border-primary/20 hover:bg-primary/10"
              >
                {showOptimized ? '최적화 숨기기' : '최적화 표시'}
              </Button>

              <Button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="bg-primary hover:bg-primary/90 btn-glow"
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

              <Button variant="outline" onClick={handleReset} className="border-primary/20 hover:bg-primary/10">
                <RotateCcw className="mr-2 h-4 w-4" />
                리셋
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: TrainIcon, label: '총 열차', value: trainStats.total, unit: '편', color: '#00b4ff' },
          { icon: Zap, label: '최적화 완료', value: trainStats.optimized, unit: `/ ${trainStats.total}`, color: '#00ff9d' },
          { icon: Zap, label: '총 에너지', value: Math.round(trainStats.totalEnergy / 1000), unit: 'MWh', color: '#ffb800' },
          { icon: Clock, label: '평균 유연성', value: (trainStats.avgFlexibility * 100).toFixed(0), unit: '%', color: '#00ffd5' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="holo-card rounded-xl p-5 interactive-card"
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">{stat.label}</div>
                <div className="font-display text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">{stat.unit}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Gantt Chart */}
      <motion.div variants={itemVariants}>
        <GanttChart
          trains={filteredTrains}
          gridData={displayGridData}
          showOptimized={showOptimized}
          onTrainClick={setSelectedTrain}
        />
      </motion.div>

      {/* Schedule Comparison */}
      <motion.div variants={itemVariants}>
        <ScheduleComparison trains={displayTrains} gridData={displayGridData} />
      </motion.div>

      {/* Selected Train Detail Modal */}
      {selectedTrain && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="holo-card rounded-2xl p-6 corner-deco"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${trainTypeConfig[selectedTrain.type as TrainType]?.color}20`,
                  border: `1px solid ${trainTypeConfig[selectedTrain.type as TrainType]?.color}40`,
                }}
              >
                <TrainIcon
                  className="h-7 w-7"
                  style={{ color: trainTypeConfig[selectedTrain.type as TrainType]?.color }}
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold tracking-wide">{selectedTrain.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedTrain.route}</span>
                  <span className="text-primary">|</span>
                  <span>{selectedTrain.departureStation}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>{selectedTrain.arrivalStation}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTrain(null)} className="hover:bg-destructive/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
              <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">기존 출발</div>
              <div className="font-mono text-xl font-bold text-foreground">
                {minutesToTime(selectedTrain.scheduledDeparture)}
              </div>
            </div>
            <div className="rounded-xl bg-primary/10 p-4 border border-primary/30">
              <div className="text-[10px] tracking-wider text-primary uppercase mb-2">최적화 출발</div>
              <div className="font-mono text-xl font-bold text-primary text-glow">
                {minutesToTime(selectedTrain.optimizedDeparture ?? selectedTrain.scheduledDeparture)}
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
              <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">에너지 소비</div>
              <div className="font-mono text-xl font-bold text-accent">
                {(selectedTrain.energyConsumption / 1000).toFixed(1)} MWh
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 border border-primary/10">
              <div className="text-[10px] tracking-wider text-muted-foreground uppercase mb-2">유연성</div>
              <div className="font-mono text-xl font-bold text-[#ffb800]">
                {(selectedTrain.flexibility * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
