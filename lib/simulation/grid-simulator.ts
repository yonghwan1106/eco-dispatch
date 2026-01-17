// 전력망 시뮬레이터

import { GridStatus, generateGridData } from '@/lib/data/mock-grid';

export interface GridSimulatorConfig {
  updateInterval: number; // ms
  speedMultiplier: number; // 1x, 2x, 4x, 8x
  startHour: number;
}

export interface SimulatedGridState extends GridStatus {
  timestamp: Date;
  simulatedHour: number;
  simulatedMinute: number;
}

// 실시간 그리드 상태 시뮬레이션
export function simulateGridAtTime(
  gridData: GridStatus[],
  hour: number,
  minute: number
): SimulatedGridState {
  const currentStatus = gridData[hour];
  const nextStatus = gridData[(hour + 1) % 24];

  // 분 단위 보간
  const ratio = minute / 60;

  const interpolate = (current: number, next: number) =>
    current + (next - current) * ratio;

  return {
    ...currentStatus,
    solarGeneration: interpolate(
      currentStatus.solarGeneration,
      nextStatus.solarGeneration
    ),
    windGeneration: interpolate(
      currentStatus.windGeneration,
      nextStatus.windGeneration
    ),
    totalRenewable: interpolate(
      currentStatus.totalRenewable,
      nextStatus.totalRenewable
    ),
    demand: interpolate(currentStatus.demand, nextStatus.demand),
    surplus: interpolate(currentStatus.surplus, nextStatus.surplus),
    smp: Math.round(interpolate(currentStatus.smp, nextStatus.smp)),
    carbonIntensity: Math.round(
      interpolate(currentStatus.carbonIntensity, nextStatus.carbonIntensity)
    ),
    timestamp: new Date(),
    simulatedHour: hour,
    simulatedMinute: minute,
  };
}

// 시간대별 전력 비용 계산
export function calculateEnergyCost(
  energyKWh: number,
  gridStatus: GridStatus
): number {
  // SMP 기반 비용 계산
  let costPerKWh = gridStatus.smp;

  // 플러스 DR 발령 시 추가 인센티브
  if (gridStatus.isPlusDR) {
    costPerKWh -= 30; // kWh당 30원 인센티브
  }

  // Green Window 시 추가 할인
  if (gridStatus.isGreenWindow) {
    costPerKWh -= 20; // kWh당 20원 추가 할인
  }

  return energyKWh * costPerKWh;
}

// 하루 전체 비용 시뮬레이션
export function simulateDailyCost(
  gridData: GridStatus[],
  hourlyEnergyConsumption: number[]
): {
  totalCost: number;
  hourlyBreakdown: { hour: number; energy: number; cost: number; smp: number }[];
  greenWindowSavings: number;
  plusDRSavings: number;
} {
  let totalCost = 0;
  let greenWindowSavings = 0;
  let plusDRSavings = 0;
  const hourlyBreakdown: { hour: number; energy: number; cost: number; smp: number }[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const energy = hourlyEnergyConsumption[hour] || 0;
    const gridStatus = gridData[hour];
    const baseCost = energy * gridStatus.smp;
    const actualCost = calculateEnergyCost(energy, gridStatus);

    totalCost += actualCost;

    if (gridStatus.isGreenWindow) {
      greenWindowSavings += energy * 20;
    }
    if (gridStatus.isPlusDR) {
      plusDRSavings += energy * 30;
    }

    hourlyBreakdown.push({
      hour,
      energy,
      cost: actualCost,
      smp: gridStatus.smp,
    });
  }

  return {
    totalCost: Math.round(totalCost),
    hourlyBreakdown,
    greenWindowSavings: Math.round(greenWindowSavings),
    plusDRSavings: Math.round(plusDRSavings),
  };
}

// 탄소 배출량 계산
export function calculateCarbonEmission(
  energyKWh: number,
  gridStatus: GridStatus
): number {
  // gCO2 = kWh * gCO2/kWh
  return energyKWh * gridStatus.carbonIntensity;
}

// 하루 전체 탄소 배출량
export function simulateDailyCarbonEmission(
  gridData: GridStatus[],
  hourlyEnergyConsumption: number[]
): {
  totalEmission: number; // kgCO2
  hourlyEmission: number[];
  avgIntensity: number;
} {
  let totalEmission = 0;
  const hourlyEmission: number[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const energy = hourlyEnergyConsumption[hour] || 0;
    const emission = calculateCarbonEmission(energy, gridData[hour]);
    totalEmission += emission;
    hourlyEmission.push(emission);
  }

  const avgIntensity =
    gridData.reduce((sum, g) => sum + g.carbonIntensity, 0) / 24;

  return {
    totalEmission: Math.round(totalEmission / 1000), // kg 단위로 변환
    hourlyEmission: hourlyEmission.map((e) => Math.round(e / 1000)),
    avgIntensity: Math.round(avgIntensity),
  };
}

// Green Window 최적화 효과 계산
export function calculateOptimizationBenefit(
  baselineSchedule: { hour: number; energy: number }[],
  optimizedSchedule: { hour: number; energy: number }[],
  gridData: GridStatus[]
): {
  baselineCost: number;
  optimizedCost: number;
  costSavings: number;
  savingsPercent: number;
  baselineCarbon: number;
  optimizedCarbon: number;
  carbonReduction: number;
} {
  const baselineEnergy = new Array(24).fill(0);
  const optimizedEnergy = new Array(24).fill(0);

  baselineSchedule.forEach(({ hour, energy }) => {
    baselineEnergy[hour] += energy;
  });

  optimizedSchedule.forEach(({ hour, energy }) => {
    optimizedEnergy[hour] += energy;
  });

  const baselineCostResult = simulateDailyCost(gridData, baselineEnergy);
  const optimizedCostResult = simulateDailyCost(gridData, optimizedEnergy);

  const baselineCarbonResult = simulateDailyCarbonEmission(gridData, baselineEnergy);
  const optimizedCarbonResult = simulateDailyCarbonEmission(gridData, optimizedEnergy);

  const costSavings = baselineCostResult.totalCost - optimizedCostResult.totalCost;
  const carbonReduction = baselineCarbonResult.totalEmission - optimizedCarbonResult.totalEmission;

  return {
    baselineCost: baselineCostResult.totalCost,
    optimizedCost: optimizedCostResult.totalCost,
    costSavings,
    savingsPercent:
      baselineCostResult.totalCost > 0
        ? Math.round((costSavings / baselineCostResult.totalCost) * 100)
        : 0,
    baselineCarbon: baselineCarbonResult.totalEmission,
    optimizedCarbon: optimizedCarbonResult.totalEmission,
    carbonReduction,
  };
}
