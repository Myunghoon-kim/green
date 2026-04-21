import { FeedingRepository } from './FeedingRepository';
import { FeedingRecord } from '@/domain/models/FeedingRecord';
import { InMemoryStorage } from '../storage/InMemoryStorage';

// Jest 에서 __DEV__ 플래그 정의
(global as unknown as { __DEV__: boolean }).__DEV__ = false;

describe('FeedingRepository', () => {
  const makeSut = () => {
    const storage = new InMemoryStorage();
    const repo = new FeedingRepository(storage);
    return { storage, repo };
  };

  describe('save / getById', () => {
    it('저장한 기록을 id 로 다시 읽을 수 있다', async () => {
      const { repo } = makeSut();
      const record = new FeedingRecord({ id: 'r1', timestamp: 1000, side: 'left' });

      await repo.save(record);
      const got = await repo.getById('r1');

      expect(got?.id).toBe('r1');
      expect(got?.side).toBe('left');
    });

    it('없는 id 는 null 을 반환한다', async () => {
      const { repo } = makeSut();
      expect(await repo.getById('none')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('모든 기록을 timestamp 최신순으로 반환한다', async () => {
      const { repo } = makeSut();
      await repo.save(new FeedingRecord({ id: 'a', timestamp: 100 }));
      await repo.save(new FeedingRecord({ id: 'b', timestamp: 300 }));
      await repo.save(new FeedingRecord({ id: 'c', timestamp: 200 }));

      const all = await repo.getAll();

      expect(all.map((r) => r.id)).toEqual(['b', 'c', 'a']);
    });

    it('feeding: 접두사가 없는 키는 무시한다', async () => {
      const { storage, repo } = makeSut();
      storage.set('other:x', 'unrelated');
      await repo.save(new FeedingRecord({ id: 'a', timestamp: 1 }));

      const all = await repo.getAll();

      expect(all).toHaveLength(1);
    });

    it('깨진 JSON 레코드는 스킵하고 나머지는 정상 반환한다', async () => {
      const { storage, repo } = makeSut();
      await repo.save(new FeedingRecord({ id: 'a', timestamp: 1 }));
      storage.set('feeding:broken', 'not-json');

      const all = await repo.getAll();

      expect(all.map((r) => r.id)).toEqual(['a']);
    });
  });

  describe('delete', () => {
    it('지정 id 만 삭제한다', async () => {
      const { repo } = makeSut();
      await repo.save(new FeedingRecord({ id: 'a', timestamp: 1 }));
      await repo.save(new FeedingRecord({ id: 'b', timestamp: 2 }));

      await repo.delete('a');

      expect(await repo.getById('a')).toBeNull();
      expect(await repo.getById('b')).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('feeding 관련 데이터만 전부 삭제한다 (다른 키는 보존)', async () => {
      const { storage, repo } = makeSut();
      await repo.save(new FeedingRecord({ id: 'a', timestamp: 1 }));
      storage.set('settings:theme', 'dark');

      await repo.clear();

      expect(await repo.getAll()).toEqual([]);
      expect(storage.get('settings:theme')).toBe('dark');
    });
  });
});
