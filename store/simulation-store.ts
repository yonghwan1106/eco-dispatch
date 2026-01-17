'use client';

import { create } from 'zustand';
import { Train, generateMockTrains } from '@/lib/data/mock-trains';
import { GridStatus, generateGridData } from '@/lib/data/mock-grid';
import { RLWeights, defaultWeights, EpisodeResult, runEpisode } from '@/lib/simulation/rl-agent';
import { optimizeAllTrains, OptimizationResult } from '@/lib/simulation/train-engine';
import { PerformanceMetrics, calculatePerformanceMetrics } from '@/lib/simulation/energy-calculator';

interface SimulationState {
  // 기본 데이터
  trains: Train[];
  gridData: GridStatus[];

  // 시뮬레이션 상태
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // 분 단위 (0-1439)
  simulationSpeed: number; // 1, 2, 4, 8

  // 강화학습 파라미터
  weights: RLWeights;
  epsilon: number;

  // 결과
  optimizationResults: OptimizationResult[];
  episodeResults: EpisodeResult[];
  currentEpisode: number;
  performanceMetrics: PerformanceMetrics | null;

  // 선택 상태
  selectedTrain: Train | null;
  highlightedHour: number | null;

  // 액션
  initializeData: () => void;
  setWeights: (weights: Partial<RLWeights>) => void;
  setSimulationSpeed: (speed: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  jumpToTime: (time: number) => void;
  runOptimization: () => void;
  runRLEpisode: () => void;
  selectTrain: (train: Train | null) => void;
  setHighlightedHour: (hour: number | null) => void;
  updateTrainSchedule: (trainId: string, newDeparture: number) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // 초기 상태
  trains: [],
  gridData: [],
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  simulationSpeed: 1,
  weights: defaultWeights,
  epsilon: 0.1,
  optimizationResults: [],
  episodeResults: [],
  currentEpisode: 0,
  performanceMetrics: null,
  selectedTrain: null,
  highlightedHour: null,

  // 데이터 초기화
  initializeData: () => {
    const trains = generateMockTrains();
    const gridData = generateGridData();

    set({
      trains,
      gridData,
      currentTime: new Date().getHours() * 60 + new Date().getMinutes(),
    });
  },

  // 가중치 설정
  setWeights: (newWeights) => {
    set((state) => ({
      weights: { ...state.weights, ...newWeights },
    }));
  },

  // 시뮬레이션 속도 설정
  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },

  // 시뮬레이션 시작
  startSimulation: () => {
    set({ isRunning: true, isPaused: false });
  },

  // 시뮬레이션 일시정지
  pauseSimulation: () => {
    set({ isPaused: true });
  },

  // 시뮬레이션 리셋
  resetSimulation: () => {
    const trains = generateMockTrains();
    const gridData = generateGridData();

    set({
      trains,
      gridData,
      isRunning: false,
      isPaused: false,
      currentTime: 0,
      optimizationResults: [],
      episodeResults: [],
      currentEpisode: 0,
      performanceMetrics: null,
    });
  },

  // 시뮬레이션 1스텝 진행
  stepSimulation: () => {
    set((state) => ({
      currentTime: (state.currentTime + state.simulationSpeed) % 1440,
    }));
  },

  // 특정 시간으로 이동
  jumpToTime: (time) => {
    set({ currentTime: time % 1440 });
  },

  // 스케줄 최적화 실행
  runOptimization: () => {
    const { trains, gridData } = get();
    const results = optimizeAllTrains(trains, gridData);

    // 최적화된 스케줄 적용
    const optimizedTrains = trains.map((train) => {
      const result = results.results.find((r) => r.train.id === train.id);
      if (result) {
        return result.train;
      }
      return train;
    });

    // 성과 지표 계산
    const metrics = calculatePerformanceMetrics(optimizedTrains, gridData);

    set({
      trains: optimizedTrains,
      optimizationResults: results.results,
      performanceMetrics: metrics,
    });
  },

  // 강화학습 에피소드 실행
  runRLEpisode: () => {
    const { trains, gridData, weights, currentEpisode, episodeResults } = get();

    const result = runEpisode(trains, gridData, weights, currentEpisode);

    // 최적화된 스케줄 적용
    const optimizedTrains = trains.map((train) => {
      const action = result.actions.find((a) => a.trainId === train.id);
      if (action) {
        const newDeparture = train.scheduledDeparture + action.departureShift;
        const duration = train.scheduledArrival - train.scheduledDeparture;
        return {
          ...train,
          optimizedDeparture: newDeparture,
          optimizedArrival: newDeparture + duration,
        };
      }
      return train;
    });

    // 성과 지표 계산
    const metrics = calculatePerformanceMetrics(optimizedTrains, gridData);

    set({
      trains: optimizedTrains,
      episodeResults: [...episodeResults, result],
      currentEpisode: currentEpisode + 1,
      performanceMetrics: metrics,
    });
  },

  // 열차 선택
  selectTrain: (train) => {
    set({ selectedTrain: train });
  },

  // 시간대 하이라이트
  setHighlightedHour: (hour) => {
    set({ highlightedHour: hour });
  },

  // 열차 스케줄 수동 업데이트
  updateTrainSchedule: (trainId, newDeparture) => {
    set((state) => {
      const trains = state.trains.map((train) => {
        if (train.id === trainId) {
          const duration = train.scheduledArrival - train.scheduledDeparture;
          return {
            ...train,
            optimizedDeparture: newDeparture,
            optimizedArrival: newDeparture + duration,
          };
        }
        return train;
      });

      const metrics = calculatePerformanceMetrics(trains, state.gridData);

      return {
        trains,
        performanceMetrics: metrics,
      };
    });
  },
}));

// 실시간 업데이트 훅
export function useRealTimeUpdate() {
  const { isRunning, isPaused, stepSimulation, simulationSpeed } = useSimulationStore();

  if (typeof window !== 'undefined') {
    const interval = 1000 / simulationSpeed;

    if (isRunning && !isPaused) {
      const timer = setInterval(stepSimulation, interval);
      return () => clearInterval(timer);
    }
  }

  return () => {};
}
