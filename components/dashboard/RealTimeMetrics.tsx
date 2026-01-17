'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Train, Zap, Leaf, DollarSign, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
  delay?: number;
}

function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  color,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`font-mono text-2xl font-bold ${color}`}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
              {trend && (
                <div
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    trend.isPositive ? 'text-primary' : 'text-destructive'
                  }`}
                >
                  <TrendingUp
                    className={`h-3 w-3 ${
                      !trend.isPositive ? 'rotate-180' : ''
                    }`}
                  />
                  <span>
                    {trend.isPositive ? '+' : ''}
                    {trend.value}% 전일 대비
                  </span>
                </div>
              )}
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-opacity-20 ${color.replace(
                'text-',
                'bg-'
              )}/20`}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RealTimeMetricsProps {
  runningTrains: number;
  totalPowerConsumption: number; // kWh
  todaySavings: number; // 원
  co2Reduction: number; // kg
}

export function RealTimeMetrics({
  runningTrains,
  totalPowerConsumption,
  todaySavings,
  co2Reduction,
}: RealTimeMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="운행 중인 열차"
        value={runningTrains}
        unit="편"
        icon={<Train className="h-5 w-5 text-blue-400" />}
        color="text-blue-400"
        delay={0}
      />
      <MetricCard
        title="총 전력 소비"
        value={Math.round(totalPowerConsumption / 1000)}
        unit="MWh"
        icon={<Zap className="h-5 w-5 text-yellow-400" />}
        trend={{ value: -12, isPositive: true }}
        color="text-yellow-400"
        delay={0.1}
      />
      <MetricCard
        title="오늘 절감액"
        value={Math.round(todaySavings / 10000)}
        unit="만원"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        trend={{ value: 23, isPositive: true }}
        color="text-primary"
        delay={0.2}
      />
      <MetricCard
        title="CO2 감축량"
        value={Math.round(co2Reduction / 1000)}
        unit="톤"
        icon={<Leaf className="h-5 w-5 text-[#00ffd5]" />}
        trend={{ value: 18, isPositive: true }}
        color="text-[#00ffd5]"
        delay={0.3}
      />
    </div>
  );
}

// 상세 메트릭스 패널
interface DetailedMetricsProps {
  greenWindowHours: number;
  peakAvoidance: number;
  avgPunctuality: number;
  energyEfficiency: number;
}

export function DetailedMetrics({
  greenWindowHours,
  peakAvoidance,
  avgPunctuality,
  energyEfficiency,
}: DetailedMetricsProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          운영 효율 지표
        </h3>
        <div className="space-y-4">
          {/* Green Window 활용률 */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Green Window 활용</span>
              <span className="font-mono font-medium text-primary">
                {greenWindowHours}시간
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(greenWindowHours / 24) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* 피크 회피율 */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">피크 시간대 회피율</span>
              <span className="font-mono font-medium text-yellow-400">
                {peakAvoidance}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${peakAvoidance}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          </div>

          {/* 정시성 */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">정시 운행률</span>
              <span className="font-mono font-medium text-blue-400">
                {avgPunctuality}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${avgPunctuality}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* 에너지 효율 */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">에너지 효율</span>
              <span className="font-mono font-medium text-[#00ffd5]">
                {energyEfficiency}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-[#00ffd5]"
                initial={{ width: 0 }}
                animate={{ width: `${energyEfficiency}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
