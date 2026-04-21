/**
 * 통계 집계 결과를 반환하는 훅.
 * 기록 배열이 바뀔 때만 재계산 (useMemo) — 컴포넌트 리렌더 비용 최소화.
 */

import { useMemo } from 'react';
import { useFeedingStore } from '@/store';
import { aggregateByDay, averageIntervalMinutes } from '@/utils/aggregators';

export const useFeedingStats = (days: number = 7) => {
  const records = useFeedingStore((s) => s.records);

  return useMemo(
    () => ({
      dailyCounts: aggregateByDay(records, days),
      averageIntervalMinutes: averageIntervalMinutes(records),
      totalCount: records.length,
    }),
    [records, days],
  );
};
