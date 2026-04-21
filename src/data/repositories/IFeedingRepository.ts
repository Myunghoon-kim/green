/**
 * 수유 기록 저장소 인터페이스.
 *
 * 도메인/유스케이스가 의존하는 추상. 실제 구현(MMKV/서버)은 교체 가능.
 * 모든 메서드는 비동기 — 향후 네트워크 기반 구현 대비.
 */

import type { FeedingRecord } from '@/domain/models/FeedingRecord';

export type IFeedingRepository = {
  save(record: FeedingRecord): Promise<void>;
  getAll(): Promise<FeedingRecord[]>;
  getById(id: string): Promise<FeedingRecord | null>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
};
