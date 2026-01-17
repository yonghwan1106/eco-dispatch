// 한국 철도 노선 및 역 데이터

export interface Station {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  routes: string[];
  isTerminal: boolean;
  isMajor: boolean;
}

export interface Route {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  totalDistance: number; // km
  stations: string[];
  avgTravelTime: number; // 분 (KTX 기준)
}

// 주요 역 데이터
export const stations: Record<string, Station> = {
  seoul: {
    id: 'seoul',
    name: '서울',
    nameEn: 'Seoul',
    lat: 37.5547,
    lng: 126.9707,
    routes: ['경부선', '경의선', '경원선'],
    isTerminal: true,
    isMajor: true,
  },
  yongsan: {
    id: 'yongsan',
    name: '용산',
    nameEn: 'Yongsan',
    lat: 37.5299,
    lng: 126.9646,
    routes: ['경부선', '호남선', '전라선'],
    isTerminal: false,
    isMajor: true,
  },
  suseo: {
    id: 'suseo',
    name: '수서',
    nameEn: 'Suseo',
    lat: 37.4546,
    lng: 127.1074,
    routes: ['수서고속선'],
    isTerminal: true,
    isMajor: true,
  },
  cheongnyangni: {
    id: 'cheongnyangni',
    name: '청량리',
    nameEn: 'Cheongnyangni',
    lat: 37.5808,
    lng: 127.0475,
    routes: ['중앙선', '경춘선', '강릉선'],
    isTerminal: true,
    isMajor: true,
  },
  daejeon: {
    id: 'daejeon',
    name: '대전',
    nameEn: 'Daejeon',
    lat: 36.3324,
    lng: 127.4345,
    routes: ['경부선', '호남선'],
    isTerminal: false,
    isMajor: true,
  },
  dongdaegu: {
    id: 'dongdaegu',
    name: '동대구',
    nameEn: 'Dongdaegu',
    lat: 35.8795,
    lng: 128.6283,
    routes: ['경부선', '대구선'],
    isTerminal: false,
    isMajor: true,
  },
  busan: {
    id: 'busan',
    name: '부산',
    nameEn: 'Busan',
    lat: 35.1152,
    lng: 129.0412,
    routes: ['경부선', '동해선'],
    isTerminal: true,
    isMajor: true,
  },
  gwangju: {
    id: 'gwangju',
    name: '광주송정',
    nameEn: 'Gwangju-Songjeong',
    lat: 35.1378,
    lng: 126.7931,
    routes: ['호남선', '경전선'],
    isTerminal: false,
    isMajor: true,
  },
  mokpo: {
    id: 'mokpo',
    name: '목포',
    nameEn: 'Mokpo',
    lat: 34.7914,
    lng: 126.3818,
    routes: ['호남선'],
    isTerminal: true,
    isMajor: true,
  },
  iksan: {
    id: 'iksan',
    name: '익산',
    nameEn: 'Iksan',
    lat: 35.9620,
    lng: 126.9573,
    routes: ['호남선', '전라선', '장항선'],
    isTerminal: false,
    isMajor: true,
  },
  jeonju: {
    id: 'jeonju',
    name: '전주',
    nameEn: 'Jeonju',
    lat: 35.8122,
    lng: 127.1482,
    routes: ['전라선'],
    isTerminal: false,
    isMajor: true,
  },
  yeosu: {
    id: 'yeosu',
    name: '여수엑스포',
    nameEn: 'Yeosu-Expo',
    lat: 34.7475,
    lng: 127.7445,
    routes: ['전라선'],
    isTerminal: true,
    isMajor: true,
  },
  andong: {
    id: 'andong',
    name: '안동',
    nameEn: 'Andong',
    lat: 36.5684,
    lng: 128.7294,
    routes: ['중앙선'],
    isTerminal: false,
    isMajor: false,
  },
  gangneung: {
    id: 'gangneung',
    name: '강릉',
    nameEn: 'Gangneung',
    lat: 37.7644,
    lng: 128.8961,
    routes: ['강릉선'],
    isTerminal: true,
    isMajor: true,
  },
  wonju: {
    id: 'wonju',
    name: '원주',
    nameEn: 'Wonju',
    lat: 37.3521,
    lng: 127.9455,
    routes: ['중앙선', '강릉선'],
    isTerminal: false,
    isMajor: false,
  },
  cheonan: {
    id: 'cheonan',
    name: '천안아산',
    nameEn: 'Cheonan-Asan',
    lat: 36.7946,
    lng: 127.1048,
    routes: ['경부선'],
    isTerminal: false,
    isMajor: true,
  },
  osong: {
    id: 'osong',
    name: '오송',
    nameEn: 'Osong',
    lat: 36.6208,
    lng: 127.3032,
    routes: ['경부선', '호남선'],
    isTerminal: false,
    isMajor: true,
  },
  gimcheon: {
    id: 'gimcheon',
    name: '김천구미',
    nameEn: 'Gimcheon-Gumi',
    lat: 36.1203,
    lng: 128.1139,
    routes: ['경부선'],
    isTerminal: false,
    isMajor: false,
  },
  ulsan: {
    id: 'ulsan',
    name: '울산',
    nameEn: 'Ulsan',
    lat: 35.5497,
    lng: 129.3194,
    routes: ['경부선'],
    isTerminal: false,
    isMajor: true,
  },
};

// 노선 데이터
export const routes: Record<string, Route> = {
  gyeongbu: {
    id: 'gyeongbu',
    name: '경부선',
    nameEn: 'Gyeongbu Line',
    color: '#ef4444',
    totalDistance: 423,
    stations: ['seoul', 'yongsan', 'cheonan', 'osong', 'daejeon', 'gimcheon', 'dongdaegu', 'ulsan', 'busan'],
    avgTravelTime: 150,
  },
  honam: {
    id: 'honam',
    name: '호남선',
    nameEn: 'Honam Line',
    color: '#10b981',
    totalDistance: 411,
    stations: ['yongsan', 'osong', 'iksan', 'gwangju', 'mokpo'],
    avgTravelTime: 165,
  },
  jeolla: {
    id: 'jeolla',
    name: '전라선',
    nameEn: 'Jeolla Line',
    color: '#3b82f6',
    totalDistance: 276,
    stations: ['yongsan', 'osong', 'iksan', 'jeonju', 'yeosu'],
    avgTravelTime: 210,
  },
  jungang: {
    id: 'jungang',
    name: '중앙선',
    nameEn: 'Jungang Line',
    color: '#f97316',
    totalDistance: 387,
    stations: ['cheongnyangni', 'wonju', 'andong'],
    avgTravelTime: 180,
  },
  gangneung: {
    id: 'gangneung',
    name: '강릉선',
    nameEn: 'Gangneung Line',
    color: '#06b6d4',
    totalDistance: 238,
    stations: ['cheongnyangni', 'wonju', 'gangneung'],
    avgTravelTime: 110,
  },
  suseo: {
    id: 'suseo',
    name: '수서고속선',
    nameEn: 'SRT Line',
    color: '#8b5cf6',
    totalDistance: 409,
    stations: ['suseo', 'dongdaegu', 'busan'],
    avgTravelTime: 135,
  },
};

// 노선별 역간 거리 및 소요시간
export const routeSegments: Record<string, Array<{
  from: string;
  to: string;
  distance: number;
  ktxTime: number;
  regularTime: number;
}>> = {
  gyeongbu: [
    { from: 'seoul', to: 'yongsan', distance: 3, ktxTime: 4, regularTime: 6 },
    { from: 'yongsan', to: 'cheonan', distance: 96, ktxTime: 34, regularTime: 55 },
    { from: 'cheonan', to: 'osong', distance: 34, ktxTime: 15, regularTime: 25 },
    { from: 'osong', to: 'daejeon', distance: 26, ktxTime: 12, regularTime: 20 },
    { from: 'daejeon', to: 'gimcheon', distance: 73, ktxTime: 22, regularTime: 45 },
    { from: 'gimcheon', to: 'dongdaegu', distance: 65, ktxTime: 18, regularTime: 40 },
    { from: 'dongdaegu', to: 'ulsan', distance: 76, ktxTime: 22, regularTime: 50 },
    { from: 'ulsan', to: 'busan', distance: 50, ktxTime: 15, regularTime: 35 },
  ],
  honam: [
    { from: 'yongsan', to: 'osong', distance: 127, ktxTime: 45, regularTime: 75 },
    { from: 'osong', to: 'iksan', distance: 115, ktxTime: 40, regularTime: 70 },
    { from: 'iksan', to: 'gwangju', distance: 85, ktxTime: 35, regularTime: 55 },
    { from: 'gwangju', to: 'mokpo', distance: 84, ktxTime: 30, regularTime: 50 },
  ],
};

// 에너지 계산 상수
export const energyConstants = {
  ktxEnergyPerKm: 11.3, // kWh/km (KTX 기준)
  srtEnergyPerKm: 10.5,
  itxEnergyPerKm: 7.2,
  mugunghwaEnergyPerKm: 5.8,
  freightEnergyPerKm: 8.5,
  deadheadEnergyPerKm: 4.2,
  regenerativeBrakingEfficiency: 0.25, // 회생제동 에너지 회수율
  peakDemandMultiplier: 1.15, // 피크 시간대 에너지 증가율
};

// 거리 기반 에너지 소비량 계산
export function calculateEnergy(
  routeId: string,
  trainType: 'KTX' | 'SRT' | 'ITX' | 'MUGUNGHWA' | 'FREIGHT' | 'DEADHEAD',
  isPeakHour: boolean = false
): number {
  const route = routes[routeId];
  if (!route) return 0;

  let energyPerKm: number;
  switch (trainType) {
    case 'KTX':
      energyPerKm = energyConstants.ktxEnergyPerKm;
      break;
    case 'SRT':
      energyPerKm = energyConstants.srtEnergyPerKm;
      break;
    case 'ITX':
      energyPerKm = energyConstants.itxEnergyPerKm;
      break;
    case 'MUGUNGHWA':
      energyPerKm = energyConstants.mugunghwaEnergyPerKm;
      break;
    case 'FREIGHT':
      energyPerKm = energyConstants.freightEnergyPerKm;
      break;
    case 'DEADHEAD':
      energyPerKm = energyConstants.deadheadEnergyPerKm;
      break;
    default:
      energyPerKm = energyConstants.mugunghwaEnergyPerKm;
  }

  let energy = route.totalDistance * energyPerKm;

  // 피크 시간대 보정
  if (isPeakHour) {
    energy *= energyConstants.peakDemandMultiplier;
  }

  // 회생제동 에너지 회수 적용
  energy *= (1 - energyConstants.regenerativeBrakingEfficiency);

  return Math.round(energy);
}
