# domain/models/

도메인 엔티티 (Entity). **상태 + 행위**를 가진 클래스로 표현합니다.

## 왜 클래스인가?
- 단순 `interface` / `type` 은 **값 객체**이지 엔티티가 아닙니다.
- 도메인 규칙(예: `isToday()`, `formatSummary()`)을 캡슐화하려면 **메서드를 가진 클래스**가 적합합니다.
- 직렬화/역직렬화 책임을 `toJSON()` / `fromJSON()` static 메서드로 분리합니다.

## 관례

- 생성자는 `data` 객체 하나를 받습니다 (named parameters 패턴).
- 필드는 `readonly` 로 불변.
- 변경이 필요한 경우 `copyWith(partial)` 로 새 인스턴스 반환.
- 저장소와의 경계에서 `toJSON()` / `fromJSON()` 사용.

## 현재 모델

- [FeedingRecord](FeedingRecord.ts) — 수유 기록 1건
