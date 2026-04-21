/**
 * 수유 기록 슬라이스.
 *
 * Repository 를 통한 영속성 읽기/쓰기를 감싸며, UI 가 구독할 상태를 제공.
 * UI 는 Repository 의 존재를 알 필요가 없이 이 스토어만 구독한다.
 */

import { StateCreator } from 'zustand';
import type { FeedingRecord, FeedingRecordInput } from '@/domain/models/FeedingRecord';
import type { IFeedingRepository } from '@/data/repositories/IFeedingRepository';
import { SaveFeedingRecordUseCase } from '@/domain/usecases/SaveFeedingRecord';

export type FeedingSlice = {
  records: FeedingRecord[];
  isLoading: boolean;
  error: string | null;

  /** 앱 시작 시 Repository 로부터 모든 기록을 로드. */
  hydrate: () => Promise<void>;

  /** 새 기록 저장 + 상태 갱신. 실패 시 error 상태 설정. */
  addRecord: (input: FeedingRecordInput) => Promise<FeedingRecord | null>;

  /** 기록 삭제. */
  deleteRecord: (id: string) => Promise<void>;

  /** 모든 기록 삭제 (테스트/리셋). */
  clearAll: () => Promise<void>;
};

/**
 * 슬라이스 생성자 — Repository 를 주입받는 high-order factory.
 * 테스트에서는 스텁 Repository 로 동일한 로직을 검증 가능.
 */
export const createFeedingSlice =
  (repo: IFeedingRepository): StateCreator<FeedingSlice> =>
  (set, get) => ({
    records: [],
    isLoading: false,
    error: null,

    hydrate: async () => {
      set({ isLoading: true, error: null });
      try {
        const records = await repo.getAll();
        set({ records, isLoading: false });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : 'hydrate failed', isLoading: false });
      }
    },

    addRecord: async (input) => {
      const usecase = new SaveFeedingRecordUseCase(repo);
      const result = await usecase.execute(input);

      if (!result.ok) {
        set({ error: result.error.message });
        return null;
      }

      // 최신순 유지를 위해 head 에 삽입
      set({ records: [result.value, ...get().records], error: null });
      return result.value;
    },

    deleteRecord: async (id) => {
      await repo.delete(id);
      set({ records: get().records.filter((r) => r.id !== id) });
    },

    clearAll: async () => {
      await repo.clear();
      set({ records: [] });
    },
  });
