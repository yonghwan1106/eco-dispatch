'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Play,
  BarChart3,
  Zap,
  Leaf,
  Activity,
  Hexagon,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/', icon: LayoutDashboard, description: 'OVERVIEW' },
  { name: '열차 스케줄', href: '/schedule', icon: Calendar, description: 'SCHEDULE' },
  { name: 'AI 시뮬레이션', href: '/simulation', icon: Play, description: 'AI ENGINE' },
  { name: '성과 분석', href: '/analytics', icon: BarChart3, description: 'ANALYTICS' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 glass-dark hex-grid">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="relative px-6 py-8">
          <div className="flex items-center gap-4">
            {/* Animated Logo Icon */}
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 glow-plasma">
                <Hexagon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-accent" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-display text-xl font-bold tracking-wider text-glow">
                <span className="text-gradient">ECO</span>
                <span className="text-foreground">-DISPATCH</span>
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-1">
                Smart Rail Scheduler
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-6 h-[1px] bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-2">
          <p className="px-3 mb-4 text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">
            Navigation
          </p>

          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'group relative flex items-center gap-4 rounded-lg px-4 py-3.5 transition-all duration-300',
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-accent to-primary rounded-r-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg" />
                    </>
                  )}

                  {/* Icon container */}
                  <div className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-primary/20 glow-plasma'
                      : 'bg-secondary/50 group-hover:bg-primary/10'
                  )}>
                    <item.icon className={cn(
                      'h-5 w-5 transition-colors duration-300',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <span className={cn(
                      'block text-sm font-medium transition-colors duration-300',
                      isActive ? 'text-primary text-glow' : 'text-foreground group-hover:text-primary'
                    )}>
                      {item.name}
                    </span>
                    <span className={cn(
                      'block text-[9px] tracking-[0.15em] uppercase transition-colors duration-300',
                      isActive ? 'text-primary/60' : 'text-muted-foreground/50 group-hover:text-primary/50'
                    )}>
                      {item.description}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary pulse-plasma" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* System Status Panel */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-secondary/80 to-secondary/40 p-4">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            </div>

            <div className="relative">
              {/* Status Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary status-dot" />
                </div>
                <span className="text-xs font-display tracking-wider text-primary">
                  SYSTEM ONLINE
                </span>
              </div>

              {/* Status Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">전력망 상태</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-primary">최적</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Green Window</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-accent">활성</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent pulse-plasma" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">AI Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-[#7c3aed]">대기</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">오늘의 절감량</span>
                  <span className="text-xs font-mono text-primary">78%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent energy-bar"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="px-6 py-4 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-[0.2em] text-muted-foreground/40 uppercase">
              Version 2.4.1
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <div className="w-1 h-1 rounded-full bg-accent/40" />
              <div className="w-1 h-1 rounded-full bg-[#7c3aed]/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </aside>
  );
}
