# components/charts/

`victory-native` 기반 차트 컴포넌트.
집계 결과(일별/주별 데이터)를 받아 시각화만 담당합니다.

## 규칙
- 집계 로직은 `@/utils/aggregators` 또는 `useFeedingStats` 훅에서 계산
- 여기에서는 **렌더링만** — 순수 프레젠테이션

## 파일
- [DailyBarChart.tsx](DailyBarChart.tsx)
