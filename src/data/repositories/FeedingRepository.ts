/**
 * IFeedingRepository 의 IStorage 기반 구현체.
 *
 * 한 기록당 하나의 키(FEEDING_KEY_PREFIX + id)로 저장.
 * 전체 목록은 `keys()` 에서 prefix 로 필터링하여 조회.
 *
 * 장점: 개별 저장/삭제가 O(1). 전체 조회는 O(N) (N = 기록 수).
 * 수유 기록 수가 수만을 넘어가면 인덱스 테이블을 별도로 두는 최적화를 검토.
 */

import { FeedingRecord } from '@/domain/models/FeedingRecord';
import type { IStorage } from '../storage/IStorage';
import type { IFeedingRepository } from './IFeedingRepository';

const FEEDING_KEY_PREFIX = 'feeding:';

export class FeedingRepository implements IFeedingRepository {
  constructor(private readonly storage: IStorage) {}

  private keyOf(id: string): string {
    return `${FEEDING_KEY_PREFIX}${id}`;
  }

  async save(record: FeedingRecord): Promise<void> {
    this.storage.set(this.keyOf(record.id), JSON.stringify(record.toJSON()));
  }

  async getAll(): Promise<FeedingRecord[]> {
    const keys = this.storage.keys().filter((k) => k.startsWith(FEEDING_KEY_PREFIX));

    const records: FeedingRecord[] = [];
    for (const key of keys) {
      const raw = this.storage.get(key);
      if (!raw) continue;
      try {
        records.push(FeedingRecord.fromJSON(JSON.parse(raw)));
      } catch (e) {
        // 깨진 레코드는 로그만 남기고 스킵 — 앱이 먹통이 되지 않도록.
        // 개발 환경에서는 콘솔로 확인 가능하게.
        if (__DEV__) console.warn(`[FeedingRepository] dropped invalid record at ${key}`, e);
      }
    }

    // 최신순 정렬 — UI 에서 대부분 최신순으로 표시하므로 이곳에서 정렬.
    records.sort((a, b) => b.timestamp - a.timestamp);
    return records;
  }

  async getById(id: string): Promise<FeedingRecord | null> {
    const raw = this.storage.get(this.keyOf(id));
    if (!raw) return null;
    try {
      return FeedingRecord.fromJSON(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(this.keyOf(id));
  }

  async clear(): Promise<void> {
    const keys = this.storage.keys().filter((k) => k.startsWith(FEEDING_KEY_PREFIX));
    for (const key of keys) this.storage.delete(key);
  }
}

// __DEV__ 타입 선언 (React Native 런타임 제공)
declare const __DEV__: boolean;
