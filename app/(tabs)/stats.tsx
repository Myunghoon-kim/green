/**
 * 통계 화면. 일별 횟수 차트 + 평균 간격 요약.
 */

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import DailyBarChart from '@/components/charts/DailyBarChart';
import { useFeedingStats } from '@/hooks/useFeedingStats';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { dailyCounts, averageIntervalMinutes, totalCount } = useFeedingStats(7);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('stats.title')}</Text>

        <View style={styles.summary}>
          <SummaryItem label={t('stats.avgInterval')} value={averageIntervalMinutes ?? '-'} />
          <SummaryItem label={t('history.filters.all')} value={totalCount} />
        </View>

        <Text style={styles.sectionTitle}>{t('stats.daily')}</Text>
        <DailyBarChart data={dailyCounts} metric="count" />
      </ScrollView>
    </SafeAreaView>
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
  summary: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
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
    marginBottom: 8,
    marginTop: 8,
  },
});
