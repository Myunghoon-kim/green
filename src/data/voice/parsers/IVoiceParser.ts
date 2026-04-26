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
   * 음성 인식 엔진(iOS SFSpeechRecognitionRequest.contextualStrings)에 전달할
   * 도메인 어휘 힌트. 자주 발화되는 단어를 힌트로 주면 동음이의/유사 발음
   * 단어 (예: "수유" vs "수육") 의 인식 정확도가 향상된다.
   */
  readonly hints: readonly string[];
  /**
   * 음성 전사 텍스트를 수유 기록 입력으로 변환.
   * 정보가 부족하면 부분 결과를 반환하고, 실패 대신 빈 객체라도 반환.
   * 원본 텍스트 보존(note)은 이 파서의 책임이 아니라 상위 유스케이스의 책임.
   *
   * 구현체는 내부에서 normalize 후 매칭한다 — 호출자는 raw transcript 그대로 전달.
   */
  parse(transcript: string): Partial<FeedingRecordInput>;
  /**
   * 알려진 오인식을 보정한 정규화 텍스트를 반환.
   * UI 에 보정된 텍스트를 표시하거나 디버그할 때 사용.
   */
  normalize(transcript: string): string;
};
