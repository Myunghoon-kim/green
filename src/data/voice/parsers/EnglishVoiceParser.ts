/**
 * 영어 음성 텍스트 파서.
 *
 * 인식 대상:
 *   - side: "left", "right", "both"
 *   - duration: "N min", "N minutes"
 *   - amount: "N ml", "Nml"
 *   - type: "formula", "breast"/"breastfeeding"/"nursing"
 */

import type { FeedingRecordInput } from '@/domain/models/FeedingRecord';
import type { IVoiceParser } from './IVoiceParser';
import { extractEnglishTime } from './timeParsing';

const MISRECOGNITION_FIXES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bmilliliter(s)?\b/gi, 'ml'],
  [/\bmilli\s*liters?\b/gi, 'ml'],
];

const HINTS: readonly string[] = [
  'feeding',
  'formula',
  'breast',
  'breastfeeding',
  'nursing',
  'left',
  'right',
  'both',
  'minutes',
  'ml',
  // time expressions
  'am',
  'pm',
  'minutes ago',
  'hours ago',
  'just now',
];

export class EnglishVoiceParser implements IVoiceParser {
  readonly locale = 'en-US';
  readonly hints = HINTS;

  normalize(transcript: string): string {
    let text = transcript.trim();
    for (const [from, to] of MISRECOGNITION_FIXES) {
      text = text.replace(from, to);
    }
    return text;
  }

  parse(transcript: string): Partial<FeedingRecordInput> {
    const normalized = this.normalize(transcript).toLowerCase();
    const out: Partial<FeedingRecordInput> = {};

    const { timestamp, residual } = extractEnglishTime(normalized);
    if (timestamp !== undefined) out.timestamp = timestamp;

    const text = residual;

    if (/\bleft\b/.test(text)) out.side = 'left';
    else if (/\bright\b/.test(text)) out.side = 'right';
    else if (/\bboth\b/.test(text)) out.side = 'both';

    if (/\b(?:breast|nursing|breastfeed(?:ing)?)\b/.test(text)) out.feedingType = 'breast';
    else if (/\bformula\b/.test(text)) out.feedingType = 'formula';

    const durationMatch = text.match(/(\d+)\s*(?:min|minutes?|mins)\b/);
    if (durationMatch?.[1]) {
      out.durationMinutes = parseInt(durationMatch[1], 10);
    }

    const amountMatch = text.match(/(\d+)\s*ml\b/);
    if (amountMatch?.[1]) {
      out.amountMl = parseInt(amountMatch[1], 10);
    }

    return out;
  }
}
