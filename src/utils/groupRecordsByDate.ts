/**
 * 기록 배열을 날짜별 섹션으로 묶는 순수 함수.
 *
 * - 같은 로컬 날짜 (자정 기준) 의 기록은 동일 섹션
 * - 섹션은 최신 날짜가 먼저 (records 가 최신순이라는 전제 — 안전하게 정렬)
 * - 각 섹션 안의 data 도 최신 시각 우선
 *
 * 반환 shape 는 React Native `SectionList` 가 그대로 쓸 수 있도록 맞춤.
 */

import type { FeedingRecord } from '@/domain/models/FeedingRecord';

export type RecordSection = {
  /** 그 날짜 자정의 epoch ms — 키/정렬용. */
  dayStart: number;
  /** 'YYYY-MM-DD' (안정 키용). */
  key: string;
  data: FeedingRecord[];
};

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const formatKey = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const groupRecordsByDate = (records: readonly FeedingRecord[]): RecordSection[] => {
  const map = new Map<number, FeedingRecord[]>();
  for (const r of records) {
    const day = startOfDay(r.timestamp);
    const bucket = map.get(day);
    if (bucket) bucket.push(r);
    else map.set(day, [r]);
  }
  return Array.from(map.entries())
    .map(([dayStart, recs]) => ({
      dayStart,
      key: formatKey(dayStart),
      data: [...recs].sort((a, b) => b.timestamp - a.timestamp),
    }))
    .sort((a, b) => b.dayStart - a.dayStart);
};
