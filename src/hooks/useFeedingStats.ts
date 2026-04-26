/**
 * 통계 집계 결과를 반환하는 훅.
 * period 에 따라 일/주/월 단위로 버킷을 만든다.
 * 기록 배열이 바뀔 때만 재계산 (useMemo) — 컴포넌트 리렌더 비용 최소화.
 */

import { useMemo } from 'react';
import { useFeedingStore } from '@/store';
import {
  aggregateByDay,
  aggregateByWeek,
  aggregateByMonth,
  averageIntervalMinutes,
  type PeriodBucket,
} from '@/utils/aggregators';

export type StatsPeriod = 'day' | 'week' | 'month';

/** 기간별 기본 버킷 수 (일 7개 / 주 8개 / 월 6개). */
const DEFAULT_BUCKETS: Record<StatsPeriod, number> = {
  day: 7,
  week: 8,
  month: 6,
};

export type UseFeedingStatsReturn = {
  buckets: PeriodBucket[];
  averageIntervalMinutes: number | null;
  totalCount: number;
  /** 표시 기간 내 총 분유량(ml). */
  totalFormulaMl: number;
  /** 표시 기간 내 총 수유 시간(분). */
  totalMinutes: number;
};

export const useFeedingStats = (
  period: StatsPeriod = 'day',
  count?: number,
): UseFeedingStatsReturn => {
  const records = useFeedingStore((s) => s.records);

  return useMemo(() => {
    const n = count ?? DEFAULT_BUCKETS[period];
    const buckets =
      period === 'day'
        ? aggregateByDay(records, n)
        : period === 'week'
          ? aggregateByWeek(records, n)
          : aggregateByMonth(records, n);

    return {
      buckets,
      averageIntervalMinutes: averageIntervalMinutes(records),
      totalCount: records.length,
      totalFormulaMl: buckets.reduce((s, b) => s + b.formulaMl, 0),
      totalMinutes: buckets.reduce((s, b) => s + b.totalMinutes, 0),
    };
  }, [records, period, count]);
};
