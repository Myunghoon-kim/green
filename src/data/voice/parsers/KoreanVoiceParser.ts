/**
 * 한국어 음성 텍스트 파서.
 *
 * 인식 대상:
 *   - 방향: "왼쪽", "오른쪽", "양쪽"
 *   - 시간: "N분", "N 분"
 *   - 양:   "Nml", "N ml", "N밀리", "N 밀리리터"
 *   - 수유타입: "분유", "모유" (미지정 시 상위 default = formula)
 *
 * 정확도 개선:
 *   1. `hints` 로 SFSpeechRecognitionRequest.contextualStrings 에 힌트 전달
 *      → 도메인 단어("수유","분유" 등)가 우선 인식되도록 편향
 *   2. `normalize` 로 자주 발생하는 오인식("수육" → "수유" 등) 치환
 */

import type { FeedingRecordInput } from '@/domain/models/FeedingRecord';
import type { IVoiceParser } from './IVoiceParser';

/**
 * 자주 관측되는 오인식 → 정답 매핑.
 * - 키: 오인식된 결과 (정규식 가능)
 * - 값: 정답 단어
 *
 * 보수적으로 등록: 의미 충돌 가능성이 있는 일반 단어는 넣지 않는다.
 * 예) "수육" 은 음식이라 일상 발화에서 등장 가능 → 그래도 본 앱은 수유 기록 전용이라
 *     문맥상 항상 "수유" 의도로 해석해도 안전.
 */
const MISRECOGNITION_FIXES: ReadonlyArray<readonly [RegExp, string]> = [
  [/수육/g, '수유'],
  [/뷴유|문유/g, '분유'],
  [/뮤유/g, '모유'],
  // 방향 오탈자 — 다만 정답 단어("왼쪽","오른쪽")의 부분 문자열을 잡지 않도록
  // 명확히 잘못된 변형만 등록한다.
  [/외쪽|왼족/g, '왼쪽'],
  [/오른족|오른착/g, '오른쪽'],
  [/양족/g, '양쪽'],
  // 단위 통일 — "밀리리타"(오인식) 등을 ml 로.
  [/밀리리타|미리리터/g, 'ml'],
];

/** 도메인 어휘 — iOS Speech 의 contextualStrings 로 전달돼 인식 편향에 사용. */
const HINTS: readonly string[] = [
  '수유',
  '분유',
  '모유',
  '직수',
  '왼쪽',
  '오른쪽',
  '양쪽',
  '좌측',
  '우측',
  '양측',
  '분',
  '밀리리터',
];

export class KoreanVoiceParser implements IVoiceParser {
  readonly locale = 'ko-KR';
  readonly hints = HINTS;

  normalize(transcript: string): string {
    let text = transcript.trim();
    for (const [from, to] of MISRECOGNITION_FIXES) {
      text = text.replace(from, to);
    }
    return text;
  }

  parse(transcript: string): Partial<FeedingRecordInput> {
    const text = this.normalize(transcript);
    const out: Partial<FeedingRecordInput> = {};

    // 방향 (가장 먼저 매칭된 것 사용)
    if (/왼쪽|좌측/.test(text)) out.side = 'left';
    else if (/오른쪽|우측/.test(text)) out.side = 'right';
    else if (/양쪽|양측|둘\s*다/.test(text)) out.side = 'both';

    // 수유 타입 — "모유"/"직수" → breast. "분유" 는 기본값이므로 명시돼도 같은 결과.
    if (/모유|직수/.test(text)) out.feedingType = 'breast';
    else if (/분유/.test(text)) out.feedingType = 'formula';

    // 시간(duration) — "15분", "15 분" 등.
    const durationMatch = text.match(/(\d+)\s*분/);
    if (durationMatch?.[1]) {
      out.durationMinutes = parseInt(durationMatch[1], 10);
    }

    // 양 — ml / 밀리
    const amountMatch = text.match(/(\d+)\s*(?:ml|밀리)/i);
    if (amountMatch?.[1]) {
      out.amountMl = parseInt(amountMatch[1], 10);
    }

    return out;
  }
}
