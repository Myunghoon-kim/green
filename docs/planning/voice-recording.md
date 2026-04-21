# 음성 인식 수유 기록

## 배경
양육자는 양손이 바쁜 상황(아기 안고 있음)에서 기록을 남겨야 한다.
키보드 입력은 현실적으로 어려우므로 **음성 한 번으로 기록 완료**가 되어야 한다.

## 요구사항

### 사용자 시나리오
> **As a** 양육자, **I want** 마이크 버튼 하나로 수유 시간·양을 말로 기록, **so that** 아기를 내려놓지 않고도 기록할 수 있다.

### 수용 조건
- [ ] 홈 화면 하단에 큰 마이크 버튼이 있다
- [ ] 버튼 탭 → 즉시 녹음 시작 (1초 이내)
- [ ] 말하는 동안 실시간으로 텍스트가 화면에 표시된다 (interim results)
- [ ] 말이 끝나면 자동 종료 (또는 다시 탭하여 수동 종료)
- [ ] 인식된 텍스트가 `FeedingRecord` 로 파싱되어 저장된다
- [ ] 파싱 실패 시 원본 텍스트를 수동으로 편집할 수 있다
- [ ] 마이크 권한이 거부된 경우 안내 문구와 설정 이동 버튼을 표시한다

## UX 플로우

1. **홈 화면** → 마이크 버튼 탭
2. (최초) 권한 요청 다이얼로그 → 승인
3. 녹음 중 표시 (파동 애니메이션 + 실시간 텍스트)
4. 자동/수동 종료
5. 파싱 결과 미리보기 → 저장 or 편집
6. 저장 완료 → 최근 기록 카드 표시

### 엣지케이스
- 권한 거부: "설정에서 마이크 권한을 허용해주세요" + 설정 이동 버튼
- 인식 실패 (무음, 잡음): 3초 후 재시도 안내
- 네트워크 없음: iOS 는 대부분 온디바이스, Android 는 Google 엔진 의존 — 경고 표시

## 기술 설계

### 관련 도메인 모델
- [FeedingRecord](/src/domain/models/FeedingRecord.ts)

### 관련 Use Case
- `ParseVoiceInputUseCase` — 텍스트 → Partial<FeedingRecord>
- `SaveFeedingRecordUseCase` — 저장

### 외부 의존성
- `expo-speech-recognition`

### 언어별 파싱 (Strategy)
- `KoreanVoiceParser` — "왼쪽 15분", "분유 80ml"
- `EnglishVoiceParser` — "left 15 minutes", "formula 80ml"
- `VoiceParserFactory.create(locale)` 로 선택

## 테스트 계획

- [ ] KoreanVoiceParser: "왼쪽 15분" → `{ side: 'left', durationMinutes: 15 }`
- [ ] KoreanVoiceParser: "분유 80ml" → `{ amountMl: 80 }`
- [ ] KoreanVoiceParser: 빈 문자열 → `{}`
- [ ] EnglishVoiceParser: "right 10 minutes" → `{ side: 'right', durationMinutes: 10 }`
- [ ] VoiceParserFactory: 'ko-KR' → KoreanVoiceParser 인스턴스
- [ ] VoiceParserFactory: 지원하지 않는 로케일 → fallback (영어)
- [ ] ParseVoiceInputUseCase: 원본 텍스트를 note 필드에 보존

## 마일스톤
- [ ] M1: 한국어 기본 파싱 (시간·방향)
- [ ] M2: 분유량 파싱 + 영어 추가
- [ ] M3: 실시간 미리보기 UI + 편집 기능
