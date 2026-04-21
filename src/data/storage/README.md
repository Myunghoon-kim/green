# data/storage/

Key-value 저장소 추상화와 구현체.

## 왜 추상화하나

- 유닛 테스트에서는 `InMemoryStorage` 로 MMKV 없이 검증
- 추후 서버 동기화 시 `RemoteStorage` 로 교체 가능
- 저장소 변경 시 Repository 코드 수정 불필요

## 파일

- [IStorage.ts](IStorage.ts) — 저장소 인터페이스 (ISP 준수: get/set/delete/keys)
- [MmkvStorage.ts](MmkvStorage.ts) — `react-native-mmkv` 구현체 (앱 런타임용)
- [InMemoryStorage.ts](InMemoryStorage.ts) — Map 기반 구현체 (테스트·SSR 용)
