# domain/

**비즈니스 규칙과 도메인 모델**만 담는 순수 TypeScript 레이어.
React Native, Expo, 저장소 라이브러리 등 **외부 프레임워크에 의존하지 않습니다**.

## 왜 따로 두는가
- 프레임워크를 교체(또는 제거)해도 핵심 로직은 그대로 유지
- 단위 테스트가 가볍고 빠름 (네이티브 모듈 mock 불필요)
- OOP / SOLID 원칙을 가장 엄격히 적용하는 레이어

## 폴더 구조

```
domain/
├── models/          # 도메인 엔티티 (클래스) — 상태 + 행위
└── usecases/        # 비즈니스 유스케이스 (Application Service)
```

## 작성 원칙

1. **순수함수 / 불변성** — 가능한 한 순수하게, 사이드 이펙트는 Use Case 경계에서만.
2. **DI로 외부 의존 주입** — Use Case는 생성자로 `IFeedingRepository` 등을 받음.
3. **Result / 명시적 예외** — 실패 케이스를 타입으로 표현.
4. **TDD 우선** — 이 레이어는 커버리지 95% 목표.

## 의존 방향

```
domain/usecases/  ──► domain/models/
                  ──► <interfaces from data layer>   ← abstraction only
```

Data 레이어의 **인터페이스(추상)** 에만 의존하고, **구현(MMKV 등)** 에는 의존하지 않습니다.
