/**
 * 한국어 음성 텍스트 파서.
 *
 * 인식 대상:
 *   - 방향: "왼쪽", "오른쪽", "양쪽"
 *   - 시간: "N분", "N 분"
 *   - 양:   "Nml", "N ml", "N밀리", "N 밀리리터"
 *   - 수유타입: "분유", "모유" (미지정 시 상위 default = formula)
 *
 * 규칙 기반(정규식). 추후 n-gram/ML 기반으로 확장 가능.
 */

import type { FeedingRecordInput } from '@/domain/models/FeedingRecord';
import type { IVoiceParser } from './IVoiceParser';

export class KoreanVoiceParser implements IVoiceParser {
  readonly locale = 'ko-KR';

  parse(transcript: string): Partial<FeedingRecordInput> {
    const text = transcript.trim();
    const out: Partial<FeedingRecordInput> = {};

    // 방향 (가장 먼저 매칭된 것 사용)
    if (/왼쪽|좌측/.test(text)) out.side = 'left';
    else if (/오른쪽|우측/.test(text)) out.side = 'right';
    else if (/양쪽|양측|둘\s*다/.test(text)) out.side = 'both';

    // 수유 타입 — "모유"/"직수" → breast. "분유" 는 기본값이므로 명시돼도 같은 결과.
    if (/모유|직수/.test(text)) out.feedingType = 'breast';
    else if (/분유/.test(text)) out.feedingType = 'formula';

    // 시간 — "15분", "15 분" 등. 'ml/밀리' 바로 앞이면 양으로 해석되므로 분과 구분.
    const durationMatch = text.match(/(\d+)\s*분/);
    if (durationMatch?.[1]) {
      out.durationMinutes = parseInt(durationMatch[1], 10);
    }

    // 양 — ml / 밀리
    const amountMatch = text.match(/(\d+)\s*(?:ml|밀리리터|밀리|미리)/i);
    if (amountMatch?.[1]) {
      out.amountMl = parseInt(amountMatch[1], 10);
    }

    return out;
  }
}
