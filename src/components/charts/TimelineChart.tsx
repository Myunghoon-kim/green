/**
 * 일별 수유 시각 타임라인.
 *
 * 최근 N 일(기본 7) 을 행 단위로 쌓고, 각 수유 기록을 해당 일의 시-분 위치에
 * 점으로 표시. 색은 분유/모유 구분.
 *
 * 의존성 없는 순수 React Native View 구현 (가로 0~24h 비율 배치).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import type { FeedingRecord } from '@/domain/models/FeedingRecord';

export type TimelineChartProps = {
  records: readonly FeedingRecord[];
  /** 표시할 일수 (오래된 → 오늘). 기본 7. */
  days?: number;
  /** 라벨 표시 여부. */
  showHourLabels?: boolean;
};

const HOUR_LABELS = [0, 6, 12, 18, 24];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const TimelineChart: React.FC<TimelineChartProps> = ({
  records,
  days = 7,
  showHourLabels = true,
}) => {
  const todayStart = startOfDay(Date.now());
  // 오래된 → 오늘 순으로 행 생성.
  const rows = Array.from({ length: days }, (_, i) => {
    const dayStart = todayStart - (days - 1 - i) * MS_PER_DAY;
    const dayEnd = dayStart + MS_PER_DAY;
    const dayRecords = records.filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd);
    return { dayStart, dayRecords };
  });

  return (
    <View style={styles.container}>
      {showHourLabels && (
        <View style={styles.hoursRow}>
          <View style={styles.dayLabelSpacer} />
          <View style={styles.hoursAxis}>
            {HOUR_LABELS.map((h) => (
              <Text
                key={h}
                style={[styles.hourLabel, { left: `${(h / 24) * 100}%` }]}
              >
                {h}
              </Text>
            ))}
          </View>
        </View>
      )}

      {rows.map(({ dayStart, dayRecords }) => (
        <View key={dayStart} style={styles.row}>
          <Text style={styles.dayLabel}>{format(new Date(dayStart), 'MM/dd')}</Text>
          <View style={styles.lane}>
            {/* 6/12/18시 그리드 라인 */}
            {[6, 12, 18].map((h) => (
              <View
                key={h}
                style={[styles.gridLine, { left: `${(h / 24) * 100}%` }]}
              />
            ))}
            {dayRecords.map((r) => {
              const offsetMs = r.timestamp - dayStart;
              const ratio = Math.max(0, Math.min(1, offsetMs / MS_PER_DAY));
              const dotStyle =
                r.feedingType === 'breast' ? styles.dotBreast : styles.dotFormula;
              return (
                <View
                  key={r.id}
                  style={[styles.dotBase, dotStyle, { left: `${ratio * 100}%` }]}
                />
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotFormula]} />
          <Text style={styles.legendText}>분유</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.dotBreast]} />
          <Text style={styles.legendText}>모유</Text>
        </View>
      </View>
    </View>
  );
};

const DAY_LABEL_WIDTH = 44;
const ROW_HEIGHT = 22;
const DOT_SIZE = 8;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    marginBottom: 4,
  },
  dayLabelSpacer: {
    width: DAY_LABEL_WIDTH,
  },
  hoursAxis: {
    flex: 1,
    height: 16,
    position: 'relative',
  },
  hourLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 10,
    color: '#999',
    transform: [{ translateX: -4 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
  },
  dayLabel: {
    width: DAY_LABEL_WIDTH,
    fontSize: 11,
    color: '#666',
  },
  lane: {
    flex: 1,
    height: ROW_HEIGHT,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  dotBase: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    top: (ROW_HEIGHT - DOT_SIZE) / 2,
    transform: [{ translateX: -DOT_SIZE / 2 }],
  },
  dotFormula: {
    backgroundColor: '#2E7D32',
  },
  dotBreast: {
    backgroundColor: '#AD1457',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingLeft: DAY_LABEL_WIDTH,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});

export default TimelineChart;
