/**
 * 기록 목록 화면.
 * - 상단: 최근 7일 수유 시각 타임라인
 * - 하단: 카드 리스트 (최신순)
 */

import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FeedingCard from '@/components/FeedingCard';
import TimelineChart from '@/components/charts/TimelineChart';
import { useFeedingStore, selectAllRecords } from '@/store';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const records = useFeedingStore(selectAllRecords);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('history.title')}</Text>

      {records.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>{t('history.timeline')}</Text>
          <TimelineChart records={records} days={7} />
        </>
      )}

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('history.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => <FeedingCard record={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: '700', color: '#1B1B1B', padding: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  list: { paddingVertical: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
});
