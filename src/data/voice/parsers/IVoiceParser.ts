/**
 * 음성 텍스트 파서 인터페이스 (Strategy 패턴).
 *
 * 각 언어별 구현체는 이 인터페이스를 구현하고, VoiceParserFactory 가
 * 런타임에 로케일에 맞는 구현체를 반환한다.
 */

import type { FeedingRecordInput } from '@/domain/models/FeedingRecord';

export type IVoiceParser = {
  readonly locale: string;
  /**
   * 음성 전사 텍스트를 수유 기록 입력으로 변환.
   * 정보가 부족하면 부분 결과를 반환하고, 실패 대신 빈 객체라도 반환.
   * 원본 텍스트 보존(note)은 이 파서의 책임이 아니라 상위 유스케이스의 책임.
   */
  parse(transcript: string): Partial<FeedingRecordInput>;
};
