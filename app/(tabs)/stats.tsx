/**
 * 통계 화면.
 * - 기간 선택: 일(7일) / 주(8주) / 월(6개월)
 * - 메트릭 선택: 횟수 / 수유 시간(분) / 분유량(ml)
 * - 요약 카드: 총 횟수, 평균 간격, 총 분유량, 총 시간
 */

import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import DailyBarChart from '@/components/charts/DailyBarChart';
import { useFeedingStats, type StatsPeriod } from '@/hooks/useFeedingStats';

type Metric = 'count' | 'totalMinutes' | 'formulaMl';

const PERIODS: StatsPeriod[] = ['day', 'week', 'month'];
const METRICS: Metric[] = ['count', 'totalMinutes', 'formulaMl'];

export default function StatsScreen() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatsPeriod>('day');
  const [metric, setMetric] = useState<Metric>('count');

  const { buckets, averageIntervalMinutes, totalCount, totalFormulaMl, totalMinutes } =
    useFeedingStats(period);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('stats.title')}</Text>

        <SegmentedControl
          values={PERIODS}
          selected={period}
          onChange={setPeriod}
          labelFor={(p) => t(`stats.period.${p}`)}
        />

        <View style={styles.summary}>
          <SummaryItem label={t('stats.totalCount')} value={totalCount} />
          <SummaryItem label={t('stats.avgInterval')} value={averageIntervalMinutes ?? '-'} />
        </View>
        <View style={styles.summary}>
          <SummaryItem label={t('stats.totalFormulaMl')} value={totalFormulaMl} />
          <SummaryItem label={t('stats.totalMinutes')} value={totalMinutes} />
        </View>

        <Text style={styles.sectionTitle}>{t(`stats.period.${period}`)}</Text>

        <SegmentedControl
          values={METRICS}
          selected={metric}
          onChange={setMetric}
          labelFor={(m) => t(`stats.metric.${m}`)}
        />

        <DailyBarChart data={buckets} metric={metric} />
      </ScrollView>
    </SafeAreaView>
  );
}

type SegmentedControlProps<T extends string> = {
  values: readonly T[];
  selected: T;
  onChange: (v: T) => void;
  labelFor: (v: T) => string;
};

function SegmentedControl<T extends string>({
  values,
  selected,
  onChange,
  labelFor,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.segmented}>
      {values.map((v) => {
        const active = v === selected;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {labelFor(v)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SummaryItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1B1B1B', paddingHorizontal: 16 },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: { fontSize: 13, color: '#666' },
  segmentTextActive: { color: '#2E7D32', fontWeight: '600' },
  summary: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 28, fontWeight: '700', color: '#2E7D32' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 4,
    marginTop: 12,
  },
});
