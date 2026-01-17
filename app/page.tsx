'use client';

import { useEffect, useState, useMemo } from 'react';
import { DuckCurveChart } from '@/components/dashboard/DuckCurveChart';
import { GreenWindowIndicator } from '@/components/dashboard/GreenWindowIndicator';
import { SMPPriceGauge } from '@/components/dashboard/SMPPriceGauge';
import { GridStatusPanel } from '@/components/dashboard/GridStatusPanel';
import { RealTimeMetrics, DetailedMetrics } from '@/components/dashboard/RealTimeMetrics';
import { generateGridData } from '@/lib/data/mock-grid';
import { generateMockTrains, getTrainsByHour } from '@/lib/data/mock-trains';
import { useSimulationStore } from '@/store/simulation-store';

export default function DashboardPage() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const { initializeData, gridData, trains } = useSimulationStore();

  // 데이터 초기화
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  // 데이터가 없으면 생성
  const displayGridData = useMemo(() => {
    return gridData.length > 0 ? gridData : generateGridData();
  }, [gridData]);

  const displayTrains = useMemo(() => {
    return trains.length > 0 ? trains : generateMockTrains();
  }, [trains]);

  // 현재 시간대 운행 열차 계산
  const runningTrains = useMemo(() => {
    return getTrainsByHour(displayTrains, currentHour);
  }, [displayTrains, currentHour]);

  // 총 전력 소비량 계산
  const totalPowerConsumption = useMemo(() => {
    return runningTrains.reduce((sum, train) => sum + train.energyConsumption, 0);
  }, [runningTrains]);

  // 일일 절감액 (시뮬레이션 값)
  const todaySavings = useMemo(() => {
    const baselineCost = displayTrains.reduce((sum, train) => {
      const hour = Math.floor(train.scheduledDeparture / 60);
      return sum + train.energyConsumption * displayGridData[hour].smp;
    }, 0);
    // 최적화로 약 15% 절감 가정
    return Math.round(baselineCost * 0.15);
  }, [displayTrains, displayGridData]);

  // CO2 감축량 계산
  const co2Reduction = useMemo(() => {
    const avgCarbonReduction = 50; // gCO2/kWh 평균 감축
    return Math.round(totalPowerConsumption * avgCarbonReduction);
  }, [totalPowerConsumption]);

  // 운영 효율 지표
  const operationalMetrics = useMemo(() => {
    const greenWindowHours = displayGridData.filter((g) => g.isGreenWindow).length;
    return {
      greenWindowHours,
      peakAvoidance: 78, // 시뮬레이션 값
      avgPunctuality: 96, // 시뮬레이션 값
      energyEfficiency: 85, // 시뮬레이션 값
    };
  }, [displayGridData]);

  return (
    <div className="space-y-6">
      {/* 페이지 타이틀 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">실시간 대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          신재생 에너지 연계 열차 운행 현황 및 전력망 상태를 실시간으로 모니터링합니다.
        </p>
      </div>

      {/* 실시간 메트릭스 */}
      <RealTimeMetrics
        runningTrains={runningTrains.length}
        totalPowerConsumption={totalPowerConsumption}
        todaySavings={todaySavings}
        co2Reduction={co2Reduction}
      />

      {/* 메인 컨텐츠 그리드 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 덕 커브 차트 - 넓은 영역 */}
        <div className="lg:col-span-2">
          <DuckCurveChart gridData={displayGridData} currentHour={currentHour} />
        </div>

        {/* Green Window 상태 */}
        <div>
          <GreenWindowIndicator gridData={displayGridData} currentHour={currentHour} />
        </div>
      </div>

      {/* 하단 그리드 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SMP 가격 게이지 */}
        <div>
          <SMPPriceGauge gridData={displayGridData} currentHour={currentHour} />
        </div>

        {/* 전력망 상태 패널 */}
        <div>
          <GridStatusPanel gridData={displayGridData} currentHour={currentHour} />
        </div>

        {/* 상세 메트릭스 */}
        <div>
          <DetailedMetrics {...operationalMetrics} />
        </div>
      </div>

      {/* 열차 운행 현황 요약 */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-medium">현재 시간대 운행 열차</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">열차 ID</th>
                <th className="pb-2 font-medium">유형</th>
                <th className="pb-2 font-medium">노선</th>
                <th className="pb-2 font-medium">출발역</th>
                <th className="pb-2 font-medium">도착역</th>
                <th className="pb-2 font-medium">예상 에너지</th>
                <th className="pb-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {runningTrains.slice(0, 8).map((train) => (
                <tr key={train.id} className="border-b border-border/50">
                  <td className="py-2 font-mono text-primary">{train.id}</td>
                  <td className="py-2">{train.type}</td>
                  <td className="py-2">{train.route}</td>
                  <td className="py-2">{train.departureStation}</td>
                  <td className="py-2">{train.arrivalStation}</td>
                  <td className="py-2 font-mono">
                    {(train.energyConsumption / 1000).toFixed(1)} MWh
                  </td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      운행 중
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {runningTrains.length > 8 && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              외 {runningTrains.length - 8}개 열차 운행 중
            </p>
          )}
          {runningTrains.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              현재 시간대에 운행 중인 열차가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
