// 에너지 및 비용 계산기

import { Train } from '@/lib/data/mock-trains';
import { GridStatus } from '@/lib/data/mock-grid';

// 비용 계산 결과
export interface CostAnalysis {
  baselineCost: number; // 원
  optimizedCost: number; // 원
  savings: number; // 원
  savingsPercent: number; // %
  peakAvoidance: number; // 피크 회피 횟수
  greenWindowHits: number; // Green Window 활용 횟수
}

// 탄소 배출 분석
export interface CarbonAnalysis {
  baselineEmission: number; // kgCO2
  optimizedEmission: number; // kgCO2
  reduction: number; // kgCO2
  reductionPercent: number; // %
  treesEquivalent: number; // 나무 환산 (연간 흡수량 기준)
  carbonCreditValue: number; // 탄소 배출권 가치 (원)
}

// ROI 분석
export interface ROIAnalysis {
  implementationCost: number; // 시스템 도입 비용
  annualSavings: number; // 연간 절감액
  paybackPeriod: number; // 손익분기점 (년)
  fiveYearROI: number; // 5년 ROI (%)
  tenYearROI: number; // 10년 ROI (%)
}

// 상수
export const CONSTANTS = {
  CARBON_PER_TREE_KG: 22, // 나무 1그루 연간 CO2 흡수량 (kg)
  CARBON_CREDIT_PRICE: 25000, // 탄소 배출권 가격 (원/톤)
  SYSTEM_IMPLEMENTATION_COST: 5000000000, // 시스템 도입 비용 (50억원)
  OPERATING_DAYS_PER_YEAR: 365, // 연간 운영 일수
};

// 일일 비용 분석
export function analyzeDailyCost(
  trains: Train[],
  gridData: GridStatus[],
  optimizedSchedule?: Map<string, number> // trainId -> optimizedDeparture
): CostAnalysis {
  let baselineCost = 0;
  let optimizedCost = 0;
  let peakAvoidance = 0;
  let greenWindowHits = 0;

  trains.forEach((train) => {
    // 기존 스케줄 비용
    const originalHour = Math.floor(train.scheduledDeparture / 60);
    const originalSMP = gridData[originalHour].smp;
    baselineCost += train.energyConsumption * originalSMP;

    // 최적화 스케줄 비용
    const optimizedDeparture = optimizedSchedule?.get(train.id) ??
      train.optimizedDeparture ??
      train.scheduledDeparture;
    const optimizedHour = Math.floor(optimizedDeparture / 60);
    const optimizedSMP = gridData[optimizedHour].smp;
    optimizedCost += train.energyConsumption * optimizedSMP;

    // 피크 회피 카운트 (SMP 150 이상을 피크로 정의)
    if (originalSMP >= 150 && optimizedSMP < 150) {
      peakAvoidance++;
    }

    // Green Window 활용
    if (gridData[optimizedHour].isGreenWindow) {
      greenWindowHits++;
    }
  });

  const savings = baselineCost - optimizedCost;

  return {
    baselineCost: Math.round(baselineCost),
    optimizedCost: Math.round(optimizedCost),
    savings: Math.round(savings),
    savingsPercent:
      baselineCost > 0 ? Math.round((savings / baselineCost) * 100) : 0,
    peakAvoidance,
    greenWindowHits,
  };
}

// 일일 탄소 배출 분석
export function analyzeDailyCarbon(
  trains: Train[],
  gridData: GridStatus[],
  optimizedSchedule?: Map<string, number>
): CarbonAnalysis {
  let baselineEmission = 0;
  let optimizedEmission = 0;

  trains.forEach((train) => {
    // 기존 스케줄 배출량
    const originalHour = Math.floor(train.scheduledDeparture / 60);
    baselineEmission +=
      (train.energyConsumption * gridData[originalHour].carbonIntensity) / 1000; // kgCO2

    // 최적화 스케줄 배출량
    const optimizedDeparture = optimizedSchedule?.get(train.id) ??
      train.optimizedDeparture ??
      train.scheduledDeparture;
    const optimizedHour = Math.floor(optimizedDeparture / 60);
    optimizedEmission +=
      (train.energyConsumption * gridData[optimizedHour].carbonIntensity) / 1000;
  });

  const reduction = baselineEmission - optimizedEmission;

  return {
    baselineEmission: Math.round(baselineEmission),
    optimizedEmission: Math.round(optimizedEmission),
    reduction: Math.round(reduction),
    reductionPercent:
      baselineEmission > 0
        ? Math.round((reduction / baselineEmission) * 100)
        : 0,
    treesEquivalent: Math.round(
      (reduction * CONSTANTS.OPERATING_DAYS_PER_YEAR) /
        CONSTANTS.CARBON_PER_TREE_KG
    ),
    carbonCreditValue: Math.round(
      ((reduction * CONSTANTS.OPERATING_DAYS_PER_YEAR) / 1000) *
        CONSTANTS.CARBON_CREDIT_PRICE
    ),
  };
}

// ROI 분석
export function analyzeROI(
  dailyCostAnalysis: CostAnalysis,
  implementationCost: number = CONSTANTS.SYSTEM_IMPLEMENTATION_COST
): ROIAnalysis {
  const annualSavings =
    dailyCostAnalysis.savings * CONSTANTS.OPERATING_DAYS_PER_YEAR;

  const paybackPeriod =
    annualSavings > 0 ? implementationCost / annualSavings : Infinity;

  // 5년 ROI
  const fiveYearReturn = annualSavings * 5 - implementationCost;
  const fiveYearROI =
    implementationCost > 0 ? (fiveYearReturn / implementationCost) * 100 : 0;

  // 10년 ROI
  const tenYearReturn = annualSavings * 10 - implementationCost;
  const tenYearROI =
    implementationCost > 0 ? (tenYearReturn / implementationCost) * 100 : 0;

  return {
    implementationCost,
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    fiveYearROI: Math.round(fiveYearROI),
    tenYearROI: Math.round(tenYearROI),
  };
}

// 시간대별 에너지 소비 프로파일
export function getHourlyEnergyProfile(
  trains: Train[],
  useOptimized: boolean = false
): number[] {
  const hourlyEnergy = new Array(24).fill(0);

  trains.forEach((train) => {
    const departure = useOptimized
      ? train.optimizedDeparture ?? train.scheduledDeparture
      : train.scheduledDeparture;
    const arrival = useOptimized
      ? train.optimizedArrival ?? train.scheduledArrival
      : train.scheduledArrival;

    const startHour = Math.floor(departure / 60);
    const endHour = Math.floor(arrival / 60);
    const duration = endHour - startHour + 1;

    // 에너지를 운행 시간에 균등 분배
    const energyPerHour = train.energyConsumption / duration;

    for (let h = startHour; h <= endHour && h < 24; h++) {
      if (h >= 0) {
        hourlyEnergy[h] += energyPerHour;
      }
    }
  });

  return hourlyEnergy.map((e) => Math.round(e));
}

// 종합 성과 지표
export interface PerformanceMetrics {
  dailyCost: CostAnalysis;
  dailyCarbon: CarbonAnalysis;
  roi: ROIAnalysis;
  operationalMetrics: {
    totalTrains: number;
    optimizedTrains: number;
    avgDelayMinutes: number;
    punctualityRate: number;
    greenWindowUtilization: number;
  };
}

export function calculatePerformanceMetrics(
  trains: Train[],
  gridData: GridStatus[],
  optimizedSchedule?: Map<string, number>
): PerformanceMetrics {
  const dailyCost = analyzeDailyCost(trains, gridData, optimizedSchedule);
  const dailyCarbon = analyzeDailyCarbon(trains, gridData, optimizedSchedule);
  const roi = analyzeROI(dailyCost);

  // 운영 지표 계산
  let totalDelay = 0;
  let punctualCount = 0;
  let optimizedCount = 0;

  trains.forEach((train) => {
    const optimizedDeparture = optimizedSchedule?.get(train.id) ??
      train.optimizedDeparture;

    if (optimizedDeparture !== undefined) {
      optimizedCount++;
      const delay = Math.abs(optimizedDeparture - train.scheduledDeparture);
      totalDelay += delay;

      if (delay <= 30) {
        punctualCount++;
      }
    }
  });

  return {
    dailyCost,
    dailyCarbon,
    roi,
    operationalMetrics: {
      totalTrains: trains.length,
      optimizedTrains: optimizedCount,
      avgDelayMinutes:
        optimizedCount > 0 ? Math.round(totalDelay / optimizedCount) : 0,
      punctualityRate:
        trains.length > 0
          ? Math.round((punctualCount / trains.length) * 100)
          : 0,
      greenWindowUtilization:
        trains.length > 0
          ? Math.round((dailyCost.greenWindowHits / trains.length) * 100)
          : 0,
    },
  };
}

// 월별/연도별 예측
export function projectAnnualMetrics(
  dailyMetrics: PerformanceMetrics
): {
  monthlySavings: number[];
  annualSavings: number;
  annualCarbonReduction: number;
  cumulativeSavings: number[];
} {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dailySavings = dailyMetrics.dailyCost.savings;
  const dailyCarbonReduction = dailyMetrics.dailyCarbon.reduction;

  const monthlySavings = daysPerMonth.map((days) =>
    Math.round(dailySavings * days)
  );

  const cumulativeSavings: number[] = [];
  let cumulative = 0;
  for (const monthly of monthlySavings) {
    cumulative += monthly;
    cumulativeSavings.push(cumulative);
  }

  return {
    monthlySavings,
    annualSavings: Math.round(dailySavings * 365),
    annualCarbonReduction: Math.round(dailyCarbonReduction * 365),
    cumulativeSavings,
  };
}
