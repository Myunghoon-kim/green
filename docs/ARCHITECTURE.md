# 아키텍처 문서

## 개요

Green 은 **Clean Architecture (경량)** 를 따르는 React Native + Expo 앱입니다.
레이어는 세 개로 단순화되어 있으며, **상위 레이어는 하위 레이어만 의존**합니다.

```
┌────────────────────────────────────────┐
│ Presentation  (app/, components/, hooks/)
├────────────────────────────────────────┤
│ Domain        (models/, usecases/)      ← 프레임워크 무관
├────────────────────────────────────────┤
│ Data          (repositories/, storage/) ← 외부 I/O 담당
└────────────────────────────────────────┘
```

## OOP / SOLID 적용

### SRP (Single Responsibility Principle)
- 한 클래스는 하나의 책임만 가진다.
- 예: `FeedingRecord` 는 수유 기록 도메인 규칙만, `FeedingRepository` 는 저장/조회만.

### OCP (Open/Closed Principle)
- 확장에는 열려 있고 수정에는 닫혀 있다.
- 예: 새 언어 지원 시 `IVoiceParser` 구현체를 추가하기만 하면 되고, 기존 코드 수정 불필요.

### LSP (Liskov Substitution Principle)
- 서브타입은 상위 타입을 대체 가능해야 한다.
- 예: `IStorage` 의 `MmkvStorage` / `InMemoryStorage` 는 서로 교체 가능.

### ISP (Interface Segregation Principle)
- 작고 집중된 인터페이스를 선호한다.
- 예: `IStorage` 는 `get/set/delete` 만, 쿼리가 필요하면 별도 인터페이스로 분리.

### DIP (Dependency Inversion Principle)
- 상위 모듈은 하위 모듈에 의존하지 않고, **추상에 의존**한다.
- 예: `FeedingRepository` 는 `MMKV` 가 아니라 `IStorage` 에 의존 → 테스트에서 `InMemoryStorage` 로 교체.

## 디자인 패턴 적용 지점

| 패턴 | 적용 지점 | 이유 |
|------|----------|------|
| Repository | `IFeedingRepository` | 저장소 구현체 교체 가능 (MMKV → 서버 API) |
| Strategy | `IVoiceParser` + `KoreanVoiceParser` / `EnglishVoiceParser` | 언어별 파싱 로직을 런타임에 선택 |
| Factory | `VoiceParserFactory` | 로케일 기반으로 적절한 파서 생성 |
| Use Case | `BaseUseCase` + `SaveFeedingRecordUseCase` | 비즈니스 규칙을 유스케이스 단위로 캡슐화 |
| Singleton | `useFeedingStore` (Zustand) | 전역 상태 접근 |
| Observer | `useSpeechRecognitionEvent` | 음성 인식 이벤트 구독 |

## 데이터 플로우

```
User (음성 입력)
    ↓
useSpeechRecording 훅
    ↓ onResult(transcript, locale)
VoiceParserFactory.create(locale).parse(transcript)
    ↓ Partial<FeedingRecordData>
SaveFeedingRecordUseCase.execute(partial)
    ↓
IFeedingRepository.save(record)  →  IStorage.set(...)
    ↓
useFeedingStore.addRecord(record)
    ↓
UI 리렌더 (FeedingCard, charts)
```

## ADR (Architecture Decision Records)

---

### ADR-001: React Native 채택 (WebView 대비)

- **날짜:** 2026-04-21
- **상태:** Accepted

**맥락**
음성 인식 기반 앱은 마이크 응답 지연이 UX 품질을 결정한다. iOS/Android 동시 지원이 필수.

**결정**
React Native + Expo bare workflow 채택.

**대안**
- **Capacitor + WebView** — JS ↔ Native 브릿지 왕복 지연, 마이크 권한 처리 엣지케이스
- **Flutter** — 강력하지만 팀 JS/TS 경험과 맞지 않음

**결과**
네이티브 마이크 API에 직접 접근 가능, 음성 지연 최소. 대신 네이티브 빌드 환경(Xcode, Android Studio) 필요.

---

### ADR-002: `expo-speech-recognition` 채택

- **날짜:** 2026-04-21
- **상태:** Accepted

**맥락**
`@react-native-voice/voice` 가 2026-01-31 아카이브되었다. 대안이 필요.

**결정**
`expo-speech-recognition` (by jamsch) 사용. 메인테이너가 공식 권장하는 후속 라이브러리.

**결과**
Expo 생태계와 잘 통합되며 TypeScript 타입 완비. 단, Expo bare workflow 필요.

---

### ADR-003: MMKV 채택 (AsyncStorage 대비)

- **날짜:** 2026-04-21
- **상태:** Accepted

**맥락**
음성 전사 결과를 실시간으로 저장해야 한다. AsyncStorage 는 비동기 + 상대적으로 느림.

**결정**
`react-native-mmkv` 채택.

**결과**
동기 API로 코드 단순화. 약 30배 빠른 쓰기 성능. Jest 에서는 in-memory mock 으로 대체.

---

### ADR-004: i18next 기반 다국어 지원

- **날짜:** 2026-04-21
- **상태:** Accepted

**맥락**
한국어가 기본이지만 영어/일본어 등으로 확장할 가능성이 높다.

**결정**
`i18next` + `react-i18next` + `expo-localization` 로 로케일 자동 감지.
음성 파싱도 Strategy 패턴으로 언어별 구현체 분리.

**결과**
새 언어 추가는 **locale JSON 추가 + `IVoiceParser` 구현체 추가** 만으로 가능.
