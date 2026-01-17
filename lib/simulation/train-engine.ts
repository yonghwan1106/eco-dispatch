// 열차 시뮬레이션 엔진

import { Train, TrainType, trainTypeConfig } from '@/lib/data/mock-trains';
import { GridStatus } from '@/lib/data/mock-grid';

export interface ScheduleConstraints {
  minDeparture: number; // 최소 출발 시간 (분)
  maxDeparture: number; // 최대 출발 시간 (분)
  minHeadway: number; // 최소 열차 간격 (분)
  routeCapacity: number; // 노선 시간당 최대 열차 수
}

export interface OptimizationResult {
  train: Train;
  originalDeparture: number;
  optimizedDeparture: number;
  originalCost: number;
  optimizedCost: number;
  costSavings: number;
  greenWindowUsage: boolean;
  delayMinutes: number;
}

// 열차 스케줄 제약 조건
export const defaultConstraints: Record<TrainType, ScheduleConstraints> = {
  KTX: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 10,
    routeCapacity: 6,
  },
  SRT: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 10,
    routeCapacity: 6,
  },
  ITX: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 15,
    routeCapacity: 4,
  },
  MUGUNGHWA: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 20,
    routeCapacity: 3,
  },
  FREIGHT: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 30,
    routeCapacity: 2,
  },
  DEADHEAD: {
    minDeparture: 0,
    maxDeparture: 1440,
    minHeadway: 20,
    routeCapacity: 2,
  },
};

// 시간대별 열차 에너지 비용 계산
export function calculateTrainEnergyCost(
  train: Train,
  departureMinute: number,
  gridData: GridStatus[]
): number {
  const departureHour = Math.floor(departureMinute / 60);
  const arrivalHour = Math.floor(
    (departureMinute + (train.scheduledArrival - train.scheduledDeparture)) / 60
  ) % 24;

  // 운행 시간 동안의 평균 SMP 계산
  let totalSMP = 0;
  let hoursInTransit = 0;

  for (
    let h = departureHour;
    h !== (arrivalHour + 1) % 24;
    h = (h + 1) % 24
  ) {
    totalSMP += gridData[h].smp;
    hoursInTransit++;
    if (hoursInTransit > 24) break; // 무한 루프 방지
  }

  const avgSMP = hoursInTransit > 0 ? totalSMP / hoursInTransit : gridData[departureHour].smp;

  // 비용 = 에너지 소비량 * 평균 SMP
  return train.energyConsumption * avgSMP;
}

// Green Window 시간대 찾기
export function findGreenWindowSlots(
  gridData: GridStatus[],
  trainDuration: number // 분
): { start: number; end: number; avgSMP: number }[] {
  const slots: { start: number; end: number; avgSMP: number }[] = [];

  for (let hour = 0; hour < 24; hour++) {
    if (gridData[hour].isGreenWindow) {
      // Green Window 시작
      let endHour = hour;
      let totalSMP = gridData[hour].smp;
      let count = 1;

      while (
        endHour < 23 &&
        gridData[endHour + 1].isGreenWindow
      ) {
        endHour++;
        totalSMP += gridData[endHour].smp;
        count++;
      }

      const slotDuration = (endHour - hour + 1) * 60;
      if (slotDuration >= trainDuration) {
        slots.push({
          start: hour * 60,
          end: (endHour + 1) * 60,
          avgSMP: totalSMP / count,
        });
      }

      // 다음 Green Window로 건너뛰기
      hour = endHour;
    }
  }

  return slots;
}

// 단일 열차 최적화
export function optimizeTrainSchedule(
  train: Train,
  gridData: GridStatus[],
  existingSchedule: { route: string; departure: number }[]
): OptimizationResult {
  const originalDeparture = train.scheduledDeparture;
  const originalCost = calculateTrainEnergyCost(train, originalDeparture, gridData);
  const trainDuration = train.scheduledArrival - train.scheduledDeparture;

  // 유연성이 낮은 열차는 최적화하지 않음
  if (train.flexibility < 0.3) {
    return {
      train: { ...train },
      originalDeparture,
      optimizedDeparture: originalDeparture,
      originalCost,
      optimizedCost: originalCost,
      costSavings: 0,
      greenWindowUsage: gridData[Math.floor(originalDeparture / 60)].isGreenWindow,
      delayMinutes: 0,
    };
  }

  // 유연성에 따른 이동 가능 범위 계산
  const maxShift = Math.floor(train.flexibility * 180); // 최대 3시간 이동 가능
  const minDeparture = Math.max(0, originalDeparture - maxShift);
  const maxDeparture = Math.min(1440 - trainDuration, originalDeparture + maxShift);

  // Green Window 슬롯 찾기
  const greenSlots = findGreenWindowSlots(gridData, trainDuration);

  let bestDeparture = originalDeparture;
  let bestCost = originalCost;

  // 30분 단위로 탐색
  for (let dep = minDeparture; dep <= maxDeparture; dep += 30) {
    // 제약 조건 확인: 같은 노선 열차와의 간격
    const constraints = defaultConstraints[train.type];
    const hasConflict = existingSchedule.some(
      (s) =>
        s.route === train.route &&
        Math.abs(s.departure - dep) < constraints.minHeadway
    );

    if (hasConflict) continue;

    const cost = calculateTrainEnergyCost(train, dep, gridData);

    if (cost < bestCost) {
      bestCost = cost;
      bestDeparture = dep;
    }
  }

  // Green Window 내 출발 시 추가 우선순위
  for (const slot of greenSlots) {
    if (slot.start >= minDeparture && slot.start <= maxDeparture) {
      const dep = slot.start;
      const cost = calculateTrainEnergyCost(train, dep, gridData);

      // Green Window 보너스: 10% 추가 할인 적용
      const adjustedCost = cost * 0.9;

      if (adjustedCost < bestCost * 0.95) {
        bestCost = adjustedCost;
        bestDeparture = dep;
      }
    }
  }

  const optimizedArrival =
    bestDeparture + (train.scheduledArrival - train.scheduledDeparture);

  const optimizedTrain: Train = {
    ...train,
    optimizedDeparture: bestDeparture,
    optimizedArrival,
  };

  return {
    train: optimizedTrain,
    originalDeparture,
    optimizedDeparture: bestDeparture,
    originalCost,
    optimizedCost: bestCost,
    costSavings: originalCost - bestCost,
    greenWindowUsage: gridData[Math.floor(bestDeparture / 60)].isGreenWindow,
    delayMinutes: bestDeparture - originalDeparture,
  };
}

// 전체 스케줄 최적화
export function optimizeAllTrains(
  trains: Train[],
  gridData: GridStatus[]
): {
  results: OptimizationResult[];
  totalOriginalCost: number;
  totalOptimizedCost: number;
  totalSavings: number;
  greenWindowUtilization: number;
} {
  // 우선순위 순으로 정렬 (높은 우선순위 먼저)
  const sortedTrains = [...trains].sort((a, b) => b.priority - a.priority);

  const results: OptimizationResult[] = [];
  const optimizedSchedule: { route: string; departure: number }[] = [];

  let totalOriginalCost = 0;
  let totalOptimizedCost = 0;
  let greenWindowCount = 0;

  for (const train of sortedTrains) {
    const result = optimizeTrainSchedule(train, gridData, optimizedSchedule);
    results.push(result);

    totalOriginalCost += result.originalCost;
    totalOptimizedCost += result.optimizedCost;

    if (result.greenWindowUsage) {
      greenWindowCount++;
    }

    // 최적화된 스케줄에 추가
    optimizedSchedule.push({
      route: train.route,
      departure: result.optimizedDeparture,
    });
  }

  return {
    results,
    totalOriginalCost: Math.round(totalOriginalCost),
    totalOptimizedCost: Math.round(totalOptimizedCost),
    totalSavings: Math.round(totalOriginalCost - totalOptimizedCost),
    greenWindowUtilization:
      trains.length > 0
        ? Math.round((greenWindowCount / trains.length) * 100)
        : 0,
  };
}

// 열차 운행 상태 시뮬레이션
export interface TrainPosition {
  trainId: string;
  progress: number; // 0-1
  currentStation: string;
  nextStation: string;
  currentSpeed: number; // km/h
  energyUsed: number; // kWh
  status: 'stopped' | 'accelerating' | 'cruising' | 'decelerating';
}

export function simulateTrainPosition(
  train: Train,
  currentTimeMinute: number
): TrainPosition | null {
  const departure = train.optimizedDeparture ?? train.scheduledDeparture;
  const arrival = train.optimizedArrival ?? train.scheduledArrival;

  if (currentTimeMinute < departure) {
    return null; // 아직 출발 전
  }

  if (currentTimeMinute >= arrival) {
    return null; // 이미 도착
  }

  const elapsed = currentTimeMinute - departure;
  const duration = arrival - departure;
  const progress = elapsed / duration;

  // 속도 프로파일 시뮬레이션
  let status: 'stopped' | 'accelerating' | 'cruising' | 'decelerating';
  let speed: number;
  const maxSpeed = train.type === 'KTX' || train.type === 'SRT' ? 305 : 150;

  if (progress < 0.1) {
    status = 'accelerating';
    speed = maxSpeed * (progress / 0.1);
  } else if (progress > 0.9) {
    status = 'decelerating';
    speed = maxSpeed * ((1 - progress) / 0.1);
  } else {
    status = 'cruising';
    speed = maxSpeed;
  }

  return {
    trainId: train.id,
    progress,
    currentStation: train.departureStation,
    nextStation: train.arrivalStation,
    currentSpeed: Math.round(speed),
    energyUsed: Math.round(train.energyConsumption * progress),
    status,
  };
}
