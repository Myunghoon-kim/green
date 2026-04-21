# data/voice/parsers/

음성 텍스트를 수유 기록 입력으로 변환하는 **언어별 파서**.
**Strategy 패턴** + **Factory 패턴** 조합.

## 왜 언어별로 분리하나

- 한국어: "왼쪽 15분", "분유 80ml" → 어순·조사 기반
- 영어: "left 15 minutes", "80ml formula" → 단어 순서
- 일본어/중국어 등 추가 시에도 같은 전략

한 파일에 언어별 분기를 모두 넣으면 OCP 위반 — 새 언어 추가 시 기존 코드 수정이 필요합니다.
언어별 `IVoiceParser` 구현체를 만들고 Factory 에 등록만 하면 확장됩니다.

## 파일

- [IVoiceParser.ts](IVoiceParser.ts) — 파서 인터페이스
- [KoreanVoiceParser.ts](KoreanVoiceParser.ts) — 한국어
- [EnglishVoiceParser.ts](EnglishVoiceParser.ts) — 영어
- [VoiceParserFactory.ts](VoiceParserFactory.ts) — 로케일 기반 선택

## 추가 방법 (예: 일본어)

```typescript
// 1. JapaneseVoiceParser.ts 작성 (IVoiceParser 구현)
export class JapaneseVoiceParser implements IVoiceParser {
  locale = 'ja-JP';
  parse(text: string) { /* ... */ }
}

// 2. VoiceParserFactory 에 등록
private static parsers: Record<SupportedLocale, () => IVoiceParser> = {
  'ko-KR': () => new KoreanVoiceParser(),
  'en-US': () => new EnglishVoiceParser(),
  'ja-JP': () => new JapaneseVoiceParser(), // ← 추가
};

// 3. i18n/config.ts 의 SUPPORTED_LOCALES 에 'ja-JP' 추가
// 4. locales/ja.json 리소스 추가
```

기존 파서 코드는 **전혀 건드리지 않습니다** (OCP).
