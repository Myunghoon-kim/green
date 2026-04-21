# store/

Zustand 기반 전역 상태. **슬라이스 단위로 분리**합니다.

## 구조

```
store/
├── index.ts          # 슬라이스 합성 + useFeedingStore 공개
├── feedingSlice.ts   # 수유 기록 관련 상태/액션
└── selectors.ts      # 파생 데이터 셀렉터 (순수 함수)
```

## 규칙

1. 스토어 외부에 액션을 두지 않는다 — 모든 액션은 슬라이스 내부.
2. 파생 데이터는 **selector 함수**로 분리. 컴포넌트에서 `useStore(selectX)` 호출.
3. 스토어는 **IFeedingRepository** 주입받아 영속성 연동. Repository 구현은 여기서 알 필요 없음.
4. 훅 외부에서 필요하면 `useFeedingStore.getState()` / `.setState()` 를 쓰되, 남용 금지.
