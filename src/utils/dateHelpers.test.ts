import { lastNDays, isInRange, currentWeekRange } from './dateHelpers';

describe('dateHelpers', () => {
  const fixedNow = new Date('2026-04-21T12:00:00Z').getTime(); // 화요일

  describe('lastNDays', () => {
    it('요청한 개수만큼 범위를 반환한다', () => {
      expect(lastNDays(7, fixedNow)).toHaveLength(7);
    });

    it('가장 오래된 날짜가 첫 요소, 오늘이 마지막 요소이다', () => {
      const days = lastNDays(3, fixedNow);
      expect(days[0]!.start).toBeLessThan(days[2]!.start);
    });

    it('각 범위의 end 는 start 보다 크다', () => {
      for (const range of lastNDays(5, fixedNow)) {
        expect(range.end).toBeGreaterThan(range.start);
      }
    });
  });

  describe('currentWeekRange', () => {
    it('start 가 월요일이다', () => {
      const { start } = currentWeekRange(fixedNow);
      expect(new Date(start).getDay()).toBe(1); // 1 = Monday
    });
  });

  describe('isInRange', () => {
    const range = { start: 100, end: 200 };

    it('경계값을 포함한다', () => {
      expect(isInRange(100, range)).toBe(true);
      expect(isInRange(200, range)).toBe(true);
    });

    it('범위 밖은 false', () => {
      expect(isInRange(99, range)).toBe(false);
      expect(isInRange(201, range)).toBe(false);
    });
  });
});
