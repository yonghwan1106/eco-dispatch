'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Sun,
  Wind,
  Zap,
  Bell,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  Waves,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGreenWindow, setIsGreenWindow] = useState(false);
  const [solarValue, setSolarValue] = useState(78.5);
  const [windValue, setWindValue] = useState(12.3);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Green Window: 10:00-14:00 (태양광 피크)
      const hour = now.getHours();
      setIsGreenWindow(hour >= 10 && hour <= 14);

      // Simulate fluctuating values
      setSolarValue(prev => Math.max(50, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setWindValue(prev => Math.max(5, Math.min(25, prev + (Math.random() - 0.5) * 1)));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-dark border-b border-primary/10">
      {/* Decorative top scanline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section: Time & Energy Stats */}
        <div className="flex items-center gap-6">
          {/* Time Display */}
          <div className="relative">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-2 border border-primary/10">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="font-mono text-sm tracking-wide text-foreground">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-[9px] tracking-wider text-muted-foreground uppercase">
                  {format(currentTime, 'yyyy.MM.dd (EEE)', { locale: ko })}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

          {/* Energy Stats */}
          <div className="flex items-center gap-5">
            {/* Solar */}
            <motion.div
              className="group flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/20">
                <Sun className="h-4 w-4 text-[#ffb800]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ffb800] animate-pulse" />
              </div>
              <div>
                <div className="text-[9px] tracking-wider text-muted-foreground/60 uppercase">Solar</div>
                <div className="font-mono text-sm font-medium text-[#ffb800]">
                  {solarValue.toFixed(1)} <span className="text-[10px] text-[#ffb800]/60">GW</span>
                </div>
              </div>
            </motion.div>

            {/* Wind */}
            <motion.div
              className="group flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#00b4ff]/10 border border-[#00b4ff]/20">
                <Wind className="h-4 w-4 text-[#00b4ff]" />
              </div>
              <div>
                <div className="text-[9px] tracking-wider text-muted-foreground/60 uppercase">Wind</div>
                <div className="font-mono text-sm font-medium text-[#00b4ff]">
                  {windValue.toFixed(1)} <span className="text-[10px] text-[#00b4ff]/60">GW</span>
                </div>
              </div>
            </motion.div>

            {/* SMP */}
            <motion.div
              className="group flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-[9px] tracking-wider text-muted-foreground/60 uppercase">SMP</div>
                <div className="font-mono text-sm font-medium text-primary">
                  -32 <span className="text-[10px] text-primary/60">원/kWh</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Section: Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Green Window Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isGreenWindow ? 'active' : 'inactive'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Badge
                variant="outline"
                className={`
                  relative overflow-hidden px-4 py-2 font-display text-[10px] tracking-wider uppercase
                  ${isGreenWindow
                    ? 'border-primary/50 text-primary bg-primary/10'
                    : 'border-muted-foreground/30 text-muted-foreground bg-secondary/30'
                  }
                `}
              >
                {isGreenWindow && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse" />
                )}
                <div className="relative flex items-center gap-2">
                  <div className={`
                    h-2 w-2 rounded-full
                    ${isGreenWindow ? 'bg-primary pulse-plasma' : 'bg-muted-foreground'}
                  `} />
                  <Waves className="h-3.5 w-3.5" />
                  <span>{isGreenWindow ? 'Green Window 활성' : 'Green Window 대기'}</span>
                </div>
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* Plus DR Status */}
          <Badge
            variant="outline"
            className="px-3 py-2 border-accent/30 text-accent bg-accent/5 font-display text-[10px] tracking-wider uppercase"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />
              <span>Plus DR 대기</span>
            </div>
          </Badge>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          {/* Activity Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-primary/10">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-mono text-primary">LIVE</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />
    </header>
  );
}
