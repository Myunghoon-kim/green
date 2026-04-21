import { createStore } from 'zustand/vanilla';
import { createFeedingSlice } from './feedingSlice';
import { FeedingRepository } from '@/data/repositories/FeedingRepository';
import { InMemoryStorage } from '@/data/storage/InMemoryStorage';

// __DEV__ (repository 내부 경고에서 참조)
(global as unknown as { __DEV__: boolean }).__DEV__ = false;

describe('feedingSlice', () => {
  const makeSut = () => {
    const storage = new InMemoryStorage();
    const repo = new FeedingRepository(storage);
    const store = createStore(createFeedingSlice(repo));
    return { store, repo };
  };

  it('초기 상태는 빈 배열, 로딩 false, error null', () => {
    const { store } = makeSut();
    const s = store.getState();
    expect(s.records).toEqual([]);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('addRecord 성공 시 records 가 head 에 삽입된다', async () => {
    const { store } = makeSut();
    const added = await store.getState().addRecord({ side: 'left', durationMinutes: 10 });
    expect(added).not.toBeNull();
    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().records[0]!.side).toBe('left');
  });

  it('addRecord 실패 시 error 가 설정되고 records 는 변하지 않는다', async () => {
    const { store } = makeSut();
    const result = await store.getState().addRecord({ durationMinutes: -1 });
    expect(result).toBeNull();
    expect(store.getState().error).not.toBeNull();
    expect(store.getState().records).toHaveLength(0);
  });

  it('hydrate 는 repository 의 모든 기록을 로드한다', async () => {
    const { store, repo } = makeSut();
    // 직접 repository 에 저장 (스토어 bypass)
    const { FeedingRecord } = await import('@/domain/models/FeedingRecord');
    await repo.save(new FeedingRecord({ id: 'x', timestamp: 1 }));

    await store.getState().hydrate();

    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().records[0]!.id).toBe('x');
    expect(store.getState().isLoading).toBe(false);
  });

  it('deleteRecord 는 지정 id 만 제거한다', async () => {
    const { store } = makeSut();
    const a = await store.getState().addRecord({ side: 'left' });
    const b = await store.getState().addRecord({ side: 'right' });
    expect(a && b).toBeTruthy();

    await store.getState().deleteRecord(a!.id);

    expect(store.getState().records.map((r) => r.id)).toEqual([b!.id]);
  });

  it('clearAll 은 모든 기록을 삭제한다', async () => {
    const { store } = makeSut();
    await store.getState().addRecord({ side: 'left' });
    await store.getState().addRecord({ side: 'right' });

    await store.getState().clearAll();

    expect(store.getState().records).toEqual([]);
  });
});
