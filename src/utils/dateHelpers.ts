/**
 * 날짜 관련 순수 함수. date-fns 를 사용.
 * 모든 함수는 테스트 가능하게 `now` 를 주입받거나 외부 시간에 의존하지 않는다.
 */

import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

export const startOfToday = (now: number = Date.now()): number => startOfDay(now).getTime();
export const endOfToday = (now: number = Date.now()): number => endOfDay(now).getTime();

/** 최근 N 일의 [시작, 끝] 범위 배열. 오래된 날짜가 먼저 오도록 정렬. */
export const lastNDays = (
  n: number,
  now: number = Date.now(),
): Array<{ start: number; end: number }> => {
  const days: Array<{ start: number; end: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const base = subDays(now, i);
    days.push({ start: startOfDay(base).getTime(), end: endOfDay(base).getTime() });
  }
  return days;
};

/** 이번 주 [시작, 끝] (월요일 시작 기준). */
export const currentWeekRange = (now: number = Date.now()): { start: number; end: number } => ({
  start: startOfWeek(now, { weekStartsOn: 1 }).getTime(),
  end: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
});

/** 최근 N 주 [시작, 끝] 배열. 오래된 주가 먼저. 월요일 기준. */
export const lastNWeeks = (
  n: number,
  now: number = Date.now(),
): Array<{ start: number; end: number }> => {
  const weeks: Array<{ start: number; end: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const base = subWeeks(now, i);
    weeks.push({
      start: startOfWeek(base, { weekStartsOn: 1 }).getTime(),
      end: endOfWeek(base, { weekStartsOn: 1 }).getTime(),
    });
  }
  return weeks;
};

/** 최근 N 개월 [시작, 끝] 배열. 오래된 달이 먼저. */
export const lastNMonths = (
  n: number,
  now: number = Date.now(),
): Array<{ start: number; end: number }> => {
  const months: Array<{ start: number; end: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const base = subMonths(now, i);
    months.push({ start: startOfMonth(base).getTime(), end: endOfMonth(base).getTime() });
  }
  return months;
};

/** 주어진 타임스탬프가 특정 범위에 포함되는지. */
export const isInRange = (ts: number, range: { start: number; end: number }): boolean =>
  ts >= range.start && ts <= range.end;
