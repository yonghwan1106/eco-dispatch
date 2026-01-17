// 강화학습 에이전트 (JavaScript 기반 시뮬레이션)

import { Train } from '@/lib/data/mock-trains';
import { GridStatus } from '@/lib/data/mock-grid';

// 강화학습 가중치 파라미터
export interface RLWeights {
  w1: number; // 정시성 가중치
  w2: number; // 비용 절감 가중치
  w3: number; // 그리드 동기화 가중치
  w4: number; // 안전성 페널티 가중치
}

// 상태 정의
export interface RLState {
  currentHour: number;
  gridSurplus: number;
  smp: number;
  isGreenWindow: boolean;
  isPlusDR: boolean;
  pendingTrains: number;
  flexibleTrains: number;
  totalEnergyDemand: number;
}

// 행동 정의
export interface RLAction {
  trainId: string;
  departureShift: number; // 분 단위 이동 (-180 ~ +180)
}

// 보상 함수 결과
export interface RewardComponents {
  punctualityReward: number;
  costReward: number;
  gridSyncReward: number;
  safetyPenalty: number;
  totalReward: number;
}

// 에피소드 결과
export interface EpisodeResult {
  episodeNumber: number;
  totalReward: number;
  rewardHistory: number[];
  punctualityRate: number;
  costSavings: number;
  greenWindowUtilization: number;
  safetyViolations: number;
  actions: RLAction[];
}

// 기본 가중치
export const defaultWeights: RLWeights = {
  w1: 0.3, // 정시성
  w2: 0.4, // 비용 절감
  w3: 0.25, // 그리드 동기화
  w4: 0.05, // 안전성
};

// 보상 함수 계산
export function calculateReward(
  state: RLState,
  action: RLAction,
  train: Train,
  gridStatus: GridStatus,
  weights: RLWeights
): RewardComponents {
  // 1. 정시성 보상 (지연에 대한 페널티)
  const delayMinutes = Math.abs(action.departureShift);
  const maxAllowedDelay = train.flexibility * 180; // 유연성에 따른 허용 지연
  const punctualityReward =
    delayMinutes <= maxAllowedDelay
      ? 100 * (1 - delayMinutes / maxAllowedDelay)
      : -50 * (delayMinutes - maxAllowedDelay) / 60;

  // 2. 비용 절감 보상
  // 기준 SMP 대비 현재 SMP가 낮을수록 높은 보상
  const baselineSMP = 100; // 기준 SMP
  const smpDiff = baselineSMP - gridStatus.smp;
  const costReward = smpDiff * train.energyConsumption / 10000;

  // 3. 그리드 동기화 보상
  let gridSyncReward = 0;
  if (gridStatus.isGreenWindow) {
    gridSyncReward += 50; // Green Window 활용 보너스
  }
  if (gridStatus.isPlusDR) {
    gridSyncReward += 30; // 플러스 DR 활용 보너스
  }
  if (gridStatus.surplus > 20) {
    gridSyncReward += gridStatus.surplus * 0.5; // 잉여 전력 비례 보상
  }

  // 4. 안전성 페널티
  let safetyPenalty = 0;

  // 고우선순위 열차의 과도한 지연
  if (train.priority >= 4 && delayMinutes > 30) {
    safetyPenalty += 100 * (delayMinutes - 30) / 60;
  }

  // 운행 금지 시간대 위반 (예: 심야 시간대 여객 열차)
  const newDepartureHour = Math.floor(
    (train.scheduledDeparture + action.departureShift) / 60
  );
  if (
    (train.type === 'KTX' || train.type === 'SRT') &&
    (newDepartureHour < 5 || newDepartureHour > 23)
  ) {
    safetyPenalty += 500; // 운행 금지 시간대 위반
  }

  // 총 보상 계산
  const totalReward =
    weights.w1 * punctualityReward +
    weights.w2 * costReward +
    weights.w3 * gridSyncReward -
    weights.w4 * safetyPenalty;

  return {
    punctualityReward,
    costReward,
    gridSyncReward,
    safetyPenalty,
    totalReward,
  };
}

// Q-러닝 기반 행동 선택 (단순화된 버전)
export function selectAction(
  train: Train,
  gridData: GridStatus[],
  weights: RLWeights,
  epsilon: number = 0.1 // 탐험 확률
): RLAction {
  const currentHour = Math.floor(train.scheduledDeparture / 60);
  const maxShift = Math.floor(train.flexibility * 180);

  // 탐험: 랜덤 행동
  if (Math.random() < epsilon) {
    const randomShift = Math.floor(Math.random() * (maxShift * 2 + 1)) - maxShift;
    return {
      trainId: train.id,
      departureShift: randomShift,
    };
  }

  // 착취: 최적 행동 선택
  let bestAction: RLAction = { trainId: train.id, departureShift: 0 };
  let bestReward = -Infinity;

  // 30분 단위로 탐색
  for (let shift = -maxShift; shift <= maxShift; shift += 30) {
    const newHour = Math.floor((train.scheduledDeparture + shift) / 60);
    if (newHour < 0 || newHour >= 24) continue;

    const state: RLState = {
      currentHour: newHour,
      gridSurplus: gridData[newHour].surplus,
      smp: gridData[newHour].smp,
      isGreenWindow: gridData[newHour].isGreenWindow,
      isPlusDR: gridData[newHour].isPlusDR,
      pendingTrains: 0,
      flexibleTrains: 0,
      totalEnergyDemand: train.energyConsumption,
    };

    const action: RLAction = { trainId: train.id, departureShift: shift };
    const reward = calculateReward(state, action, train, gridData[newHour], weights);

    if (reward.totalReward > bestReward) {
      bestReward = reward.totalReward;
      bestAction = action;
    }
  }

  return bestAction;
}

// 에피소드 시뮬레이션
export function runEpisode(
  trains: Train[],
  gridData: GridStatus[],
  weights: RLWeights,
  episodeNumber: number
): EpisodeResult {
  const actions: RLAction[] = [];
  const rewardHistory: number[] = [];
  let totalReward = 0;
  let punctualityCount = 0;
  let greenWindowCount = 0;
  let safetyViolations = 0;
  let totalOriginalCost = 0;
  let totalOptimizedCost = 0;

  // 학습률 감소
  const epsilon = Math.max(0.01, 0.3 * Math.exp(-episodeNumber / 50));

  for (const train of trains) {
    // 행동 선택
    const action = selectAction(train, gridData, weights, epsilon);
    actions.push(action);

    // 새 출발 시간
    const newDeparture = train.scheduledDeparture + action.departureShift;
    const newHour = Math.floor(newDeparture / 60);

    if (newHour < 0 || newHour >= 24) {
      safetyViolations++;
      continue;
    }

    // 보상 계산
    const state: RLState = {
      currentHour: newHour,
      gridSurplus: gridData[newHour].surplus,
      smp: gridData[newHour].smp,
      isGreenWindow: gridData[newHour].isGreenWindow,
      isPlusDR: gridData[newHour].isPlusDR,
      pendingTrains: trains.length,
      flexibleTrains: trains.filter((t) => t.flexibility > 0.5).length,
      totalEnergyDemand: trains.reduce((sum, t) => sum + t.energyConsumption, 0),
    };

    const reward = calculateReward(
      state,
      action,
      train,
      gridData[newHour],
      weights
    );

    totalReward += reward.totalReward;
    rewardHistory.push(reward.totalReward);

    // 통계 수집
    if (Math.abs(action.departureShift) <= 30) {
      punctualityCount++;
    }

    if (gridData[newHour].isGreenWindow) {
      greenWindowCount++;
    }

    if (reward.safetyPenalty > 0) {
      safetyViolations++;
    }

    // 비용 계산
    const originalHour = Math.floor(train.scheduledDeparture / 60);
    totalOriginalCost += train.energyConsumption * gridData[originalHour].smp;
    totalOptimizedCost += train.energyConsumption * gridData[newHour].smp;
  }

  return {
    episodeNumber,
    totalReward,
    rewardHistory,
    punctualityRate:
      trains.length > 0
        ? Math.round((punctualityCount / trains.length) * 100)
        : 0,
    costSavings: Math.round(totalOriginalCost - totalOptimizedCost),
    greenWindowUtilization:
      trains.length > 0
        ? Math.round((greenWindowCount / trains.length) * 100)
        : 0,
    safetyViolations,
    actions,
  };
}

// 학습 시뮬레이션
export function runTraining(
  trains: Train[],
  gridData: GridStatus[],
  weights: RLWeights,
  numEpisodes: number = 100,
  onEpisodeComplete?: (result: EpisodeResult) => void
): {
  bestResult: EpisodeResult;
  allResults: EpisodeResult[];
  convergenceEpisode: number;
} {
  const allResults: EpisodeResult[] = [];
  let bestResult: EpisodeResult | null = null;
  let convergenceEpisode = numEpisodes;

  // 수렴 감지용
  const recentRewards: number[] = [];
  const windowSize = 10;

  for (let ep = 0; ep < numEpisodes; ep++) {
    const result = runEpisode(trains, gridData, weights, ep);
    allResults.push(result);

    if (!bestResult || result.totalReward > bestResult.totalReward) {
      bestResult = result;
    }

    onEpisodeComplete?.(result);

    // 수렴 감지
    recentRewards.push(result.totalReward);
    if (recentRewards.length > windowSize) {
      recentRewards.shift();

      const avg = recentRewards.reduce((a, b) => a + b, 0) / windowSize;
      const variance =
        recentRewards.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) /
        windowSize;

      if (variance < 100 && ep > 20) {
        convergenceEpisode = Math.min(convergenceEpisode, ep);
      }
    }
  }

  return {
    bestResult: bestResult!,
    allResults,
    convergenceEpisode,
  };
}
