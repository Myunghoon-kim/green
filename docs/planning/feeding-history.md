# 수유 기록 목록

## 배경
저장한 기록을 시간 순으로 확인·수정·삭제할 수 있어야 한다.

## 요구사항

### 수용 조건
- [ ] 오늘 / 이번 주 / 전체 탭으로 필터링 가능
- [ ] 각 카드에 시간·방향·시간(분) 또는 양(ml) 표시
- [ ] 카드 탭 → 상세 편집
- [ ] 스와이프 → 삭제 (확인 다이얼로그)
- [ ] 비어있을 때 안내 문구와 홈으로 이동 CTA

## 기술 설계
- `useFeedingStore` 의 `records` 를 구독
- `selectTodayRecords`, `selectThisWeekRecords` 셀렉터 사용
- `date-fns` 로 날짜 그룹핑

## 테스트 계획
- [ ] selectTodayRecords — 타임존 경계 케이스
- [ ] selectThisWeekRecords — 주 시작 요일(월요일) 기준

## 마일스톤
- [ ] M1: 목록 + 삭제
- [ ] M2: 편집 다이얼로그
- [ ] M3: 날짜 그룹핑 UI
