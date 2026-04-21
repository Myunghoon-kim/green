# Green — 음성 수유 기록 앱

아기 수유 기록을 **음성 인식**으로 빠르게 입력하고, **도표**로 한눈에 확인하는 크로스플랫폼 모바일 앱입니다.

## 관련 문서

- [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) — Conventional Commits 커밋 규칙
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 레이어드 아키텍처·SOLID·디자인 패턴·ADR
- [docs/TDD.md](docs/TDD.md) — TDD 전략과 레이어별 커버리지 목표
- [docs/planning/](docs/planning/) — 기능별 기획 문서 (음성 기록, 기록 목록, 통계)
- 각 `src/` 하위 폴더의 `README.md` — 해당 폴더의 역할·규칙

---

## 핵심 기능

- **음성 인식 기록** — 마이크 버튼 하나로 수유 시간·양을 말로 기록
- **수유 기록 목록** — 날짜별 타임라인 뷰
- **통계 도표** — 일별·주별 수유 횟수 / 수유량 차트
- **다국어 지원 준비** — `ko-KR` 기본, 로케일 확장 가능

---

## 기술 스택

| 영역 | 라이브러리 | 선택 이유 |
|------|-----------|-----------|
| 프레임워크 | React Native + Expo (bare workflow) | iOS/Android 동시 지원, 네이티브 모듈 접근 가능 |
| 음성 인식 | `expo-speech-recognition` (jamsch) | `@react-native-voice/voice` deprecated(2026-01 아카이브됨) 이후 공식 권장 대안 |
| 차트 | `victory-native` | D3 기반, Skia 렌더링으로 고성능, 웹과 API 공유 가능 |
| 로컬 저장소 | `react-native-mmkv` | AsyncStorage 대비 ~30배 빠른 읽기/쓰기, 음성 전사 중 빈번한 쓰기에 적합 |
| 상태 관리 | `zustand` | 경량, 보일러플레이트 최소, 슬라이스 패턴으로 확장 용이 |
| 내비게이션 | `@react-navigation/native` v6 | 업계 표준, 딥링크·탭·스택 구조 지원 |
| UI 컴포넌트 | `react-native-paper` | Material Design 3, 테마 커스터마이징 용이 |
| 날짜 처리 | `date-fns` | 트리 셰이킹 지원, 경량 |
| TypeScript | 전체 코드베이스 | 타입 안전성, IDE 자동완성 |

---

## 네이티브 vs WebView 선택 근거

> **권장: React Native (네이티브)** — WebView 방식 미채택

| 비교 항목 | React Native (네이티브) | WebView (Capacitor 등) |
|----------|------------------------|------------------------|
| 음성 인식 지연 | 디바이스 네이티브 API 직접 호출, **최소 지연** | JS ↔ Native 브릿지 왕복, 추가 레이턴시 발생 |
| 마이크 권한 처리 | OS 수준 통합, 신뢰성 높음 | 브릿지 경유, 엣지케이스 존재 |
| 백그라운드 처리 | 향후 백그라운드 인식 확장 가능 | 제약 큼 |
| 성능 | Skia/Reanimated 기반 60fps 차트 | Canvas 렌더링, 디바이스에 따라 저하 가능 |
| 코드 공유 | React 문법 동일, 웹 유사 개발 경험 | 동일 |

음성 인식은 UI 응답 속도가 UX 품질을 결정하므로 네이티브 접근을 선택합니다.

---

## 프로젝트 구조

```
green/
├── app/                        # Expo Router (파일 기반 라우팅)
│   ├── (tabs)/
│   │   ├── index.tsx           # 홈 — 음성 기록 화면
│   │   ├── history.tsx         # 기록 목록
│   │   └── stats.tsx           # 통계 도표
│   └── _layout.tsx
│
├── src/
│   ├── domain/                 # 비즈니스 로직 (프레임워크 무관)
│   │   ├── models/
│   │   │   └── FeedingRecord.ts
│   │   └── usecases/
│   │       ├── SaveFeedingRecord.ts
│   │       └── ParseVoiceInput.ts
│   │
│   ├── data/                   # 데이터 레이어
│   │   ├── repositories/
│   │   │   └── FeedingRepository.ts   # 인터페이스
│   │   └── storage/
│   │       └── MmkvFeedingStorage.ts  # MMKV 구현체
│   │
│   ├── store/                  # Zustand 슬라이스
│   │   ├── feedingSlice.ts
│   │   └── index.ts
│   │
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useSpeechRecording.ts
│   │   └── useFeedingStats.ts
│   │
│   ├── components/             # 재사용 UI 컴포넌트
│   │   ├── VoiceButton/
│   │   ├── FeedingCard/
│   │   └── charts/
│   │       ├── DailyBarChart.tsx
│   │       └── WeeklyLineChart.tsx
│   │
│   └── utils/
│       ├── voiceParser.ts      # 음성 텍스트 → 수유 데이터 파싱
│       └── dateHelpers.ts
│
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## 아키텍처 패턴

### 레이어드 아키텍처 (Clean Architecture 경량 버전)

```
Presentation (app/, components/, hooks/)
        ↓ 의존
Domain (models/, usecases/)
        ↓ 의존
Data (repositories/, storage/)
```

- **Domain 레이어**는 React Native / Expo에 의존하지 않아 테스트 용이
- **Repository 패턴** — 저장소 구현체(MMKV, 향후 서버 API)를 인터페이스로 추상화
- **Zustand 슬라이스** — 기능별 분리, 스토어 증가 시 합성 가능

### 음성 인식 플로우

```
사용자 마이크 버튼 탭
        ↓
useSpeechRecording 훅
        ↓
expo-speech-recognition.start({ lang: 'ko-KR', interimResults: true })
        ↓
onSpeechResult 이벤트 → voiceParser.ts (텍스트 파싱)
        ↓
ParseVoiceInput usecase → FeedingRecord 모델 생성
        ↓
SaveFeedingRecord usecase → MmkvFeedingStorage 저장
        ↓
Zustand store 업데이트 → UI 리렌더
```

---

## 주요 라이브러리 API 요약

### expo-speech-recognition (jamsch)

```typescript
// 권한 요청
const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

// 인식 시작
ExpoSpeechRecognitionModule.start({
  lang: 'ko-KR',
  interimResults: true,   // 실시간 중간 결과
  continuous: false,
});

// 이벤트 구독
useSpeechRecognitionEvent('result', (e) => {
  const transcript = e.results[0]?.transcript;
});
useSpeechRecognitionEvent('error', (e) => console.error(e.error));

// 중단
ExpoSpeechRecognitionModule.stop();
```

**필수 권한:**
- Android: `RECORD_AUDIO`
- iOS: `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`

### react-native-mmkv

```typescript
const storage = new MMKV();
storage.set('key', JSON.stringify(data));     // 동기 쓰기
const raw = storage.getString('key');          // 동기 읽기
```

### victory-native

```typescript
<VictoryChart>
  <VictoryBar
    data={[{ x: '월', y: 8 }, { x: '화', y: 6 }]}
    x="x" y="y"
  />
</VictoryChart>
```

---

## 수유 기록 데이터 모델

```typescript
interface FeedingRecord {
  id: string;               // UUID
  timestamp: number;        // Unix ms
  durationMinutes?: number; // 수유 시간(분)
  amountMl?: number;        // 수유량(ml) — 분유
  side?: 'left' | 'right' | 'both'; // 모유 방향
  note?: string;            // 원본 음성 텍스트
  source: 'voice' | 'manual';
}
```

---

## 음성 파싱 예시

| 음성 입력 | 파싱 결과 |
|----------|----------|
| "왼쪽 15분" | `{ side: 'left', durationMinutes: 15 }` |
| "분유 80ml" | `{ amountMl: 80 }` |
| "양쪽 20분" | `{ side: 'both', durationMinutes: 20 }` |
| "오른쪽 10분 먹었어" | `{ side: 'right', durationMinutes: 10 }` |

---

## 개발 환경 설정 (예정)

```bash
# 의존성 설치
npm install

# iOS
npx expo run:ios

# Android
npx expo run:android
```

**필수 환경:**
- Node.js 20+
- Xcode 15+ (iOS)
- Android Studio + SDK 34+ (Android)
- Expo CLI

---

## 코딩 컨벤션

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `VoiceButton`, `FeedingCard` |
| 훅 | camelCase, `use` 접두사 | `useSpeechRecording`, `useFeedingStats` |
| 유틸 함수 | camelCase | `parseVoiceInput`, `formatDuration` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RECORDING_SECONDS`, `STORAGE_KEY` |
| 타입 / 인터페이스 | PascalCase, `I` 접두사 없음 | `FeedingRecord`, `SpeechResult` |
| 파일명 (컴포넌트) | PascalCase | `VoiceButton.tsx` |
| 파일명 (훅·유틸) | camelCase | `useSpeechRecording.ts`, `voiceParser.ts` |
| Zustand 슬라이스 | camelCase + `Slice` 접미사 | `feedingSlice.ts` |

---

### TypeScript 규칙

```typescript
// 1. any 금지 — unknown 또는 명시적 타입 사용
const parse = (raw: unknown): FeedingRecord => { ... };

// 2. 인터페이스보다 type alias 우선 (확장이 필요한 경우 interface)
type FeedingSide = 'left' | 'right' | 'both';

// 3. 옵셔널 체이닝 / Nullish coalescing 적극 사용
const duration = record?.durationMinutes ?? 0;

// 4. 함수 반환 타입 명시 (추론이 불명확한 경우)
async function loadRecords(): Promise<FeedingRecord[]> { ... }

// 5. enum 대신 const object + as const
const FeedingSource = {
  VOICE: 'voice',
  MANUAL: 'manual',
} as const;
type FeedingSource = typeof FeedingSource[keyof typeof FeedingSource];
```

---

### 컴포넌트 작성 규칙

```typescript
// 1. 함수형 컴포넌트 + 화살표 함수
// 2. Props 타입은 컴포넌트 파일 상단에 선언
// 3. 스타일은 컴포넌트 하단에 StyleSheet.create로 분리

type VoiceButtonProps = {
  onResult: (transcript: string) => void;
  disabled?: boolean;
};

const VoiceButton = ({ onResult, disabled = false }: VoiceButtonProps) => {
  // 훅은 최상단에 선언
  const { isRecording, start, stop } = useSpeechRecording({ onResult });

  // 이벤트 핸들러는 handle 접두사
  const handlePress = async () => {
    if (isRecording) await stop();
    else await start();
  };

  return (
    <Pressable style={styles.button} onPress={handlePress} disabled={disabled}>
      ...
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: { ... },
});

export default VoiceButton;
```

---

### 커스텀 훅 작성 규칙

```typescript
// 1. 단일 책임 — 훅 하나가 하나의 관심사만 담당
// 2. 반환값은 객체 리터럴 (순서 의존 제거)
// 3. 비동기 함수는 에러를 throw하지 않고 Result 타입으로 반환

type SpeechResult =
  | { ok: true; transcript: string }
  | { ok: false; error: string };

const useSpeechRecording = () => {
  const [isRecording, setIsRecording] = useState(false);

  const start = async (): Promise<void> => { ... };
  const stop = async (): Promise<SpeechResult> => { ... };

  return { isRecording, start, stop };
};
```

---

### 비동기 처리 규칙

```typescript
// 1. async/await 우선, .then() 체이닝 지양
// 2. try/catch는 usecase 또는 훅 레이어에서만 처리
//    (하위 레이어는 에러를 throw, 상위에서 일괄 처리)
// 3. Promise.all로 독립적인 비동기 작업 병렬 실행

// 좋은 예
const [records, settings] = await Promise.all([
  feedingRepo.getAll(),
  settingsRepo.get(),
]);

// 4. useEffect 내 비동기는 내부 함수로 분리
useEffect(() => {
  const load = async () => {
    const data = await feedingRepo.getAll();
    setRecords(data);
  };
  load();
}, []);
```

---

### 상태 관리 규칙 (Zustand)

```typescript
// 1. 스토어는 슬라이스 단위로 분리, index.ts에서 합성
// 2. 액션은 슬라이스 내부에 정의 (스토어 외부 분리 금지)
// 3. 파생 데이터는 selector 함수로 분리 (컴포넌트에서 직접 계산 금지)

// feedingSlice.ts
type FeedingSlice = {
  records: FeedingRecord[];
  addRecord: (record: FeedingRecord) => void;
};

const createFeedingSlice: StateCreator<FeedingSlice> = (set) => ({
  records: [],
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
});

// selector 분리
const selectTodayRecords = (state: FeedingSlice) =>
  state.records.filter((r) => isToday(r.timestamp));
```

---

### 파일 구조 규칙

```
components/VoiceButton/
├── index.ts          # 외부 공개 인터페이스 (re-export만)
├── VoiceButton.tsx   # 컴포넌트 구현
└── VoiceButton.test.tsx
```

- 컴포넌트 폴더는 `index.ts`를 통해서만 외부 접근
- 테스트 파일은 구현 파일과 같은 폴더에 위치
- barrel export(`index.ts`)는 컴포넌트 폴더 수준에서만 사용 (전역 barrel 금지 — 트리 셰이킹 저하)

---

### 임포트 순서

```typescript
// 1. React / React Native 코어
import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';

// 2. 서드파티 라이브러리
import { useMMKVString } from 'react-native-mmkv';

// 3. 내부 절대 경로 (도메인 → 데이터 → 스토어 → 훅 → 컴포넌트 → 유틸)
import { FeedingRecord } from '@/domain/models/FeedingRecord';
import { useFeedingStore } from '@/store';

// 4. 상대 경로 (같은 폴더 내)
import { styles } from './styles';
```

---

### 코드 품질 도구

| 도구 | 설정 | 목적 |
|------|------|------|
| ESLint | `@typescript-eslint` + `eslint-plugin-react-hooks` | 정적 분석 |
| Prettier | `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'` | 코드 포맷 |
| TypeScript | `strict: true`, `noUncheckedIndexedAccess: true` | 엄격 타입 검사 |

`tsconfig.json` 핵심 옵션:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

### Git 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

```
<type>(<scope>): <subject>

feat(voice): add Korean locale support for speech recognition
fix(chart): correct weekly aggregation off-by-one error
refactor(store): split feeding slice into separate file
chore(deps): upgrade expo-speech-recognition to 1.2.0
```

| type | 용도 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `test` | 테스트 추가·수정 |
| `chore` | 빌드·의존성·설정 변경 |
| `docs` | 문서 변경 |

---

## 향후 확장 계획

- [ ] iCloud / Google Drive 백업
- [ ] Apple Watch / WearOS 연동
- [ ] 수유 알림 (다음 수유 예상 시간 푸시)
- [ ] 다자녀 프로파일
- [ ] 소아과 리포트 PDF 출력
- [ ] 서버 동기화 (Firebase / Supabase)

---

*React Native + Expo bare workflow, TypeScript, Clean Architecture*
