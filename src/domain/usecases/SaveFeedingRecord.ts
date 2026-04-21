/**
 * 수유 기록 저장 유스케이스.
 *
 * Repository 인터페이스에만 의존 (DIP). 실제 저장 방식(MMKV/서버) 는
 * 구현체 결정이며 이 유스케이스는 알 필요가 없다.
 */

import { BaseUseCase, Result } from './BaseUseCase';
import { FeedingRecord, FeedingRecordInput } from '../models/FeedingRecord';
import type { IFeedingRepository } from '@/data/repositories/IFeedingRepository';

export type SaveFeedingRecordInput = FeedingRecordInput;
export type SaveFeedingRecordOutput = Result<FeedingRecord>;

export class SaveFeedingRecordUseCase extends BaseUseCase<
  SaveFeedingRecordInput,
  SaveFeedingRecordOutput
> {
  constructor(private readonly repo: IFeedingRepository) {
    super();
  }

  async execute(input: SaveFeedingRecordInput): Promise<SaveFeedingRecordOutput> {
    try {
      // 도메인 모델 생성 단계에서 검증(invariant)도 함께 수행됨.
      const record = new FeedingRecord(input);
      await this.repo.save(record);
      return { ok: true, value: record };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
}
