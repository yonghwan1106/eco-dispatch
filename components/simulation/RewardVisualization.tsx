'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EpisodeResult } from '@/lib/simulation/rl-agent';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

interface RewardVisualizationProps {
  episodeResults: EpisodeResult[];
  currentEpisode: number;
}

export function RewardVisualization({
  episodeResults,
  currentEpisode,
}: RewardVisualizationProps) {
  // 에피소드별 데이터 가공
  const episodeData = useMemo(() => {
    return episodeResults.map((result, index) => ({
      episode: index + 1,
      totalReward: Math.round(result.totalReward),
      punctualityRate: result.punctualityRate,
      costSavings: Math.round(result.costSavings / 10000), // 만원 단위
      greenWindowUtilization: result.greenWindowUtilization,
      safetyViolations: result.safetyViolations,
    }));
  }, [episodeResults]);

  // 최근 에피소드 보상 분포
  const latestRewardDistribution = useMemo(() => {
    if (episodeResults.length === 0) return [];

    const latest = episodeResults[episodeResults.length - 1];
    const avgReward = latest.rewardHistory.reduce((a, b) => a + b, 0) / latest.rewardHistory.length;

    return [
      { name: '정시성', value: avgReward * 0.3, fill: '#3b82f6' },
      { name: '비용 절감', value: avgReward * 0.4, fill: '#10b981' },
      { name: '그리드 동기화', value: avgReward * 0.25, fill: '#00ffd5' },
      { name: '안전성', value: -avgReward * 0.05, fill: '#ef4444' },
    ];
  }, [episodeResults]);

  // 최고 성능 에피소드 찾기
  const bestEpisode = useMemo(() => {
    if (episodeResults.length === 0) return null;
    return episodeResults.reduce((best, current) =>
      current.totalReward > best.totalReward ? current : best
    );
  }, [episodeResults]);

  if (episodeResults.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">
            시뮬레이션을 실행하면 학습 결과가 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 font-medium text-foreground">에피소드 {label}</p>
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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            학습 성능 분석
          </div>
          <Badge variant="outline" className="font-mono">
            에피소드 {currentEpisode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reward" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reward">보상 추이</TabsTrigger>
            <TabsTrigger value="metrics">성능 지표</TabsTrigger>
            <TabsTrigger value="summary">요약</TabsTrigger>
          </TabsList>

          {/* 보상 추이 탭 */}
          <TabsContent value="reward" className="space-y-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={episodeData}>
                  <defs>
                    <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                  <XAxis
                    dataKey="episode"
                    stroke="#6ee7b7"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6ee7b7"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalReward"
                    stroke="#10b981"
                    fill="url(#rewardGradient)"
                    name="총 보상"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* 성능 지표 탭 */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={episodeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                  <XAxis
                    dataKey="episode"
                    stroke="#6ee7b7"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6ee7b7"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="punctualityRate"
                    stroke="#3b82f6"
                    name="정시성"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="greenWindowUtilization"
                    stroke="#00ffd5"
                    name="Green Window"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* 요약 탭 */}
          <TabsContent value="summary" className="space-y-4">
            {bestEpisode && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/30">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Award className="h-4 w-4" />
                    최고 보상 에피소드
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold text-primary">
                    #{bestEpisode.episodeNumber + 1}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    보상: {Math.round(bestEpisode.totalReward).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    최고 성능 지표
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">정시성</span>
                      <span className="font-mono text-blue-400">
                        {bestEpisode.punctualityRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">비용 절감</span>
                      <span className="font-mono text-primary">
                        {Math.round(bestEpisode.costSavings / 10000).toLocaleString()}만원
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Green Window</span>
                      <span className="font-mono text-[#00ffd5]">
                        {bestEpisode.greenWindowUtilization}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 학습 진행률 */}
            <div className="rounded-lg bg-secondary/30 p-4">
              <div className="mb-2 text-sm text-muted-foreground">학습 진행률</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min((currentEpisode / 100) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>에피소드 {currentEpisode}</span>
                <span>목표: 100</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
