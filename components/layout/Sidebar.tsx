'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Play,
  BarChart3,
  Train,
  Zap,
  Leaf,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/', icon: LayoutDashboard },
  { name: '열차 스케줄', href: '/schedule', icon: Calendar },
  { name: 'AI 시뮬레이션', href: '/simulation', icon: Play },
  { name: '성과 분석', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 glow-green">
            <Train className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground glow-text">
              Eco-Dispatch
            </h1>
            <p className="text-xs text-muted-foreground">Smart Rail Scheduler</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/20 text-primary glow-green'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status Panel */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
              <span className="text-xs font-medium text-primary">시스템 정상 운영</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  전력망 상태
                </span>
                <span className="text-primary">최적</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Leaf className="h-3 w-3" />
                  Green Window
                </span>
                <span className="text-[#00ffd5]">활성</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
