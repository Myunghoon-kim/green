/**
 * 통계 화면.
 * - 기간 선택: 일(7일) / 주(8주) / 월(6개월)
 * - 메트릭 선택: 횟수 / 수유 시간(분) / 분유량(ml)
 * - 요약 카드: 총 횟수, 평균 간격, 총 분유량, 총 시간
 */

import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import DailyBarChart from '@/components/charts/DailyBarChart';
import { useFeedingStats, type StatsPeriod } from '@/hooks/useFeedingStats';
import { colors, radius, shadows, spacing } from '@/theme';

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
        <Animated.Text entering={FadeIn.duration(360)} style={styles.title}>
          {t('stats.title')}
        </Animated.Text>

        <Animated.View entering={FadeInDown.duration(360).delay(60)}>
          <SegmentedControl
            values={PERIODS}
            selected={period}
            onChange={setPeriod}
            labelFor={(p) => t(`stats.period.${p}`)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(380).delay(120)}>
          <View style={styles.summary}>
            <SummaryItem label={t('stats.totalCount')} value={totalCount} />
            <SummaryItem label={t('stats.avgInterval')} value={averageIntervalMinutes ?? '-'} />
          </View>
          <View style={styles.summary}>
            <SummaryItem label={t('stats.totalFormulaMl')} value={totalFormulaMl} />
            <SummaryItem label={t('stats.totalMinutes')} value={totalMinutes} />
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>{t(`stats.period.${period}`)}</Text>

        <SegmentedControl
          values={METRICS}
          selected={metric}
          onChange={setMetric}
          labelFor={(m) => t(`stats.metric.${m}`)}
        />

        <Animated.View entering={FadeIn.duration(420).delay(180)}>
          <DailyBarChart data={buckets} metric={metric} />
        </Animated.View>
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
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingVertical: spacing.lg },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    letterSpacing: -0.3,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.sm + 2,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  segmentText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  segmentTextActive: { color: colors.primaryDark, fontWeight: '700' },
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  summaryValue: { fontSize: 30, fontWeight: '800', color: colors.primaryDark, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs + 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
});
