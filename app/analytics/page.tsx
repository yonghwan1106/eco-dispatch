'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  TrendingUp,
  DollarSign,
  Leaf,
  Award,
  Download,
  Calculator,
  Target,
  TreePine,
  Zap,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Hexagon,
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

// 현실적인 월별 데이터 (하드코딩)
const MONTHLY_DATA = [
  { month: '1월', savings: 4250, cumulative: 4250, carbon: 312 },
  { month: '2월', savings: 3890, cumulative: 8140, carbon: 285 },
  { month: '3월', savings: 4520, cumulative: 12660, carbon: 331 },
  { month: '4월', savings: 4780, cumulative: 17440, carbon: 350 },
  { month: '5월', savings: 5120, cumulative: 22560, carbon: 375 },
  { month: '6월', savings: 5450, cumulative: 28010, carbon: 399 },
  { month: '7월', savings: 5890, cumulative: 33900, carbon: 431 },
  { month: '8월', savings: 5720, cumulative: 39620, carbon: 419 },
  { month: '9월', savings: 5180, cumulative: 44800, carbon: 379 },
  { month: '10월', savings: 4650, cumulative: 49450, carbon: 341 },
  { month: '11월', savings: 4120, cumulative: 53570, carbon: 302 },
  { month: '12월', savings: 4380, cumulative: 57950, carbon: 321 },
];

// 시간대별 효율 데이터
const HOURLY_EFFICIENCY = Array.from({ length: 24 }, (_, i) => {
  const isGreenWindow = i >= 10 && i <= 15;
  const isMorningPeak = i >= 7 && i <= 9;
  const isEveningPeak = i >= 18 && i <= 21;

  let efficiency = 60;
  let renewable = 20;
  let smp = 120;

  if (isGreenWindow) {
    efficiency = 95 + Math.random() * 5;
    renewable = 70 + Math.random() * 20;
    smp = 60 + Math.random() * 20;
  } else if (isMorningPeak || isEveningPeak) {
    efficiency = 35 + Math.random() * 10;
    renewable = 15 + Math.random() * 10;
    smp = 180 + Math.random() * 40;
  } else {
    efficiency = 55 + Math.random() * 15;
    renewable = 25 + Math.random() * 20;
    smp = 100 + Math.random() * 30;
  }

  return {
    hour: `${i}시`,
    efficiency: Math.round(efficiency),
    renewable: Math.round(renewable),
    smp: Math.round(smp),
  };
});

export default function AnalyticsPage() {
  const [implementationCost, setImplementationCost] = useState(50);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 현실적인 KPI 값들 (하드코딩)
  const kpiData = useMemo(() => ({
    annualSavings: 57.9, // 억원
    dailySavings: 1587, // 만원
    annualCarbon: 4245, // 톤
    treesEquivalent: 19295,
    paybackPeriod: implementationCost / 57.9,
    fiveYearROI: Math.round(((57.9 * 5 - implementationCost) / implementationCost) * 100),
    tenYearROI: Math.round(((57.9 * 10 - implementationCost) / implementationCost) * 100),
    greenWindowHits: 38,
    peakAvoidance: 24,
    savingsPercent: 18,
  }), [implementationCost]);

  // 비용 절감 구성
  const costBreakdown = [
    { name: 'Green Window 절감', value: 2280, color: '#00ff9d' },
    { name: '피크 회피 절감', value: 1440, color: '#ffb800' },
    { name: 'SMP 최적화', value: 870, color: '#00b4ff' },
  ];

  // ROI 차트 데이터
  const roiChartData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      year: `${i + 1}년차`,
      cost: implementationCost,
      savings: Math.round(57.9 * (i + 1)),
      net: Math.round(57.9 * (i + 1) - implementationCost),
    }));
  }, [implementationCost]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-primary/30 bg-card/95 backdrop-blur-md p-3 shadow-lg">
          <p className="mb-2 font-display font-medium text-foreground">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-mono" style={{ color: entry.color }}>
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00ff9d]/20 border border-[#00ff9d]/30">
                  <BarChart3 className="h-5 w-5 text-[#00ff9d]" />
                </div>
                <span className="text-[10px] tracking-[0.3em] text-[#00ff9d] uppercase font-display">
                  Performance Analytics
                </span>
              </div>

              <h1 className="text-3xl font-display font-bold tracking-wide mb-3">
                <span className="text-gradient">성과 분석</span>
                <span className="text-foreground"> 리포트</span>
              </h1>

              <p className="text-muted-foreground leading-relaxed max-w-xl">
                Eco-Dispatch 시스템의 비용 절감 및 환경 개선 효과를 분석합니다.
                AI 기반 최적화로 달성한 에너지 절감 성과를 확인하세요.
              </p>
            </div>

            <Button className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black btn-glow">
              <Download className="mr-2 h-4 w-4" />
              리포트 다운로드
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 핵심 KPI 카드 */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: DollarSign,
            label: '연간 비용 절감',
            value: kpiData.annualSavings.toFixed(1),
            unit: '억원',
            subValue: `일일 ${kpiData.dailySavings.toLocaleString()}만원 절감`,
            subIcon: ArrowUpRight,
            color: '#00ff9d',
          },
          {
            icon: Leaf,
            label: '연간 탄소 감축',
            value: kpiData.annualCarbon.toLocaleString(),
            unit: '톤',
            subValue: `나무 ${kpiData.treesEquivalent.toLocaleString()}그루 효과`,
            subIcon: TreePine,
            color: '#00ffd5',
          },
          {
            icon: Calculator,
            label: '손익분기점',
            value: kpiData.paybackPeriod.toFixed(1),
            unit: '년',
            subValue: `투자 비용 ${implementationCost}억원 기준`,
            subIcon: Target,
            color: '#ffb800',
          },
          {
            icon: Award,
            label: '5년 ROI',
            value: kpiData.fiveYearROI,
            unit: '%',
            subValue: `10년 ROI: ${kpiData.tenYearROI}%`,
            subIcon: TrendingUp,
            color: '#00b4ff',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="holo-card rounded-xl p-5 interactive-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">{stat.label}</div>
                <div className="mt-1 font-display text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                  <span className="ml-1 text-lg font-normal opacity-60">{stat.unit}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: stat.color }}>
                  <stat.subIcon className="h-3 w-3" />
                  {stat.subValue}
                </div>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 메인 분석 탭 */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="cost" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-secondary/50 border border-primary/20">
            <TabsTrigger value="cost" className="font-display text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary">비용 분석</TabsTrigger>
            <TabsTrigger value="carbon" className="font-display text-xs tracking-wider data-[state=active]:bg-[#00ffd5]/20 data-[state=active]:text-[#00ffd5]">탄소 감축</TabsTrigger>
            <TabsTrigger value="roi" className="font-display text-xs tracking-wider data-[state=active]:bg-[#ffb800]/20 data-[state=active]:text-[#ffb800]">ROI 분석</TabsTrigger>
            <TabsTrigger value="efficiency" className="font-display text-xs tracking-wider data-[state=active]:bg-[#00b4ff]/20 data-[state=active]:text-[#00b4ff]">운영 효율</TabsTrigger>
          </TabsList>

          {/* 비용 분석 탭 */}
          <TabsContent value="cost" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* 월별 절감액 차트 */}
              <div className="holo-card rounded-2xl p-6 corner-deco">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-wide">월별 비용 절감 추이</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  {isClient && (
                    <ResponsiveContainer>
                      <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 157, 0.1)" />
                        <XAxis dataKey="month" stroke="#00ff9d" fontSize={11} tickLine={false} />
                        <YAxis stroke="#00ff9d" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="savings" fill="#00ff9d" name="월간 절감액 (만원)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* 누적 절감액 차트 */}
              <div className="holo-card rounded-2xl p-6 corner-deco">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-wide">누적 절감액</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  {isClient && (
                    <ResponsiveContainer>
                      <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00ff9d" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 157, 0.1)" />
                        <XAxis dataKey="month" stroke="#00ff9d" fontSize={11} tickLine={false} />
                        <YAxis stroke="#00ff9d" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#00ff9d"
                          fill="url(#cumulativeGradient)"
                          name="누적 절감액 (만원)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* 비용 구성 분석 */}
            <div className="holo-card rounded-2xl p-6 corner-deco">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                  <Hexagon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-wide">비용 절감 구성</h3>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div style={{ width: '100%', height: 250 }}>
                  {isClient && (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-4">
                  {costBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-secondary/50 p-4 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-mono font-medium" style={{ color: item.color }}>
                        {item.value.toLocaleString()}만원
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4 border border-primary/30 mt-4">
                    <span className="text-sm font-semibold">총 일일 절감액</span>
                    <span className="font-mono font-bold text-primary text-lg">
                      {costBreakdown.reduce((sum, item) => sum + item.value, 0).toLocaleString()}만원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 탄소 감축 탭 */}
          <TabsContent value="carbon" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="holo-card rounded-2xl p-6 corner-deco">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ffd5]/20 border border-[#00ffd5]/30">
                    <Leaf className="h-4 w-4 text-[#00ffd5]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-wide">월별 탄소 감축량</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  {isClient && (
                    <ResponsiveContainer>
                      <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 213, 0.1)" />
                        <XAxis dataKey="month" stroke="#00ffd5" fontSize={11} tickLine={false} />
                        <YAxis stroke="#00ffd5" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="carbon" fill="#00ffd5" name="CO2 감축 (톤)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="holo-card rounded-2xl p-6 corner-deco">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00ffd5]/20 border border-[#00ffd5]/30">
                    <TreePine className="h-4 w-4 text-[#00ffd5]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-wide">환경 영향 지표</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <div className="font-display text-5xl font-bold text-[#00ffd5] text-glow-neon">
                      {kpiData.treesEquivalent.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      나무 그루 연간 흡수량 상당
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/50 p-4 text-center border border-[#00ffd5]/20">
                      <TreePine className="mx-auto h-8 w-8 text-[#00ffd5]" />
                      <div className="mt-2 font-mono text-xl font-bold text-[#00ffd5]">
                        {Math.round(kpiData.annualCarbon / 22).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">연간 나무 환산</div>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-4 text-center border border-primary/20">
                      <DollarSign className="mx-auto h-8 w-8 text-primary" />
                      <div className="mt-2 font-mono text-xl font-bold text-primary">
                        {Math.round(kpiData.annualCarbon * 25).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">탄소배출권 가치 (만원)</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#00ffd5]/10 p-4 border border-[#00ffd5]/30">
                    <div className="text-[10px] tracking-wider text-[#00ffd5] uppercase">RE100 달성률 기여</div>
                    <div className="mt-2 font-display text-3xl font-bold text-[#00ffd5] text-glow-neon">
                      +12.8%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ROI 분석 탭 */}
          <TabsContent value="roi" className="space-y-4">
            <div className="holo-card rounded-2xl p-6 corner-deco">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb800]/20 border border-[#ffb800]/30">
                    <Calculator className="h-4 w-4 text-[#ffb800]" />
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-wide">ROI 계산기</h3>
                </div>
                <Badge variant="outline" className="border-[#ffb800]/30 text-[#ffb800]">투자 비용 조정 가능</Badge>
              </div>

              <div className="space-y-6">
                {/* 투자 비용 슬라이더 */}
                <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">시스템 도입 비용</span>
                    <span className="font-mono text-xl font-bold text-[#ffb800]">{implementationCost}억원</span>
                  </div>
                  <Slider
                    value={[implementationCost]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(v) => setImplementationCost(v[0])}
                    className="[&_[role=slider]]:bg-[#ffb800]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10억원</span>
                    <span>100억원</span>
                  </div>
                </div>

                {/* ROI 결과 */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#ffb800]/10 p-5 border border-[#ffb800]/30 text-center">
                    <div className="text-[10px] tracking-wider text-[#ffb800] uppercase">손익분기점</div>
                    <div className="mt-2 font-display text-3xl font-bold text-[#ffb800] text-glow">
                      {kpiData.paybackPeriod.toFixed(1)}년
                    </div>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-5 border border-primary/30 text-center">
                    <div className="text-[10px] tracking-wider text-primary uppercase">5년 ROI</div>
                    <div className="mt-2 font-display text-3xl font-bold text-primary text-glow">
                      {kpiData.fiveYearROI}%
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#00b4ff]/10 p-5 border border-[#00b4ff]/30 text-center">
                    <div className="text-[10px] tracking-wider text-[#00b4ff] uppercase">10년 ROI</div>
                    <div className="mt-2 font-display text-3xl font-bold text-[#00b4ff] text-glow">
                      {kpiData.tenYearROI}%
                    </div>
                  </div>
                </div>

                {/* 수익 예측 차트 */}
                <div style={{ width: '100%', height: 300 }}>
                  {isClient && (
                    <ResponsiveContainer>
                      <LineChart data={roiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 184, 0, 0.1)" />
                        <XAxis dataKey="year" stroke="#ffb800" fontSize={11} tickLine={false} />
                        <YAxis stroke="#ffb800" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="cost" stroke="#ef4444" name="투자비용 (억원)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="savings" stroke="#00ff9d" name="누적절감 (억원)" strokeWidth={2} dot={{ fill: '#00ff9d', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="net" stroke="#00b4ff" name="순이익 (억원)" strokeWidth={2} dot={{ fill: '#00b4ff', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 운영 효율 탭 */}
          <TabsContent value="efficiency" className="space-y-4">
            <div className="holo-card rounded-2xl p-6 corner-deco">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00b4ff]/20 border border-[#00b4ff]/30">
                  <Zap className="h-4 w-4 text-[#00b4ff]" />
                </div>
                <h3 className="font-display text-lg font-semibold tracking-wide">시간대별 운영 효율</h3>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                {isClient && (
                  <ResponsiveContainer>
                    <AreaChart data={HOURLY_EFFICIENCY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00b4ff" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#00b4ff" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 180, 255, 0.1)" />
                      <XAxis dataKey="hour" stroke="#00b4ff" fontSize={11} tickLine={false} />
                      <YAxis stroke="#00b4ff" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#00b4ff"
                        fill="url(#efficiencyGradient)"
                        name="운영 효율 (%)"
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="renewable" stroke="#ffb800" name="재생에너지 (MW)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 운영 지표 카드 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Zap, label: '일일 운행 열차', value: '68편', color: '#ffb800' },
                { icon: Target, label: 'Green Window 활용', value: `${kpiData.greenWindowHits}편`, color: '#00ff9d' },
                { icon: Calendar, label: '피크 시간대 회피', value: `${kpiData.peakAvoidance}회`, color: '#00b4ff' },
                { icon: Award, label: '비용 절감률', value: `${kpiData.savingsPercent}%`, color: '#00ffd5' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className="holo-card rounded-xl p-5 text-center interactive-card"
                >
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl mb-3"
                    style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <div className="font-mono text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
