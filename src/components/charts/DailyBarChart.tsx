/**
 * 일별 수유 횟수 막대 차트.
 *
 * 의존성 없는 순수 RN View 구현. 막대 높이 비율로 max 대비 그림.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PeriodBucket } from '@/utils/aggregators';
import { colors, radius, shadows, spacing } from '@/theme';

export type DailyBarChartProps = {
  data: PeriodBucket[];
  /** y 축 기준 (count | totalMl | formulaMl | totalMinutes) */
  metric?: 'count' | 'totalMl' | 'formulaMl' | 'totalMinutes';
};

const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, metric = 'count' }) => {
  const max = Math.max(...data.map((d) => d[metric] ?? 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((d) => {
          const value = d[metric] ?? 0;
          const height = (value / max) * 130;
          return (
            <View key={d.label} style={styles.barColumn}>
              <View style={[styles.bar, { height }]} />
              <Text style={styles.label}>{d.label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    ...shadows.card,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 170,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 18,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs + 2,
  },
  value: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});

export default DailyBarChart;
