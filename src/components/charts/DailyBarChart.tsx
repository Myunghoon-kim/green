/**
 * 일별 수유 횟수 막대 차트.
 *
 * NOTE: victory-native v41 은 Skia 기반으로 API 가 다릅니다.
 * 실제 빌드 환경에서 `victory-native` API 를 확인한 뒤 props 를 맞추세요.
 * 이 컴포넌트는 시그니처만 고정하여 상위 레이어가 먼저 개발될 수 있도록 합니다.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DailyCount } from '@/utils/aggregators';

export type DailyBarChartProps = {
  data: DailyCount[];
  /** y 축 기준 (count | totalMl | totalMinutes) */
  metric?: 'count' | 'totalMl' | 'totalMinutes';
};

const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, metric = 'count' }) => {
  const max = Math.max(...data.map((d) => d[metric] ?? 0), 1);

  // victory-native 연동 전 임시 구현 — 막대를 순수 RN View 로 표현.
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((d) => {
          const value = d[metric] ?? 0;
          const height = (value / max) * 120;
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
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  value: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default DailyBarChart;
