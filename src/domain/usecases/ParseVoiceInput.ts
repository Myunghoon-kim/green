/**
 * 음성 전사 텍스트 → 수유 기록 입력으로 파싱.
 *
 * 언어별 파싱은 Strategy 패턴으로 data 레이어의 VoiceParserFactory 에서 선택.
 * 이 유스케이스는 파서의 구체 언어를 모르며, 추상 인터페이스만 의존한다.
 */

import { SyncUseCase } from './BaseUseCase';
import type { FeedingRecordInput } from '../models/FeedingRecord';
import type { IVoiceParser } from '@/data/voice/parsers/IVoiceParser';

export type ParseVoiceInputInput = {
  transcript: string;
  parser: IVoiceParser;
};

/**
 * 파싱은 순수 동기 로직이므로 SyncUseCase 를 상속.
 * 실패 대신 최대한 부분 정보라도 반환 — note 에 원본 텍스트 보존.
 */
export class ParseVoiceInputUseCase extends SyncUseCase<
  ParseVoiceInputInput,
  FeedingRecordInput
> {
  execute({ transcript, parser }: ParseVoiceInputInput): FeedingRecordInput {
    const parsed = parser.parse(transcript);
    return {
      ...parsed,
      // note 는 보정된 텍스트로 저장 — 사용자가 기록 카드에서 봤을 때 원래 의도가
      // 드러나도록 ("수육 15분" 보다 "수유 15분" 이 의미가 분명).
      note: parser.normalize(transcript),
      source: 'voice',
    };
  }
}
