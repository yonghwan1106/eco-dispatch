'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DuckCurveChart } from '@/components/dashboard/DuckCurveChart';
import { GreenWindowIndicator } from '@/components/dashboard/GreenWindowIndicator';
import { SMPPriceGauge } from '@/components/dashboard/SMPPriceGauge';
import { GridStatusPanel } from '@/components/dashboard/GridStatusPanel';
import { RealTimeMetrics, DetailedMetrics } from '@/components/dashboard/RealTimeMetrics';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, getTrainsByHour } from '@/lib/data/mock-trains';
import { useSimulationStore } from '@/store/simulation-store';
import {
  Train,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Hexagon,
  Award,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function DashboardPage() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const { initializeData, gridData, trains } = useSimulationStore();

  // 데이터 초기화
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 데이터가 없으면 생성
  const displayGridData = useMemo(() => {
    return gridData.length > 0 ? gridData : generateGridData();
  }, [gridData]);

  const displayTrains = useMemo(() => {
    return trains.length > 0 ? trains : generateMockTrains();
  }, [trains]);

  // 현재 시간대 운행 열차 계산
  const runningTrains = useMemo(() => {
    return getTrainsByHour(displayTrains, currentHour);
  }, [displayTrains, currentHour]);

  // 총 전력 소비량 계산
  const totalPowerConsumption = useMemo(() => {
    return runningTrains.reduce((sum, train) => sum + train.energyConsumption, 0);
  }, [runningTrains]);

  // 일일 절감액
  const todaySavings = useMemo(() => {
    const baselineCost = displayTrains.reduce((sum, train) => {
      const hour = Math.floor(train.scheduledDeparture / 60);
      return sum + train.energyConsumption * displayGridData[hour].smp;
    }, 0);
    return Math.round(baselineCost * 0.15);
  }, [displayTrains, displayGridData]);

  // CO2 감축량 계산
  const co2Reduction = useMemo(() => {
    const avgCarbonReduction = 50;
    return Math.round(totalPowerConsumption * avgCarbonReduction);
  }, [totalPowerConsumption]);

  // 운영 효율 지표
  const operationalMetrics = useMemo(() => {
    const greenWindowHours = displayGridData.filter((g) => g.isGreenWindow).length;
    return {
      greenWindowHours,
      peakAvoidance: 78,
      avgPunctuality: 96,
      energyEfficiency: 85,
    };
  }, [displayGridData]);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary/80 via-secondary/40 to-transparent p-8">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full hex-grid opacity-30" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="max-w-2xl">
              {/* 공모전 뱃지 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-[#ffb800]/20 via-[#00ff9d]/20 to-[#00b4ff]/20 border border-[#ffb800]/40 backdrop-blur-sm"
              >
                <Award className="h-4 w-4 text-[#ffb800]" />
                <span className="text-xs font-display font-semibold tracking-wide text-[#ffb800]">
                  2026 그린레일 챌린지 공모전
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
              </motion.div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                  <Hexagon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-display">
                  Real-time Dashboard
                </span>
              </div>

              <h1 className="text-3xl font-display font-bold tracking-wide mb-3">
                <span className="text-gradient">실시간</span>
                <span className="text-foreground"> 에너지 모니터링</span>
              </h1>

              <p className="text-muted-foreground leading-relaxed max-w-xl">
                신재생 에너지 연계 열차 운행 현황 및 전력망 상태를 실시간으로 모니터링합니다.
                AI 기반 최적화로 에너지 비용을 절감하고 탄소 중립을 실현합니다.
              </p>

              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-plasma" />
                  <span className="text-sm text-muted-foreground">시스템 정상</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent">
                    {runningTrains.length}개 열차 운행 중
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="hidden xl:grid grid-cols-2 gap-4">
              <div className="holo-card rounded-xl p-4 min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">Today Savings</span>
                </div>
                <div className="font-display text-2xl font-bold text-primary text-glow">
                  {(todaySavings / 10000).toFixed(1)}
                  <span className="text-sm font-normal text-primary/60 ml-1">만원</span>
                </div>
              </div>

              <div className="holo-card rounded-xl p-4 min-w-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-accent" />
                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">CO2 Reduced</span>
                </div>
                <div className="font-display text-2xl font-bold text-accent text-glow-neon">
                  {(co2Reduction / 1000).toFixed(1)}
                  <span className="text-sm font-normal text-accent/60 ml-1">톤</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      <motion.div variants={itemVariants}>
        <RealTimeMetrics
          runningTrains={runningTrains.length}
          totalPowerConsumption={totalPowerConsumption}
          todaySavings={todaySavings}
          co2Reduction={co2Reduction}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Duck Curve Chart - Wide Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <DuckCurveChart gridData={displayGridData} currentHour={currentHour} />
        </motion.div>

        {/* Green Window Status */}
        <motion.div variants={itemVariants}>
          <GreenWindowIndicator gridData={displayGridData} currentHour={currentHour} />
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SMP Price Gauge */}
        <motion.div variants={itemVariants}>
          <SMPPriceGauge gridData={displayGridData} currentHour={currentHour} />
        </motion.div>

        {/* Grid Status Panel */}
        <motion.div variants={itemVariants}>
          <GridStatusPanel gridData={displayGridData} currentHour={currentHour} />
        </motion.div>

        {/* Detailed Metrics */}
        <motion.div variants={itemVariants}>
          <DetailedMetrics {...operationalMetrics} />
        </motion.div>
      </div>

      {/* Train Status Table */}
      <motion.div variants={itemVariants}>
        <div className="holo-card rounded-2xl p-6 corner-deco">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <Train className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-wide">
                  현재 운행 열차
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentHour}:00 ~ {currentHour + 1}:00 시간대
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-primary">{runningTrains.length}</span>
              <span className="text-xs text-muted-foreground">운행 중</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">열차 ID</th>
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">유형</th>
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">노선</th>
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">구간</th>
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">에너지</th>
                  <th className="pb-3 text-left font-display text-[10px] tracking-wider text-muted-foreground uppercase">상태</th>
                </tr>
              </thead>
              <tbody>
                {runningTrains.slice(0, 8).map((train, index) => (
                  <motion.tr
                    key={train.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 font-mono text-primary">{train.id}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded text-[10px] font-display tracking-wider uppercase bg-secondary/50 border border-primary/10">
                        {train.type}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{train.route}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{train.departureStation}</span>
                        <ArrowRight className="h-3 w-3 text-primary/50" />
                        <span className="text-foreground">{train.arrivalStation}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-accent">
                      {(train.energyConsumption / 1000).toFixed(1)} MWh
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary pulse-plasma" />
                        <span className="text-xs text-primary">운행 중</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {runningTrains.length > 8 && (
              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">
                  외 <span className="font-mono text-primary">{runningTrains.length - 8}</span>개 열차 운행 중
                </span>
              </div>
            )}

            {runningTrains.length === 0 && (
              <div className="py-12 text-center">
                <Train className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">현재 시간대에 운행 중인 열차가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
