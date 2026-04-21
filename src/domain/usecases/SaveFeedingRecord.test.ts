import { SaveFeedingRecordUseCase } from './SaveFeedingRecord';
import { FeedingRecord } from '../models/FeedingRecord';
import type { IFeedingRepository } from '@/data/repositories/IFeedingRepository';

// 테스트용 스텁 Repository — DIP 덕분에 실제 MMKV 없이 유스케이스 테스트 가능.
const createStubRepo = (): IFeedingRepository & { saved: FeedingRecord[] } => {
  const saved: FeedingRecord[] = [];
  return {
    saved,
    save: async (r) => {
      saved.push(r);
    },
    getAll: async () => [...saved],
    getById: async (id) => saved.find((r) => r.id === id) ?? null,
    delete: async (id) => {
      const idx = saved.findIndex((r) => r.id === id);
      if (idx >= 0) saved.splice(idx, 1);
    },
    clear: async () => {
      saved.length = 0;
    },
  };
};

describe('SaveFeedingRecordUseCase', () => {
  it('유효한 입력을 저장하고 Result.ok 를 반환한다', async () => {
    const repo = createStubRepo();
    const usecase = new SaveFeedingRecordUseCase(repo);

    const result = await usecase.execute({ side: 'left', durationMinutes: 15, source: 'voice' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.side).toBe('left');
      expect(result.value.durationMinutes).toBe(15);
    }
    expect(repo.saved).toHaveLength(1);
  });

  it('유효하지 않은 입력(음수 duration)은 Result.ok=false 로 실패를 반환한다', async () => {
    const repo = createStubRepo();
    const usecase = new SaveFeedingRecordUseCase(repo);

    const result = await usecase.execute({ durationMinutes: -5 });

    expect(result.ok).toBe(false);
    expect(repo.saved).toHaveLength(0);
  });

  it('repo.save 실패 시 실패 Result 로 래핑한다', async () => {
    const repo = createStubRepo();
    repo.save = async () => {
      throw new Error('disk full');
    };
    const usecase = new SaveFeedingRecordUseCase(repo);

    const result = await usecase.execute({});

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('disk full');
  });
});
