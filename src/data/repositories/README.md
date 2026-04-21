# data/repositories/

도메인 Repository 의 **인터페이스와 구현체**.

## Repository 패턴

도메인 레이어는 **영속성이 어떻게 이루어지는지 몰라야** 합니다.
Repository 가 그 경계를 추상화합니다.

## 파일

- [IFeedingRepository.ts](IFeedingRepository.ts) — 인터페이스 (도메인/유스케이스가 의존하는 대상)
- [FeedingRepository.ts](FeedingRepository.ts) — IStorage 기반 구현체

## 직렬화 정책

- 엔티티는 `FeedingRecord.toJSON()` 로 평면 데이터로 변환 후 `JSON.stringify`
- 읽을 때는 `JSON.parse` → `FeedingRecord.fromJSON()` 로 검증하며 복원
- 깨진 레코드는 **silently 스킵하지 않고** 예외를 던져 상위에서 대응
