// 열차 타입 정의
export type TrainType = 'KTX' | 'SRT' | 'ITX' | 'MUGUNGHWA' | 'FREIGHT' | 'DEADHEAD';

export interface Train {
  id: string;
  name: string;
  type: TrainType;
  route: string;
  departureStation: string;
  arrivalStation: string;
  scheduledDeparture: number; // 분 단위 (0-1439)
  scheduledArrival: number;
  optimizedDeparture?: number; // AI 최적화 출발 시간
  optimizedArrival?: number;
  energyConsumption: number; // kWh
  flexibility: number; // 유연성 (0-1, 화물/회송이 높음)
  priority: number; // 우선순위 (1-5, 높을수록 중요)
  status: 'scheduled' | 'running' | 'completed' | 'delayed';
  passengerCount?: number;
  cargoWeight?: number; // 톤
}

// 시간 변환 헬퍼
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

// 열차 타입별 설정
export const trainTypeConfig: Record<TrainType, {
  name: string;
  color: string;
  avgEnergy: number;
  flexibility: number;
  priority: number;
}> = {
  KTX: {
    name: 'KTX',
    color: '#ef4444', // red
    avgEnergy: 4500,
    flexibility: 0.1,
    priority: 5,
  },
  SRT: {
    name: 'SRT',
    color: '#8b5cf6', // purple
    avgEnergy: 4200,
    flexibility: 0.1,
    priority: 5,
  },
  ITX: {
    name: 'ITX-새마을',
    color: '#f97316', // orange
    avgEnergy: 2800,
    flexibility: 0.2,
    priority: 4,
  },
  MUGUNGHWA: {
    name: '무궁화호',
    color: '#06b6d4', // cyan
    avgEnergy: 2200,
    flexibility: 0.3,
    priority: 3,
  },
  FREIGHT: {
    name: '화물열차',
    color: '#84cc16', // lime
    avgEnergy: 3500,
    flexibility: 0.8,
    priority: 2,
  },
  DEADHEAD: {
    name: '회송열차',
    color: '#6b7280', // gray
    avgEnergy: 1500,
    flexibility: 1.0,
    priority: 1,
  },
};

// Mock 열차 데이터 생성
export function generateMockTrains(): Train[] {
  const trains: Train[] = [
    // KTX 서울-부산 (경부선)
    { id: 'KTX-101', name: 'KTX 101', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 360, scheduledArrival: 510, energyConsumption: 4800, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 935 },
    { id: 'KTX-103', name: 'KTX 103', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 420, scheduledArrival: 570, energyConsumption: 4750, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 892 },
    { id: 'KTX-105', name: 'KTX 105', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 480, scheduledArrival: 630, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },
    { id: 'KTX-107', name: 'KTX 107', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 540, scheduledArrival: 690, energyConsumption: 4720, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 910 },
    { id: 'KTX-109', name: 'KTX 109', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 600, scheduledArrival: 750, energyConsumption: 4650, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 845 },
    { id: 'KTX-111', name: 'KTX 111', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 660, scheduledArrival: 810, energyConsumption: 4580, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 789 },
    { id: 'KTX-113', name: 'KTX 113', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 720, scheduledArrival: 870, energyConsumption: 4620, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    { id: 'KTX-115', name: 'KTX 115', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 780, scheduledArrival: 930, energyConsumption: 4550, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },

    // KTX 부산-서울 (경부선 상행)
    { id: 'KTX-102', name: 'KTX 102', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 390, scheduledArrival: 540, energyConsumption: 4700, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 878 },
    { id: 'KTX-104', name: 'KTX 104', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 450, scheduledArrival: 600, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 901 },
    { id: 'KTX-106', name: 'KTX 106', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 510, scheduledArrival: 660, energyConsumption: 4590, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 834 },
    { id: 'KTX-108', name: 'KTX 108', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 570, scheduledArrival: 720, energyConsumption: 4620, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },

    // SRT 수서-부산
    { id: 'SRT-301', name: 'SRT 301', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 375, scheduledArrival: 510, energyConsumption: 4300, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },
    { id: 'SRT-303', name: 'SRT 303', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 495, scheduledArrival: 630, energyConsumption: 4250, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    { id: 'SRT-305', name: 'SRT 305', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 615, scheduledArrival: 750, energyConsumption: 4180, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 789 },

    // KTX 호남선
    { id: 'KTX-501', name: 'KTX 501', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 405, scheduledArrival: 570, energyConsumption: 4100, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 678 },
    { id: 'KTX-503', name: 'KTX 503', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 525, scheduledArrival: 690, energyConsumption: 4050, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 712 },
    { id: 'KTX-505', name: 'KTX 505', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 645, scheduledArrival: 810, energyConsumption: 4020, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 689 },

    // ITX-새마을
    { id: 'ITX-1001', name: 'ITX-새마을 1001', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 435, scheduledArrival: 660, energyConsumption: 2900, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 456 },
    { id: 'ITX-1003', name: 'ITX-새마을 1003', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 555, scheduledArrival: 780, energyConsumption: 2850, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 423 },

    // 무궁화호
    { id: 'MG-1401', name: '무궁화 1401', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 390, scheduledArrival: 570, energyConsumption: 2300, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 312 },
    { id: 'MG-1403', name: '무궁화 1403', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 510, scheduledArrival: 690, energyConsumption: 2250, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 289 },
    { id: 'MG-1405', name: '무궁화 1405', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 630, scheduledArrival: 810, energyConsumption: 2200, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 267 },
    { id: 'MG-1701', name: '무궁화 1701', type: 'MUGUNGHWA', route: '전라선', departureStation: '용산', arrivalStation: '여수엑스포', scheduledDeparture: 420, scheduledArrival: 630, energyConsumption: 2400, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 334 },
    { id: 'MG-1703', name: '무궁화 1703', type: 'MUGUNGHWA', route: '전라선', departureStation: '용산', arrivalStation: '여수엑스포', scheduledDeparture: 540, scheduledArrival: 750, energyConsumption: 2350, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 301 },

    // 화물열차 (높은 유연성)
    { id: 'FR-2001', name: '화물 2001', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 180, scheduledArrival: 420, energyConsumption: 3800, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2500 },
    { id: 'FR-2003', name: '화물 2003', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 300, scheduledArrival: 540, energyConsumption: 3650, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2200 },
    { id: 'FR-2005', name: '화물 2005', type: 'FREIGHT', route: '경부선', departureStation: '부산신항', arrivalStation: '의왕ICD', scheduledDeparture: 480, scheduledArrival: 720, energyConsumption: 3700, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2350 },
    { id: 'FR-2007', name: '화물 2007', type: 'FREIGHT', route: '호남선', departureStation: '광양항', arrivalStation: '오봉', scheduledDeparture: 240, scheduledArrival: 450, energyConsumption: 3400, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 1980 },
    { id: 'FR-2009', name: '화물 2009', type: 'FREIGHT', route: '호남선', departureStation: '오봉', arrivalStation: '광양항', scheduledDeparture: 540, scheduledArrival: 750, energyConsumption: 3450, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2100 },
    { id: 'FR-2011', name: '화물 2011', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 660, scheduledArrival: 900, energyConsumption: 3550, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2280 },
    { id: 'FR-2013', name: '화물 2013', type: 'FREIGHT', route: '중앙선', departureStation: '제천', arrivalStation: '동해', scheduledDeparture: 360, scheduledArrival: 510, energyConsumption: 3200, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 1850 },
    { id: 'FR-2015', name: '화물 2015', type: 'FREIGHT', route: '경부선', departureStation: '부산신항', arrivalStation: '의왕ICD', scheduledDeparture: 780, scheduledArrival: 1020, energyConsumption: 3600, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2400 },

    // 회송열차 (최대 유연성)
    { id: 'DH-3001', name: '회송 3001', type: 'DEADHEAD', route: '경부선', departureStation: '서울차량기지', arrivalStation: '부산', scheduledDeparture: 300, scheduledArrival: 450, energyConsumption: 1600, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3003', name: '회송 3003', type: 'DEADHEAD', route: '경부선', departureStation: '부산', arrivalStation: '서울차량기지', scheduledDeparture: 900, scheduledArrival: 1050, energyConsumption: 1550, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3005', name: '회송 3005', type: 'DEADHEAD', route: '호남선', departureStation: '수서차량기지', arrivalStation: '광주송정', scheduledDeparture: 330, scheduledArrival: 480, energyConsumption: 1480, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3007', name: '회송 3007', type: 'DEADHEAD', route: '호남선', departureStation: '광주송정', arrivalStation: '수서차량기지', scheduledDeparture: 840, scheduledArrival: 990, energyConsumption: 1450, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3009', name: '회송 3009', type: 'DEADHEAD', route: '경부선', departureStation: '서울차량기지', arrivalStation: '대전', scheduledDeparture: 210, scheduledArrival: 300, energyConsumption: 980, flexibility: 1.0, priority: 1, status: 'scheduled' },
  ];

  return trains;
}

// 열차 타입별 통계
export function getTrainStatsByType(trains: Train[]) {
  const stats: Record<TrainType, { count: number; totalEnergy: number }> = {
    KTX: { count: 0, totalEnergy: 0 },
    SRT: { count: 0, totalEnergy: 0 },
    ITX: { count: 0, totalEnergy: 0 },
    MUGUNGHWA: { count: 0, totalEnergy: 0 },
    FREIGHT: { count: 0, totalEnergy: 0 },
    DEADHEAD: { count: 0, totalEnergy: 0 },
  };

  trains.forEach((train) => {
    stats[train.type].count++;
    stats[train.type].totalEnergy += train.energyConsumption;
  });

  return stats;
}

// 시간대별 열차 운행 현황
export function getTrainsByHour(trains: Train[], hour: number) {
  const startMinute = hour * 60;
  const endMinute = (hour + 1) * 60;

  return trains.filter((train) => {
    const departure = train.optimizedDeparture ?? train.scheduledDeparture;
    const arrival = train.optimizedArrival ?? train.scheduledArrival;
    return (
      (departure >= startMinute && departure < endMinute) ||
      (arrival >= startMinute && arrival < endMinute) ||
      (departure < startMinute && arrival > endMinute)
    );
  });
}
