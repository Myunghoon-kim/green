# hooks/

프레젠테이션 레이어를 위한 **재사용 가능한 커스텀 훅**.
UI 컴포넌트와 도메인/데이터 레이어 사이의 접착제 역할.

## 규칙

- 훅 하나 = 하나의 관심사 (SRP)
- 반환은 **객체 리터럴** (배열 순서 의존 금지)
- 비동기는 async/await, 에러는 상태로 표현

## 파일

- [useSpeechRecording.ts](useSpeechRecording.ts) — 음성 녹음·전사 훅
- [useFeedingStats.ts](useFeedingStats.ts) — 통계 집계 훅
