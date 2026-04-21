# TDD (Test-Driven Development) 가이드

## 철학

**"테스트가 없는 코드는 레거시 코드다."** — Michael Feathers

이 프로젝트는 특히 **Domain / Data / Utils 레이어는 TDD로 작성**합니다.
UI 레이어(컴포넌트)는 통합 테스트·스모크 테스트 중심으로 검증합니다.

## Red → Green → Refactor 사이클

1. **Red** — 실패하는 테스트를 먼저 작성 (요구사항 명세화)
2. **Green** — 테스트를 통과시키는 **최소한의 코드** 작성
3. **Refactor** — 중복 제거, 구조 개선 (테스트는 계속 통과해야 함)

## 레이어별 테스트 전략

| 레이어 | 테스트 종류 | 도구 | 목표 커버리지 |
|--------|------------|------|---------------|
| Domain (models, usecases) | 순수 단위 테스트 | Jest | **95%+** |
| Data (repository, storage) | 단위 테스트 + 인메모리 구현체로 통합 | Jest | **90%+** |
| Utils (parser, dateHelpers) | 순수 단위 테스트 | Jest | **95%+** |
| Hooks | 훅 단위 테스트 | `@testing-library/react-native` | **70%+** |
| Components | 스냅샷 + 상호작용 | `@testing-library/react-native` | **50%+** |
| Screens | E2E 스모크 | Detox (향후) | — |

## 명명 규칙

- 테스트 파일: `<source>.test.ts(x)` — 구현 파일과 **같은 폴더**
- `describe(ClassName)` — 클래스·함수명
- `it('should ...')` 또는 `it('...하면 ...한다')` — 동작 기반 서술

## 예시 — FeedingRecord 클래스 TDD

```typescript
// FeedingRecord.test.ts

describe('FeedingRecord', () => {
  describe('isToday', () => {
    it('오늘 생성된 기록이면 true를 반환한다', () => {
      const record = new FeedingRecord({ timestamp: Date.now() });
      expect(record.isToday()).toBe(true);
    });

    it('어제 생성된 기록이면 false를 반환한다', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const record = new FeedingRecord({ timestamp: yesterday });
      expect(record.isToday()).toBe(false);
    });
  });

  describe('fromJSON', () => {
    it('유효한 JSON으로 인스턴스를 복원한다', () => {
      const json = { id: '1', timestamp: 0, source: 'voice' };
      const record = FeedingRecord.fromJSON(json);
      expect(record.id).toBe('1');
    });

    it('필수 필드가 없으면 에러를 던진다', () => {
      expect(() => FeedingRecord.fromJSON({})).toThrow();
    });
  });
});
```

## 테스트 더블 (Mocks / Stubs)

- **Stub** — 고정된 값을 반환하는 가짜 의존성 (예: `InMemoryStorage`)
- **Mock** — 호출 여부·인자를 검증하는 객체 (예: `jest.fn()`)
- **Spy** — 실제 동작은 유지하되 호출 정보를 기록

**원칙:** 가능한 한 **Stub > Mock** 을 선호합니다.
상태 기반 검증(state-based testing)이 상호작용 검증(interaction-based testing)보다 리팩터링에 강합니다.

## 실행 방법

```bash
# 한 번 실행
npm test

# 파일 변경 시 자동 재실행 (TDD 권장)
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## CI 통합 (향후)

- PR 시 `npm run typecheck && npm run lint && npm test` 전체 통과 필수
- 커버리지 기준 미달 시 빌드 실패

## 다루지 않는 것 (Out of Scope)

- 시간·무작위·네트워크에 의존하는 코드는 **의존성 주입**으로 추출 후 테스트합니다
  - 예: `Clock` 인터페이스로 `Date.now()` 추상화
- 플래키(flaky) 테스트는 즉시 수정하거나 삭제합니다 — 방치 금지
