/**
 * 파생 데이터 셀렉터.
 * 컴포넌트에서 계산 로직을 빼내어 재사용성과 테스트 용이성을 확보.
 */

import type { FeedingSlice } from './feedingSlice';
import { currentWeekRange, isInRange } from '@/utils/dateHelpers';

export const selectAllRecords = (s: FeedingSlice) => s.records;

export const selectTodayRecords = (s: FeedingSlice) => s.records.filter((r) => r.isToday());

export const selectThisWeekRecords = (s: FeedingSlice) => {
  const range = currentWeekRange();
  return s.records.filter((r) => isInRange(r.timestamp, range));
};

export const selectHasRecords = (s: FeedingSlice) => s.records.length > 0;
