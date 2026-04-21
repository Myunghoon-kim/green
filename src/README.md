# src/

애플리케이션 소스 코드 루트. Clean Architecture (경량) 원칙에 따라 **레이어별 폴더**로 구성됩니다.

## 레이어 의존 방향

```
Presentation (components, hooks)
        ↓
Domain      (models, usecases)
        ↓
Data        (repositories, storage)
```

상위 레이어는 하위 레이어만 의존하며, 반대 방향 의존은 금지됩니다.

## 폴더별 역할

| 폴더 | 역할 | 외부 의존 |
|------|------|-----------|
| [domain/](domain/) | 비즈니스 규칙, 프레임워크 무관 | 없음 (순수 TS) |
| [data/](data/) | 저장소·외부 I/O 구현 | `react-native-mmkv` |
| [store/](store/) | 전역 상태 (Zustand 슬라이스) | `zustand` |
| [hooks/](hooks/) | 공용 커스텀 훅 | React, Expo |
| [components/](components/) | 재사용 UI 컴포넌트 | React Native |
| [utils/](utils/) | 순수 함수 유틸 | 없음 |
| [i18n/](i18n/) | 다국어 리소스·설정 | `i18next`, `expo-localization` |

## 새 기능 추가 시 권장 순서

1. `docs/planning/<feature>.md` 작성 (기획)
2. `domain/` 에 모델·use case 추가 + **테스트 먼저** (TDD)
3. `data/` 에 필요한 저장소 메서드 추가 + 테스트
4. `store/` 슬라이스 업데이트
5. `hooks/` 로 UI-비즈니스 로직 연결
6. `components/` + 화면(`app/`) 작성
