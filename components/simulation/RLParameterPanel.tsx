'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RLWeights, defaultWeights } from '@/lib/simulation/rl-agent';
import { Settings, RotateCcw, Sparkles } from 'lucide-react';

interface RLParameterPanelProps {
  weights: RLWeights;
  onWeightsChange: (weights: Partial<RLWeights>) => void;
  onReset?: () => void;
}

const parameterInfo = {
  w1: {
    name: '정시성 (Punctuality)',
    description: '열차 정시 운행 중요도',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
  },
  w2: {
    name: '비용 절감 (Cost Saving)',
    description: 'SMP 기반 에너지 비용 절감 중요도',
    color: 'text-primary',
    bgColor: 'bg-primary',
  },
  w3: {
    name: '그리드 동기화 (Grid Sync)',
    description: 'Green Window 활용 중요도',
    color: 'text-[#00ffd5]',
    bgColor: 'bg-[#00ffd5]',
  },
  w4: {
    name: '안전성 (Safety)',
    description: '제약 조건 위반 페널티 강도',
    color: 'text-red-400',
    bgColor: 'bg-red-400',
  },
};

export function RLParameterPanel({
  weights,
  onWeightsChange,
  onReset,
}: RLParameterPanelProps) {
  const handleSliderChange = (key: keyof RLWeights, value: number[]) => {
    onWeightsChange({ [key]: value[0] });
  };

  const handlePreset = (preset: 'costFocus' | 'greenFocus' | 'balanced') => {
    switch (preset) {
      case 'costFocus':
        onWeightsChange({ w1: 0.2, w2: 0.6, w3: 0.15, w4: 0.05 });
        break;
      case 'greenFocus':
        onWeightsChange({ w1: 0.2, w2: 0.2, w3: 0.55, w4: 0.05 });
        break;
      case 'balanced':
        onWeightsChange({ ...defaultWeights });
        break;
    }
  };

  // 가중치 합계 계산
  const totalWeight = weights.w1 + weights.w2 + weights.w3 + weights.w4;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            강화학습 파라미터
          </div>
          <Badge
            variant={Math.abs(totalWeight - 1) < 0.01 ? 'default' : 'destructive'}
            className={Math.abs(totalWeight - 1) < 0.01 ? 'bg-primary/20 text-primary' : ''}
          >
            합계: {totalWeight.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 프리셋 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset('balanced')}
            className="flex-1"
          >
            균형
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset('costFocus')}
            className="flex-1"
          >
            비용 중심
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset('greenFocus')}
            className="flex-1"
          >
            친환경 중심
          </Button>
        </div>

        {/* 파라미터 슬라이더 */}
        {(Object.keys(parameterInfo) as (keyof RLWeights)[]).map((key) => {
          const info = parameterInfo[key];
          const value = weights[key];

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-medium ${info.color}`}>
                    {info.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {info.description}
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {value.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${info.bgColor}`} />
                <Slider
                  value={[value]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => handleSliderChange(key, v)}
                  className="flex-1"
                />
              </div>
            </div>
          );
        })}

        {/* 리셋 버튼 */}
        {onReset && (
          <Button variant="outline" onClick={onReset} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            기본값으로 리셋
          </Button>
        )}

        {/* 보상 함수 수식 */}
        <div className="rounded-lg bg-secondary/30 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            보상 함수
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            R = {weights.w1.toFixed(2)} × R_정시성 + {weights.w2.toFixed(2)} × R_비용
            <br />
            &nbsp;&nbsp;&nbsp;+ {weights.w3.toFixed(2)} × R_그리드 - {weights.w4.toFixed(2)} × P_안전
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
