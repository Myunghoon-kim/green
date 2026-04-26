/**
 * 수유 기록 집계 순수 함수.
 *
 * 순수함수로 유지하여 UI/훅 없이 단위 테스트 가능.
 * UI (차트) 는 이 결과를 그대로 넘겨주기만 한다.
 */

import type { FeedingRecord } from '@/domain/models/FeedingRecord';
import { lastNDays, lastNWeeks, lastNMonths, isInRange } from './dateHelpers';

/** 차트/카드에 그릴 구간 단위 집계 결과. period 에 관계없이 동일 shape. */
export type PeriodBucket = {
  label: string;
  count: number;
  /** 해당 구간 총 수유량(ml) — 모든 타입 합산. */
  totalMl: number;
  /** 분유 수유량(ml) 합. breast 는 제외. */
  formulaMl: number;
  totalMinutes: number;
};

// DailyCount 는 기존 호출부 호환용 alias.
export type DailyCount = PeriodBucket;

const bucketize = (
  records: readonly FeedingRecord[],
  range: { start: number; end: number },
  label: string,
): PeriodBucket => {
  const rs = records.filter((r) => isInRange(r.timestamp, range));
  return {
    label,
    count: rs.length,
    totalMl: rs.reduce((s, r) => s + (r.amountMl ?? 0), 0),
    formulaMl: rs
      .filter((r) => r.feedingType === 'formula')
      .reduce((s, r) => s + (r.amountMl ?? 0), 0),
    totalMinutes: rs.reduce((s, r) => s + (r.durationMinutes ?? 0), 0),
  };
};

/**
 * 최근 N 일 일별 집계.
 * 반환 배열 순서는 오래된 날짜 → 오늘 (차트 x축에 그대로 쓰기 좋게).
 */
export const aggregateByDay = (
  records: readonly FeedingRecord[],
  n: number = 7,
  now: number = Date.now(),
): PeriodBucket[] =>
  lastNDays(n, now).map((range) => {
    const d = new Date(range.start);
    return bucketize(records, range, `${d.getMonth() + 1}/${d.getDate()}`);
  });

/** 최근 N 주 집계. 라벨은 'MM/DD' (해당 주 시작일). */
export const aggregateByWeek = (
  records: readonly FeedingRecord[],
  n: number = 8,
  now: number = Date.now(),
): PeriodBucket[] =>
  lastNWeeks(n, now).map((range) => {
    const d = new Date(range.start);
    return bucketize(records, range, `${d.getMonth() + 1}/${d.getDate()}`);
  });

/** 최근 N 개월 집계. 라벨은 'YY/MM'. */
export const aggregateByMonth = (
  records: readonly FeedingRecord[],
  n: number = 6,
  now: number = Date.now(),
): PeriodBucket[] =>
  lastNMonths(n, now).map((range) => {
    const d = new Date(range.start);
    return bucketize(
      records,
      range,
      `${String(d.getFullYear()).slice(2)}/${String(d.getMonth() + 1).padStart(2, '0')}`,
    );
  });

/**
 * 평균 수유 간격 (분).
 * 기록이 2개 미만이면 null — 간격을 정의할 수 없음.
 */
export const averageIntervalMinutes = (records: readonly FeedingRecord[]): number | null => {
  if (records.length < 2) return null;

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i]!.timestamp - sorted[i - 1]!.timestamp);
  }
  const avgMs = intervals.reduce((s, x) => s + x, 0) / intervals.length;
  return Math.round(avgMs / (60 * 1000));
};
