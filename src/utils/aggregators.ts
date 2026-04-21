/**
 * 수유 기록 집계 순수 함수.
 *
 * 순수함수로 유지하여 UI/훅 없이 단위 테스트 가능.
 * UI (차트) 는 이 결과를 그대로 넘겨주기만 한다.
 */

import type { FeedingRecord } from '@/domain/models/FeedingRecord';
import { lastNDays, isInRange } from './dateHelpers';

export type DailyCount = {
  label: string; // 'MM/DD' 형식
  count: number;
  totalMl: number;
  totalMinutes: number;
};

/**
 * 최근 N 일 일별 집계.
 * 반환 배열 순서는 오래된 날짜 → 오늘 (차트 x축에 그대로 쓰기 좋게).
 */
export const aggregateByDay = (
  records: readonly FeedingRecord[],
  n: number = 7,
  now: number = Date.now(),
): DailyCount[] => {
  const ranges = lastNDays(n, now);

  return ranges.map(({ start, end }) => {
    const dayRecords = records.filter((r) => isInRange(r.timestamp, { start, end }));
    const d = new Date(start);
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: dayRecords.length,
      totalMl: dayRecords.reduce((sum, r) => sum + (r.amountMl ?? 0), 0),
      totalMinutes: dayRecords.reduce((sum, r) => sum + (r.durationMinutes ?? 0), 0),
    };
  });
};

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
