# components/

재사용 가능한 **프레젠테이션 컴포넌트**.
비즈니스 로직은 담지 않고 props 로 받은 데이터만 렌더합니다.

## 구조

```
components/
├── VoiceButton/
│   ├── index.ts          # re-export
│   └── VoiceButton.tsx
├── FeedingCard/
│   ├── index.ts
│   └── FeedingCard.tsx
└── charts/
    ├── DailyBarChart.tsx
    └── README.md
```

## 규칙

- Props 타입은 컴포넌트 파일 상단에 `type ComponentNameProps` 로 선언
- 스타일은 컴포넌트 하단에 `StyleSheet.create` 로 분리
- **비즈니스 로직·외부 상태 접근 금지** — 필요 시 훅으로 분리하여 screen 레벨에서 조립
- 국제화가 필요한 문자열은 `useTranslation` 훅 사용
