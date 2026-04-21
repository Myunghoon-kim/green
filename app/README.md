# app/ (Expo Router)

파일 기반 라우팅의 루트. 이 폴더의 구조가 곧 앱의 화면 구조입니다.

## 구조

```
app/
├── _layout.tsx          # 루트 레이아웃 (i18n 초기화, hydrate)
└── (tabs)/              # 탭 그룹
    ├── _layout.tsx      # 탭 네비게이터
    ├── index.tsx        # 홈 (음성 기록)
    ├── history.tsx      # 기록 목록
    └── stats.tsx        # 통계
```

## 규칙

- 이 폴더는 **화면 조립(screen-level wiring)** 만 담당
- 비즈니스 로직은 `src/hooks/` 또는 `src/domain/usecases/`
- 재사용 컴포넌트는 `src/components/`

## 스크린 작성 순서

1. `src/hooks` 에서 필요한 훅을 import
2. 훅이 반환하는 상태·함수를 `src/components` 에 props 로 전달
3. 화면 자체에는 로직을 두지 않음 (컨테이너·프레젠테이션 분리)
