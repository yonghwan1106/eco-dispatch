'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains } from '@/lib/data/mock-trains';
import { analyzeDailyCost, analyzeDailyCarbon, analyzeROI, projectAnnualMetrics, CONSTANTS } from '@/lib/simulation/energy-calculator';
import { useSimulationStore } from '@/store/simulation-store';
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
} from 'lucide-react';

export default function AnalyticsPage() {
  const { initializeData, gridData, trains } = useSimulationStore();
  const [implementationCost, setImplementationCost] = useState(50); // 억원

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

  // 분석 결과 계산
  const costAnalysis = useMemo(() => {
    return analyzeDailyCost(displayTrains, displayGridData);
  }, [displayTrains, displayGridData]);

  const carbonAnalysis = useMemo(() => {
    return analyzeDailyCarbon(displayTrains, displayGridData);
  }, [displayTrains, displayGridData]);

  const roiAnalysis = useMemo(() => {
    return analyzeROI(costAnalysis, implementationCost * 100000000);
  }, [costAnalysis, implementationCost]);

  const annualProjection = useMemo(() => {
    return projectAnnualMetrics({
      dailyCost: costAnalysis,
      dailyCarbon: carbonAnalysis,
      roi: roiAnalysis,
      operationalMetrics: {
        totalTrains: displayTrains.length,
        optimizedTrains: displayTrains.filter((t) => t.optimizedDeparture).length,
        avgDelayMinutes: 15,
        punctualityRate: 96,
        greenWindowUtilization: Math.round((costAnalysis.greenWindowHits / displayTrains.length) * 100),
      },
    });
  }, [costAnalysis, carbonAnalysis, roiAnalysis, displayTrains]);

  // 월별 데이터
  const monthlyData = useMemo(() => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months.map((month, i) => ({
      month,
      savings: annualProjection.monthlySavings[i] / 10000, // 만원
      cumulative: annualProjection.cumulativeSavings[i] / 10000,
      carbon: Math.round((carbonAnalysis.reduction * [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]) / 1000), // 톤
    }));
  }, [annualProjection, carbonAnalysis]);

  // 시간대별 효율 데이터
  const hourlyEfficiency = useMemo(() => {
    return displayGridData.map((g, i) => ({
      hour: `${i}시`,
      smp: g.smp,
      renewable: g.totalRenewable,
      efficiency: g.isGreenWindow ? 100 : g.surplus > 0 ? 70 : 40,
      isGreenWindow: g.isGreenWindow,
    }));
  }, [displayGridData]);

  // 비용 구성 차트 데이터
  const costBreakdown = [
    { name: 'Green Window 절감', value: Math.round(costAnalysis.greenWindowHits * 20 * 3000 / 10000), color: '#10b981' },
    { name: '피크 회피 절감', value: Math.round(costAnalysis.peakAvoidance * 50 * 3000 / 10000), color: '#fbbf24' },
    { name: 'SMP 최적화', value: Math.round(costAnalysis.savings / 10000 * 0.3), color: '#3b82f6' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 font-medium text-foreground">{label}</p>
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
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">성과 분석</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eco-Dispatch 시스템의 비용 절감 및 환경 개선 효과를 분석합니다.
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          리포트 다운로드
        </Button>
      </div>

      {/* 핵심 KPI 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">연간 비용 절감</div>
                <div className="mt-1 font-mono text-3xl font-bold text-primary">
                  {Math.round(roiAnalysis.annualSavings / 100000000)}
                  <span className="ml-1 text-lg font-normal">억원</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                  <ArrowUpRight className="h-3 w-3" />
                  일일 {Math.round(costAnalysis.savings / 10000).toLocaleString()}만원 절감
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-[#00ffd5]/20 to-transparent backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">연간 탄소 감축</div>
                <div className="mt-1 font-mono text-3xl font-bold text-[#00ffd5]">
                  {annualProjection.annualCarbonReduction.toLocaleString()}
                  <span className="ml-1 text-lg font-normal">톤</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#00ffd5]">
                  <TreePine className="h-3 w-3" />
                  나무 {carbonAnalysis.treesEquivalent.toLocaleString()}그루 효과
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00ffd5]/20">
                <Leaf className="h-6 w-6 text-[#00ffd5]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-yellow-400/20 to-transparent backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">손익분기점</div>
                <div className="mt-1 font-mono text-3xl font-bold text-yellow-400">
                  {roiAnalysis.paybackPeriod.toFixed(1)}
                  <span className="ml-1 text-lg font-normal">년</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-yellow-400">
                  <Target className="h-3 w-3" />
                  투자 비용 {implementationCost}억원 기준
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-400/20">
                <Calculator className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-blue-400/20 to-transparent backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">5년 ROI</div>
                <div className="mt-1 font-mono text-3xl font-bold text-blue-400">
                  {roiAnalysis.fiveYearROI}
                  <span className="ml-1 text-lg font-normal">%</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-400">
                  <TrendingUp className="h-3 w-3" />
                  10년 ROI: {roiAnalysis.tenYearROI}%
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/20">
                <Award className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 분석 탭 */}
      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="cost">비용 분석</TabsTrigger>
          <TabsTrigger value="carbon">탄소 감축</TabsTrigger>
          <TabsTrigger value="roi">ROI 분석</TabsTrigger>
          <TabsTrigger value="efficiency">운영 효율</TabsTrigger>
        </TabsList>

        {/* 비용 분석 탭 */}
        <TabsContent value="cost" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 월별 절감액 차트 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">월별 비용 절감 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="month" stroke="#6ee7b7" fontSize={12} />
                      <YAxis stroke="#6ee7b7" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="savings" fill="#10b981" name="월간 절감액 (만원)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 누적 절감액 차트 */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">누적 절감액</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="month" stroke="#6ee7b7" fontSize={12} />
                      <YAxis stroke="#6ee7b7" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#10b981"
                        fill="url(#cumulativeGradient)"
                        name="누적 절감액 (만원)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 비용 구성 분석 */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">비용 절감 구성</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {costBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {costBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-mono font-medium" style={{ color: item.color }}>
                        {item.value.toLocaleString()}만원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 탄소 감축 탭 */}
        <TabsContent value="carbon" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">월별 탄소 감축량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                      <XAxis dataKey="month" stroke="#6ee7b7" fontSize={12} />
                      <YAxis stroke="#6ee7b7" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="carbon" fill="#00ffd5" name="CO2 감축 (톤)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">환경 영향 지표</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#00ffd5]">
                    {carbonAnalysis.treesEquivalent.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    나무 그루 연간 흡수량 상당
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary/30 p-4 text-center">
                    <TreePine className="mx-auto h-8 w-8 text-[#00ffd5]" />
                    <div className="mt-2 font-mono text-xl font-bold">
                      {Math.round(annualProjection.annualCarbonReduction / 22).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">연간 나무 환산</div>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-4 text-center">
                    <DollarSign className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-2 font-mono text-xl font-bold">
                      {Math.round(carbonAnalysis.carbonCreditValue / 10000).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">탄소배출권 가치 (만원)</div>
                  </div>
                </div>

                <div className="rounded-lg bg-[#00ffd5]/10 p-4 border border-[#00ffd5]/30">
                  <div className="text-sm text-[#00ffd5] font-medium">RE100 달성률 기여</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-[#00ffd5]">
                    +{((carbonAnalysis.reduction / carbonAnalysis.baselineEmission) * 100).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI 분석 탭 */}
        <TabsContent value="roi" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>ROI 계산기</span>
                <Badge variant="outline">투자 비용 조정 가능</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 투자 비용 슬라이더 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">시스템 도입 비용</span>
                  <span className="font-mono text-lg font-bold">{implementationCost}억원</span>
                </div>
                <Slider
                  value={[implementationCost]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={(v) => setImplementationCost(v[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10억원</span>
                  <span>100억원</span>
                </div>
              </div>

              {/* ROI 결과 */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-yellow-400/10 p-4 border border-yellow-400/30 text-center">
                  <div className="text-sm text-yellow-400">손익분기점</div>
                  <div className="mt-2 font-mono text-3xl font-bold text-yellow-400">
                    {roiAnalysis.paybackPeriod.toFixed(1)}년
                  </div>
                </div>
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/30 text-center">
                  <div className="text-sm text-primary">5년 ROI</div>
                  <div className="mt-2 font-mono text-3xl font-bold text-primary">
                    {roiAnalysis.fiveYearROI}%
                  </div>
                </div>
                <div className="rounded-lg bg-blue-400/10 p-4 border border-blue-400/30 text-center">
                  <div className="text-sm text-blue-400">10년 ROI</div>
                  <div className="mt-2 font-mono text-3xl font-bold text-blue-400">
                    {roiAnalysis.tenYearROI}%
                  </div>
                </div>
              </div>

              {/* 수익 예측 차트 */}
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.from({ length: 10 }, (_, i) => ({
                      year: `${i + 1}년차`,
                      cost: implementationCost,
                      savings: Math.round((roiAnalysis.annualSavings * (i + 1)) / 100000000),
                      net: Math.round((roiAnalysis.annualSavings * (i + 1) - implementationCost * 100000000) / 100000000),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                    <XAxis dataKey="year" stroke="#6ee7b7" fontSize={12} />
                    <YAxis stroke="#6ee7b7" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name="투자비용 (억원)" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="savings" stroke="#10b981" name="누적절감 (억원)" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" name="순이익 (억원)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 운영 효율 탭 */}
        <TabsContent value="efficiency" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">시간대별 운영 효율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyEfficiency}>
                    <defs>
                      <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                    <XAxis dataKey="hour" stroke="#6ee7b7" fontSize={12} />
                    <YAxis stroke="#6ee7b7" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      fill="url(#efficiencyGradient)"
                      name="운영 효율 (%)"
                    />
                    <Line type="monotone" dataKey="renewable" stroke="#fbbf24" name="재생에너지 (MW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 운영 지표 카드 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4 text-center">
                <Zap className="mx-auto h-8 w-8 text-yellow-400" />
                <div className="mt-2 font-mono text-2xl font-bold">
                  {displayTrains.length}편
                </div>
                <div className="text-sm text-muted-foreground">일일 운행 열차</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4 text-center">
                <Target className="mx-auto h-8 w-8 text-primary" />
                <div className="mt-2 font-mono text-2xl font-bold">
                  {costAnalysis.greenWindowHits}편
                </div>
                <div className="text-sm text-muted-foreground">Green Window 활용</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4 text-center">
                <Calendar className="mx-auto h-8 w-8 text-blue-400" />
                <div className="mt-2 font-mono text-2xl font-bold">
                  {costAnalysis.peakAvoidance}회
                </div>
                <div className="text-sm text-muted-foreground">피크 시간대 회피</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4 text-center">
                <Award className="mx-auto h-8 w-8 text-[#00ffd5]" />
                <div className="mt-2 font-mono text-2xl font-bold">
                  {costAnalysis.savingsPercent}%
                </div>
                <div className="text-sm text-muted-foreground">비용 절감률</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
