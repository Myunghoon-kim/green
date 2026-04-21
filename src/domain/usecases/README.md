# domain/usecases/

애플리케이션 유스케이스 (Application Service). 프레젠테이션 레이어와 데이터 레이어를 **조율**합니다.

## 패턴

모든 use case 는 `BaseUseCase<Input, Output>` 을 상속하여 `execute(input)` 단일 메서드로 동작합니다.

```typescript
abstract class BaseUseCase<Input, Output> {
  abstract execute(input: Input): Promise<Output>;
}
```

## 규칙

- 생성자로 **의존성을 주입**받습니다 (DI).
- 한 use case = 하나의 비즈니스 동작.
- 예외가 예상되는 경우 `Result<T>` 타입으로 반환 (명시적 실패).
- 직접 저장소나 외부 API 를 호출하지 않고, **인터페이스**를 통해 호출합니다.

## 현재 Use Case

- [BaseUseCase](BaseUseCase.ts) — 추상 기반 클래스
- [SaveFeedingRecord](SaveFeedingRecord.ts) — 수유 기록 저장
- [ParseVoiceInput](ParseVoiceInput.ts) — 음성 텍스트 → 수유 기록 파싱
