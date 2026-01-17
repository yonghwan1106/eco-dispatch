'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GridStatus, getNextGreenWindow } from '@/lib/data/mock-grid';
import { Leaf, Clock, Zap, TrendingUp } from 'lucide-react';

interface GreenWindowIndicatorProps {
  gridData: GridStatus[];
  currentHour: number;
}

export function GreenWindowIndicator({
  gridData,
  currentHour,
}: GreenWindowIndicatorProps) {
  const currentStatus = gridData[currentHour];
  const nextWindow = useMemo(
    () => getNextGreenWindow(gridData),
    [gridData]
  );

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-primary" />
          Green Window 상태
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 메인 상태 표시기 */}
        <div className="flex items-center justify-center">
          <motion.div
            className={`relative flex h-32 w-32 items-center justify-center rounded-full ${
              currentStatus.isGreenWindow
                ? 'bg-primary/20'
                : 'bg-secondary/50'
            }`}
            animate={
              currentStatus.isGreenWindow
                ? {
                    boxShadow: [
                      '0 0 20px rgba(16, 185, 129, 0.3)',
                      '0 0 40px rgba(16, 185, 129, 0.6)',
                      '0 0 20px rgba(16, 185, 129, 0.3)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${
                currentStatus.isGreenWindow
                  ? 'bg-primary/40'
                  : 'bg-secondary'
              }`}
              animate={
                currentStatus.isGreenWindow
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  currentStatus.isGreenWindow
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              >
                <Leaf
                  className={`h-8 w-8 ${
                    currentStatus.isGreenWindow
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 상태 텍스트 */}
        <div className="mt-4 text-center">
          <Badge
            variant={currentStatus.isGreenWindow ? 'default' : 'secondary'}
            className={`text-sm ${
              currentStatus.isGreenWindow
                ? 'bg-primary/20 text-primary border border-primary/50'
                : ''
            }`}
          >
            {currentStatus.isGreenWindow ? 'GREEN WINDOW 활성' : 'GREEN WINDOW 대기'}
          </Badge>
        </div>

        {/* 상세 정보 */}
        <div className="mt-6 space-y-3">
          {/* 잉여 전력 */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00ffd5]" />
              <span className="text-sm text-muted-foreground">잉여 전력</span>
            </div>
            <span
              className={`font-mono text-sm font-medium ${
                currentStatus.surplus > 0 ? 'text-primary' : 'text-destructive'
              }`}
            >
              {currentStatus.surplus > 0 ? '+' : ''}
              {currentStatus.surplus.toFixed(1)} MW
            </span>
          </div>

          {/* 다음 Green Window */}
          {!currentStatus.isGreenWindow && nextWindow && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">다음 Green Window</span>
              </div>
              <span className="font-mono text-sm font-medium text-primary">
                {nextWindow.hoursUntil === 0 ? '곧' : `${nextWindow.hoursUntil}시간 후`}
              </span>
            </div>
          )}

          {/* Green Window 지속 시간 */}
          {currentStatus.isGreenWindow && nextWindow && (
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">지속 시간</span>
              </div>
              <span className="font-mono text-sm font-medium text-primary">
                {nextWindow.duration}시간
              </span>
            </div>
          )}

          {/* 플러스 DR 상태 */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  currentStatus.isPlusDR ? 'bg-[#00ffd5] pulse-glow' : 'bg-muted-foreground'
                }`}
              />
              <span className="text-sm text-muted-foreground">플러스 DR</span>
            </div>
            <Badge
              variant={currentStatus.isPlusDR ? 'outline' : 'secondary'}
              className={
                currentStatus.isPlusDR
                  ? 'border-[#00ffd5]/50 text-[#00ffd5]'
                  : ''
              }
            >
              {currentStatus.isPlusDR ? '발령 중' : '대기'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
