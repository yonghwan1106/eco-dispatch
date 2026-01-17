# Eco-Dispatch

> **신재생 에너지 연계형 지능형 열차 스케줄링 시스템**

AI 기반 열차 스케줄 최적화로 신재생 에너지 활용 극대화 및 탄소 중립을 실현하는 스마트 철도 운영 시스템입니다.

## 주요 기능

### 1. 실시간 대시보드
- **덕 커브 차트**: 24시간 전력 수요/공급 곡선 시각화
- **Green Window 표시기**: 신재생 에너지 잉여 시간대 실시간 모니터링
- **SMP 가격 게이지**: 계통한계가격 실시간 추적
- **실시간 메트릭스**: 운행 열차 수, 전력 소비량, 비용 절감액, CO2 감축량

### 2. 열차 스케줄 간트차트
- 인터랙티브 간트차트로 열차 운행 스케줄 시각화
- 기존 스케줄 vs AI 최적화 스케줄 비교
- 열차 유형별 필터링 (KTX, SRT, ITX, 무궁화호, 화물열차, 회송열차)
- Green Window 영역 하이라이트

### 3. AI 시뮬레이션
- **강화학습 기반 스케줄 최적화**: Q-러닝 알고리즘 적용
- **파라미터 조정 UI**: 정시성, 비용 절감, 그리드 동기화, 안전성 가중치 조절
- **실시간 학습 시각화**: 에피소드별 보상 추이, 성능 지표 그래프
- **열차 운행 애니메이션**: 시뮬레이션 시간 기반 열차 위치 표시

### 4. 성과 분석 리포트
- **비용 분석**: 월별/연간 비용 절감 추이, 비용 구성 분석
- **탄소 감축**: CO2 감축량, 나무 환산, 탄소배출권 가치 계산
- **ROI 분석**: 투자 비용 조절 가능한 ROI 계산기, 손익분기점 분석
- **운영 효율**: 시간대별 효율 차트, Green Window 활용률

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Animation**: Framer Motion
- **State Management**: Zustand

## 시작하기

### 설치

```bash
# 저장소 클론
git clone https://github.com/yonghwan1106/eco-dispatch.git

# 디렉토리 이동
cd eco-dispatch

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
eco-dispatch/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 대시보드
│   ├── schedule/          # 열차 스케줄 페이지
│   ├── simulation/        # AI 시뮬레이션 페이지
│   └── analytics/         # 성과 분석 페이지
├── components/
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   ├── schedule/          # 스케줄 컴포넌트
│   ├── simulation/        # 시뮬레이션 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── lib/
│   ├── data/              # Mock 데이터
│   └── simulation/        # 시뮬레이션 엔진
└── store/                 # Zustand 상태 관리
```

## 시뮬레이션 엔진

### 전력망 시뮬레이터 (grid-simulator.ts)
- 24시간 전력 수급 패턴 시뮬레이션
- 태양광/풍력 발전량 계산
- SMP 가격 결정 로직
- Green Window / 플러스 DR 판정

### 열차 엔진 (train-engine.ts)
- 열차 스케줄 최적화 알고리즘
- 제약 조건 관리 (최소 배차 간격, 노선 용량)
- 에너지 비용 계산

### 강화학습 에이전트 (rl-agent.ts)
- Q-러닝 기반 의사결정
- 보상 함수: R = w1×R_정시성 + w2×R_비용 + w3×R_그리드 - w4×P_안전
- 에피소드 학습 및 수렴

## 핵심 개념

### Green Window
신재생 에너지 발전량이 전력 수요를 초과하여 잉여 전력이 발생하는 시간대. 이 시간대에 열차를 운행하면 저렴한 전력 비용과 낮은 탄소 배출을 달성할 수 있습니다.

### Duck Curve
하루 동안의 전력 수요에서 태양광 발전량을 뺀 순부하(Net Load) 곡선. 태양광 발전이 증가하면서 정오에 순부하가 급격히 감소하고 저녁에 급증하는 오리 모양의 곡선이 형성됩니다.

### SMP (System Marginal Price)
계통한계가격. 전력 시장에서 전력 거래 가격을 결정하는 기준이 되는 가격입니다. 재생에너지 잉여 시 마이너스 SMP가 발생할 수 있습니다.

## 라이선스

MIT License

---

**Eco-Dispatch** - AI로 더 깨끗한 철도 운영을 실현합니다.
