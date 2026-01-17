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

// Mock 열차 데이터 생성 (24시간 전체 운행)
export function generateMockTrains(): Train[] {
  const trains: Train[] = [
    // === 새벽 시간대 (00:00 ~ 06:00) ===
    // 화물열차 (새벽 운행)
    { id: 'FR-2001', name: '화물 2001', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 30, scheduledArrival: 270, energyConsumption: 3800, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2500 },
    { id: 'FR-2003', name: '화물 2003', type: 'FREIGHT', route: '호남선', departureStation: '광양항', arrivalStation: '오봉', scheduledDeparture: 90, scheduledArrival: 300, energyConsumption: 3400, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 1980 },
    { id: 'FR-2005', name: '화물 2005', type: 'FREIGHT', route: '경부선', departureStation: '부산신항', arrivalStation: '의왕ICD', scheduledDeparture: 150, scheduledArrival: 390, energyConsumption: 3700, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2350 },
    // 회송열차 (새벽)
    { id: 'DH-3001', name: '회송 3001', type: 'DEADHEAD', route: '경부선', departureStation: '서울차량기지', arrivalStation: '부산', scheduledDeparture: 240, scheduledArrival: 390, energyConsumption: 1600, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3003', name: '회송 3003', type: 'DEADHEAD', route: '호남선', departureStation: '수서차량기지', arrivalStation: '광주송정', scheduledDeparture: 300, scheduledArrival: 450, energyConsumption: 1480, flexibility: 1.0, priority: 1, status: 'scheduled' },

    // === 아침 시간대 (06:00 ~ 12:00) ===
    // KTX 서울-부산 (경부선)
    { id: 'KTX-101', name: 'KTX 101', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 360, scheduledArrival: 510, energyConsumption: 4800, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 935 },
    { id: 'KTX-103', name: 'KTX 103', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 420, scheduledArrival: 570, energyConsumption: 4750, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 892 },
    { id: 'KTX-105', name: 'KTX 105', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 480, scheduledArrival: 630, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },
    { id: 'KTX-107', name: 'KTX 107', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 540, scheduledArrival: 690, energyConsumption: 4720, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 910 },
    { id: 'KTX-109', name: 'KTX 109', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 600, scheduledArrival: 750, energyConsumption: 4650, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 845 },
    { id: 'KTX-111', name: 'KTX 111', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 660, scheduledArrival: 810, energyConsumption: 4580, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 789 },
    // KTX 부산-서울 (경부선 상행)
    { id: 'KTX-102', name: 'KTX 102', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 390, scheduledArrival: 540, energyConsumption: 4700, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 878 },
    { id: 'KTX-104', name: 'KTX 104', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 450, scheduledArrival: 600, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 901 },
    { id: 'KTX-106', name: 'KTX 106', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 510, scheduledArrival: 660, energyConsumption: 4590, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 834 },
    // SRT 수서-부산
    { id: 'SRT-301', name: 'SRT 301', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 375, scheduledArrival: 510, energyConsumption: 4300, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },
    { id: 'SRT-303', name: 'SRT 303', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 495, scheduledArrival: 630, energyConsumption: 4250, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    // KTX 호남선
    { id: 'KTX-501', name: 'KTX 501', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 405, scheduledArrival: 570, energyConsumption: 4100, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 678 },
    { id: 'KTX-503', name: 'KTX 503', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 525, scheduledArrival: 690, energyConsumption: 4050, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 712 },
    // ITX-새마을
    { id: 'ITX-1001', name: 'ITX-새마을 1001', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 435, scheduledArrival: 660, energyConsumption: 2900, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 456 },
    // 무궁화호
    { id: 'MG-1401', name: '무궁화 1401', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 390, scheduledArrival: 570, energyConsumption: 2300, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 312 },
    { id: 'MG-1403', name: '무궁화 1403', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 510, scheduledArrival: 690, energyConsumption: 2250, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 289 },
    { id: 'MG-1701', name: '무궁화 1701', type: 'MUGUNGHWA', route: '전라선', departureStation: '용산', arrivalStation: '여수엑스포', scheduledDeparture: 420, scheduledArrival: 630, energyConsumption: 2400, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 334 },

    // === 오후 시간대 (12:00 ~ 18:00) ===
    // KTX 경부선 오후
    { id: 'KTX-113', name: 'KTX 113', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 720, scheduledArrival: 870, energyConsumption: 4620, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    { id: 'KTX-115', name: 'KTX 115', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 780, scheduledArrival: 930, energyConsumption: 4550, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },
    { id: 'KTX-117', name: 'KTX 117', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 840, scheduledArrival: 990, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },
    { id: 'KTX-119', name: 'KTX 119', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 900, scheduledArrival: 1050, energyConsumption: 4720, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 912 },
    { id: 'KTX-121', name: 'KTX 121', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 960, scheduledArrival: 1110, energyConsumption: 4590, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 834 },
    { id: 'KTX-123', name: 'KTX 123', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1020, scheduledArrival: 1170, energyConsumption: 4650, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 878 },
    // KTX 상행 오후
    { id: 'KTX-108', name: 'KTX 108', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 750, scheduledArrival: 900, energyConsumption: 4620, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },
    { id: 'KTX-110', name: 'KTX 110', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 870, scheduledArrival: 1020, energyConsumption: 4700, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 901 },
    { id: 'KTX-112', name: 'KTX 112', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 990, scheduledArrival: 1140, energyConsumption: 4580, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    // SRT 오후
    { id: 'SRT-305', name: 'SRT 305', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 735, scheduledArrival: 870, energyConsumption: 4180, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 789 },
    { id: 'SRT-307', name: 'SRT 307', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 855, scheduledArrival: 990, energyConsumption: 4220, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 812 },
    { id: 'SRT-309', name: 'SRT 309', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 975, scheduledArrival: 1110, energyConsumption: 4150, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },
    // KTX 호남선 오후
    { id: 'KTX-505', name: 'KTX 505', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 765, scheduledArrival: 930, energyConsumption: 4020, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 689 },
    { id: 'KTX-507', name: 'KTX 507', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 885, scheduledArrival: 1050, energyConsumption: 4080, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 723 },
    // ITX-새마을 오후
    { id: 'ITX-1003', name: 'ITX-새마을 1003', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 795, scheduledArrival: 1020, energyConsumption: 2850, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 423 },
    { id: 'ITX-1005', name: 'ITX-새마을 1005', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 915, scheduledArrival: 1140, energyConsumption: 2880, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 467 },
    // 무궁화호 오후
    { id: 'MG-1405', name: '무궁화 1405', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 750, scheduledArrival: 930, energyConsumption: 2200, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 267 },
    { id: 'MG-1703', name: '무궁화 1703', type: 'MUGUNGHWA', route: '전라선', departureStation: '용산', arrivalStation: '여수엑스포', scheduledDeparture: 810, scheduledArrival: 1020, energyConsumption: 2350, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 301 },
    // 화물열차 오후
    { id: 'FR-2007', name: '화물 2007', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 780, scheduledArrival: 1020, energyConsumption: 3550, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2280 },
    { id: 'FR-2009', name: '화물 2009', type: 'FREIGHT', route: '호남선', departureStation: '오봉', arrivalStation: '광양항', scheduledDeparture: 840, scheduledArrival: 1050, energyConsumption: 3450, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2100 },

    // === 저녁 시간대 (18:00 ~ 24:00) ===
    // KTX 경부선 저녁
    { id: 'KTX-125', name: 'KTX 125', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1080, scheduledArrival: 1230, energyConsumption: 4750, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 923 },
    { id: 'KTX-127', name: 'KTX 127', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1140, scheduledArrival: 1290, energyConsumption: 4680, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 889 },
    { id: 'KTX-129', name: 'KTX 129', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1200, scheduledArrival: 1350, energyConsumption: 4620, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 845 },
    { id: 'KTX-131', name: 'KTX 131', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1260, scheduledArrival: 1410, energyConsumption: 4550, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 778 },
    { id: 'KTX-133', name: 'KTX 133', type: 'KTX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1320, scheduledArrival: 1470, energyConsumption: 4480, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 712 },
    // KTX 상행 저녁
    { id: 'KTX-114', name: 'KTX 114', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 1110, scheduledArrival: 1260, energyConsumption: 4720, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 901 },
    { id: 'KTX-116', name: 'KTX 116', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 1170, scheduledArrival: 1320, energyConsumption: 4650, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 867 },
    { id: 'KTX-118', name: 'KTX 118', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 1230, scheduledArrival: 1380, energyConsumption: 4580, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 823 },
    { id: 'KTX-120', name: 'KTX 120', type: 'KTX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 1290, scheduledArrival: 1439, energyConsumption: 4520, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 756 },
    // SRT 저녁
    { id: 'SRT-311', name: 'SRT 311', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 1095, scheduledArrival: 1230, energyConsumption: 4280, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 834 },
    { id: 'SRT-313', name: 'SRT 313', type: 'SRT', route: '수서고속선', departureStation: '수서', arrivalStation: '부산', scheduledDeparture: 1215, scheduledArrival: 1350, energyConsumption: 4200, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 789 },
    { id: 'SRT-302', name: 'SRT 302', type: 'SRT', route: '수서고속선', departureStation: '부산', arrivalStation: '수서', scheduledDeparture: 1140, scheduledArrival: 1275, energyConsumption: 4250, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 812 },
    { id: 'SRT-304', name: 'SRT 304', type: 'SRT', route: '수서고속선', departureStation: '부산', arrivalStation: '수서', scheduledDeparture: 1260, scheduledArrival: 1395, energyConsumption: 4180, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 767 },
    // KTX 호남선 저녁
    { id: 'KTX-509', name: 'KTX 509', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 1125, scheduledArrival: 1290, energyConsumption: 4050, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 701 },
    { id: 'KTX-511', name: 'KTX 511', type: 'KTX', route: '호남선', departureStation: '용산', arrivalStation: '목포', scheduledDeparture: 1245, scheduledArrival: 1410, energyConsumption: 3980, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 656 },
    { id: 'KTX-502', name: 'KTX 502', type: 'KTX', route: '호남선', departureStation: '목포', arrivalStation: '용산', scheduledDeparture: 1170, scheduledArrival: 1335, energyConsumption: 4020, flexibility: 0.1, priority: 5, status: 'scheduled', passengerCount: 678 },
    // ITX-새마을 저녁
    { id: 'ITX-1007', name: 'ITX-새마을 1007', type: 'ITX', route: '경부선', departureStation: '서울', arrivalStation: '부산', scheduledDeparture: 1110, scheduledArrival: 1335, energyConsumption: 2920, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 489 },
    { id: 'ITX-1002', name: 'ITX-새마을 1002', type: 'ITX', route: '경부선', departureStation: '부산', arrivalStation: '서울', scheduledDeparture: 1170, scheduledArrival: 1395, energyConsumption: 2870, flexibility: 0.2, priority: 4, status: 'scheduled', passengerCount: 445 },
    // 무궁화호 저녁
    { id: 'MG-1407', name: '무궁화 1407', type: 'MUGUNGHWA', route: '중앙선', departureStation: '청량리', arrivalStation: '안동', scheduledDeparture: 1110, scheduledArrival: 1290, energyConsumption: 2280, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 234 },
    { id: 'MG-1402', name: '무궁화 1402', type: 'MUGUNGHWA', route: '중앙선', departureStation: '안동', arrivalStation: '청량리', scheduledDeparture: 1170, scheduledArrival: 1350, energyConsumption: 2250, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 256 },
    { id: 'MG-1705', name: '무궁화 1705', type: 'MUGUNGHWA', route: '전라선', departureStation: '용산', arrivalStation: '여수엑스포', scheduledDeparture: 1140, scheduledArrival: 1350, energyConsumption: 2380, flexibility: 0.3, priority: 3, status: 'scheduled', passengerCount: 278 },
    // 화물열차 저녁/심야
    { id: 'FR-2011', name: '화물 2011', type: 'FREIGHT', route: '경부선', departureStation: '부산신항', arrivalStation: '의왕ICD', scheduledDeparture: 1080, scheduledArrival: 1320, energyConsumption: 3600, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2400 },
    { id: 'FR-2013', name: '화물 2013', type: 'FREIGHT', route: '중앙선', departureStation: '제천', arrivalStation: '동해', scheduledDeparture: 1140, scheduledArrival: 1290, energyConsumption: 3200, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 1850 },
    { id: 'FR-2015', name: '화물 2015', type: 'FREIGHT', route: '경부선', departureStation: '의왕ICD', arrivalStation: '부산신항', scheduledDeparture: 1260, scheduledArrival: 1500, energyConsumption: 3650, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2320 },
    { id: 'FR-2017', name: '화물 2017', type: 'FREIGHT', route: '호남선', departureStation: '광양항', arrivalStation: '오봉', scheduledDeparture: 1320, scheduledArrival: 1530, energyConsumption: 3480, flexibility: 0.8, priority: 2, status: 'scheduled', cargoWeight: 2150 },
    // 회송열차 저녁/심야
    { id: 'DH-3005', name: '회송 3005', type: 'DEADHEAD', route: '경부선', departureStation: '부산', arrivalStation: '서울차량기지', scheduledDeparture: 1350, scheduledArrival: 1500, energyConsumption: 1550, flexibility: 1.0, priority: 1, status: 'scheduled' },
    { id: 'DH-3007', name: '회송 3007', type: 'DEADHEAD', route: '호남선', departureStation: '광주송정', arrivalStation: '수서차량기지', scheduledDeparture: 1380, scheduledArrival: 1530, energyConsumption: 1450, flexibility: 1.0, priority: 1, status: 'scheduled' },
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
