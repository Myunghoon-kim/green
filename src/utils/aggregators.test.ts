import { aggregateByDay, averageIntervalMinutes } from './aggregators';
import { FeedingRecord } from '@/domain/models/FeedingRecord';

describe('aggregators', () => {
  const now = new Date('2026-04-21T12:00:00Z').getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  describe('aggregateByDay', () => {
    it('요청한 N 일 수 만큼 버킷을 반환한다', () => {
      const result = aggregateByDay([], 7, now);
      expect(result).toHaveLength(7);
    });

    it('각 버킷의 count 를 정확히 집계한다', () => {
      const records = [
        new FeedingRecord({ timestamp: now, amountMl: 100 }),
        new FeedingRecord({ timestamp: now - 1000, amountMl: 80 }),
        new FeedingRecord({ timestamp: now - oneDayMs, amountMl: 60 }),
      ];

      const result = aggregateByDay(records, 7, now);
      const today = result[result.length - 1];
      const yesterday = result[result.length - 2];

      expect(today?.count).toBe(2);
      expect(today?.totalMl).toBe(180);
      expect(yesterday?.count).toBe(1);
      expect(yesterday?.totalMl).toBe(60);
    });

    it('기록이 없으면 모든 버킷이 0', () => {
      const result = aggregateByDay([], 3, now);
      expect(result.every((r) => r.count === 0)).toBe(true);
    });
  });

  describe('averageIntervalMinutes', () => {
    it('기록이 0개면 null', () => {
      expect(averageIntervalMinutes([])).toBeNull();
    });

    it('기록이 1개여도 null', () => {
      expect(averageIntervalMinutes([new FeedingRecord({})])).toBeNull();
    });

    it('기록이 여러 개면 평균 간격(분)을 반환한다', () => {
      // 10분 간격으로 3개 → 평균 10분
      const base = now;
      const records = [
        new FeedingRecord({ timestamp: base }),
        new FeedingRecord({ timestamp: base + 10 * 60 * 1000 }),
        new FeedingRecord({ timestamp: base + 20 * 60 * 1000 }),
      ];
      expect(averageIntervalMinutes(records)).toBe(10);
    });
  });
});
