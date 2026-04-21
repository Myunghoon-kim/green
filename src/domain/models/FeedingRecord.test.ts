import { FeedingRecord } from './FeedingRecord';

describe('FeedingRecord', () => {
  describe('생성자 / 기본값', () => {
    it('id 가 주어지지 않으면 UUID 를 생성한다', () => {
      const r = new FeedingRecord({});
      expect(r.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('timestamp 가 주어지지 않으면 현재 시각을 사용한다', () => {
      const before = Date.now();
      const r = new FeedingRecord({});
      const after = Date.now();
      expect(r.timestamp).toBeGreaterThanOrEqual(before);
      expect(r.timestamp).toBeLessThanOrEqual(after);
    });

    it('source 기본값은 manual 이다', () => {
      const r = new FeedingRecord({});
      expect(r.source).toBe('manual');
    });
  });

  describe('검증 (invariant)', () => {
    it('durationMinutes 가 음수이면 예외를 던진다', () => {
      expect(() => new FeedingRecord({ durationMinutes: -1 })).toThrow();
    });

    it('amountMl 이 음수이면 예외를 던진다', () => {
      expect(() => new FeedingRecord({ amountMl: -10 })).toThrow();
    });

    it('timestamp 가 음수이면 예외를 던진다', () => {
      expect(() => new FeedingRecord({ timestamp: -1 })).toThrow();
    });
  });

  describe('isToday', () => {
    it('오늘 생성된 기록이면 true 를 반환한다', () => {
      const r = new FeedingRecord({ timestamp: Date.now() });
      expect(r.isToday()).toBe(true);
    });

    it('어제 생성된 기록이면 false 를 반환한다', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const r = new FeedingRecord({ timestamp: yesterday });
      // 자정 근처 플래키 방지: 기준시간을 오늘 정오로 고정.
      const todayNoon = new Date();
      todayNoon.setHours(12, 0, 0, 0);
      expect(r.isToday(todayNoon.getTime())).toBe(false);
    });
  });

  describe('copyWith', () => {
    it('지정한 필드만 덮어쓴 새 인스턴스를 반환한다', () => {
      const r = new FeedingRecord({ side: 'left', durationMinutes: 10 });
      const updated = r.copyWith({ durationMinutes: 15 });
      expect(updated.side).toBe('left');
      expect(updated.durationMinutes).toBe(15);
      expect(updated.id).toBe(r.id);
      // 원본은 불변
      expect(r.durationMinutes).toBe(10);
    });
  });

  describe('toJSON / fromJSON', () => {
    it('직렬화 → 역직렬화 후 동등한 데이터를 유지한다', () => {
      const original = new FeedingRecord({
        side: 'both',
        durationMinutes: 20,
        amountMl: 80,
        note: '분유 80ml',
        source: 'voice',
      });
      const json = JSON.parse(JSON.stringify(original));
      const restored = FeedingRecord.fromJSON(json);
      expect(restored.toJSON()).toEqual(original.toJSON());
    });

    it('undefined 필드는 JSON 에 포함되지 않는다', () => {
      const r = new FeedingRecord({ id: 'x', timestamp: 0, source: 'manual' });
      const json = r.toJSON();
      expect(json).not.toHaveProperty('durationMinutes');
      expect(json).not.toHaveProperty('side');
    });

    it('잘못된 형태는 fromJSON 에서 예외를 던진다', () => {
      expect(() => FeedingRecord.fromJSON(null)).toThrow();
      expect(() => FeedingRecord.fromJSON({})).toThrow();
      expect(() => FeedingRecord.fromJSON({ id: 'x' })).toThrow();
      expect(() => FeedingRecord.fromJSON({ id: 'x', timestamp: 0, source: 'bad' })).toThrow();
    });
  });
});
