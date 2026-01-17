// 전력망 상태 타입 정의
export interface GridStatus {
  hour: number;
  solarGeneration: number; // MW
  windGeneration: number; // MW
  totalRenewable: number; // MW
  demand: number; // MW
  surplus: number; // MW (양수: 잉여, 음수: 부족)
  smp: number; // 원/kWh (System Marginal Price)
  isGreenWindow: boolean;
  isPlusDR: boolean;
  carbonIntensity: number; // gCO2/kWh
}

// 24시간 전력망 데이터 생성 (덕 커브 패턴)
export function generateGridData(): GridStatus[] {
  const data: GridStatus[] = [];

  for (let hour = 0; hour < 24; hour++) {
    // 태양광 발전량: 일출(6시)부터 일몰(18시)까지, 정오에 최대
    const solarGeneration =
      hour >= 6 && hour <= 18
        ? Math.sin(((hour - 6) * Math.PI) / 12) * 85 + Math.random() * 10
        : 0;

    // 풍력 발전량: 새벽과 밤에 더 강함
    const windBase = 15 + Math.sin((hour * Math.PI) / 12 + Math.PI) * 8;
    const windGeneration = windBase + Math.random() * 5;

    // 전력 수요: 오전 8-10시, 저녁 18-21시 피크
    const demandBase =
      50 +
      (hour >= 8 && hour <= 10 ? 25 : 0) +
      (hour >= 18 && hour <= 21 ? 35 : 0) +
      (hour >= 11 && hour <= 17 ? 15 : 0);
    const demand = demandBase + Math.random() * 10;

    const totalRenewable = solarGeneration + windGeneration;
    const surplus = totalRenewable - demand;

    // SMP 가격: 잉여 전력이 많을수록 낮아짐 (마이너스 가능)
    let smp: number;
    if (surplus > 30) {
      smp = -50 + Math.random() * 20; // 마이너스 SMP (잉여 전력 과다)
    } else if (surplus > 10) {
      smp = 30 + Math.random() * 30;
    } else if (surplus > -10) {
      smp = 80 + Math.random() * 40;
    } else {
      smp = 150 + Math.random() * 80; // 높은 SMP (전력 부족)
    }

    // Green Window: 잉여 전력이 20MW 이상일 때
    const isGreenWindow = surplus > 20;

    // 플러스 DR: 잉여 전력이 35MW 이상일 때 발령
    const isPlusDR = surplus > 35;

    // 탄소 집약도: 재생에너지 비율에 따라
    const renewableRatio = totalRenewable / (totalRenewable + 50); // 기저 화력 50MW 가정
    const carbonIntensity = 400 * (1 - renewableRatio * 0.8);

    data.push({
      hour,
      solarGeneration: Math.round(solarGeneration * 10) / 10,
      windGeneration: Math.round(windGeneration * 10) / 10,
      totalRenewable: Math.round(totalRenewable * 10) / 10,
      demand: Math.round(demand * 10) / 10,
      surplus: Math.round(surplus * 10) / 10,
      smp: Math.round(smp),
      isGreenWindow,
      isPlusDR,
      carbonIntensity: Math.round(carbonIntensity),
    });
  }

  return data;
}

// 현재 시간 기준 전력망 상태 조회
export function getCurrentGridStatus(gridData: GridStatus[]): GridStatus {
  const currentHour = new Date().getHours();
  return gridData[currentHour];
}

// 다음 Green Window까지 남은 시간 (분)
export function getNextGreenWindow(gridData: GridStatus[]): {
  hoursUntil: number;
  duration: number;
} | null {
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const checkHour = (currentHour + i) % 24;
    if (gridData[checkHour].isGreenWindow) {
      // Green Window 시작 찾음
      let duration = 0;
      for (let j = 0; j < 24; j++) {
        const nextHour = (checkHour + j) % 24;
        if (gridData[nextHour].isGreenWindow) {
          duration++;
        } else {
          break;
        }
      }
      return {
        hoursUntil: i,
        duration,
      };
    }
  }

  return null;
}

// 일일 통계 계산
export function calculateDailyStats(gridData: GridStatus[]) {
  const totalRenewable = gridData.reduce((sum, g) => sum + g.totalRenewable, 0);
  const totalDemand = gridData.reduce((sum, g) => sum + g.demand, 0);
  const avgSMP = gridData.reduce((sum, g) => sum + g.smp, 0) / 24;
  const greenWindowHours = gridData.filter((g) => g.isGreenWindow).length;
  const plusDRHours = gridData.filter((g) => g.isPlusDR).length;
  const avgCarbonIntensity =
    gridData.reduce((sum, g) => sum + g.carbonIntensity, 0) / 24;

  return {
    totalRenewable: Math.round(totalRenewable),
    totalDemand: Math.round(totalDemand),
    renewableRatio: Math.round((totalRenewable / totalDemand) * 100),
    avgSMP: Math.round(avgSMP),
    greenWindowHours,
    plusDRHours,
    avgCarbonIntensity: Math.round(avgCarbonIntensity),
  };
}
