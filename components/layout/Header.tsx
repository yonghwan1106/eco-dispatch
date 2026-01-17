'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Sun,
  Wind,
  Zap,
  Bell,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGreenWindow, setIsGreenWindow] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Green Window: 10:00-14:00 (태양광 피크)
      const hour = now.getHours();
      setIsGreenWindow(hour >= 10 && hour <= 14);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      {/* Left: Current Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">
            {format(currentTime, 'yyyy.MM.dd (EEE) HH:mm:ss', { locale: ko })}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sun className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">태양광</span>
            <span className="font-mono text-sm font-medium text-yellow-400">78.5 GW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">풍력</span>
            <span className="font-mono text-sm font-medium text-blue-400">12.3 GW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">SMP</span>
            <span className="font-mono text-sm font-medium text-primary">-32 원/kWh</span>
          </div>
        </div>
      </div>

      {/* Right: Actions and Status */}
      <div className="flex items-center gap-4">
        {/* Green Window Status */}
        <Badge
          variant={isGreenWindow ? 'default' : 'secondary'}
          className={isGreenWindow ? 'bg-primary/20 text-primary border border-primary/50' : ''}
        >
          <div className={`mr-1.5 h-2 w-2 rounded-full ${isGreenWindow ? 'bg-primary pulse-glow' : 'bg-muted-foreground'}`} />
          {isGreenWindow ? 'Green Window 활성' : 'Green Window 대기'}
        </Badge>

        {/* Plus DR Status */}
        <Badge variant="outline" className="border-[#00ffd5]/50 text-[#00ffd5]">
          <Zap className="mr-1 h-3 w-3" />
          플러스 DR 대기
        </Badge>

        <div className="h-6 w-px bg-border" />

        {/* Actions */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
