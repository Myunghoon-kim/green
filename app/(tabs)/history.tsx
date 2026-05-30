/**
 * 기록 목록 화면.
 * - 상단: 최근 7일 수유 시각 타임라인
 * - 하단: 날짜별로 그룹핑된 카드 리스트 (최신순)
 *   - 각 섹션 헤더: "오늘 / 어제 / M월 D일 (요일)"
 */

import React, { useMemo } from 'react';
import { SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

import FeedingCard from '@/components/FeedingCard';
import TimelineChart from '@/components/charts/TimelineChart';
import { useFeedingStore, selectAllRecords } from '@/store';
import { groupRecordsByDate } from '@/utils/groupRecordsByDate';
import { colors, radius, shadows, spacing } from '@/theme';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * 날짜를 사용자 친화적 라벨로:
 *   - 오늘 → "오늘"
 *   - 어제 → "어제"
 *   - 그 외 → "M월 D일 (요일)" (영어 로케일이면 "MMM d (EEE)")
 */
const formatSectionLabel = (
  dayStart: number,
  todayStart: number,
  locale: string,
  t: (k: string) => string,
): string => {
  const diffDays = Math.round((todayStart - dayStart) / MS_PER_DAY);
  if (diffDays === 0) return t('history.today');
  if (diffDays === 1) return t('history.yesterday');

  const dateFnsLocale = locale.startsWith('ko') ? ko : enUS;
  const date = new Date(dayStart);
  const pattern = locale.startsWith('ko') ? 'M월 d일 (EEE)' : 'MMM d (EEE)';
  return format(date, pattern, { locale: dateFnsLocale });
};

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const records = useFeedingStore(selectAllRecords);

  const sections = useMemo(() => groupRecordsByDate(records), [records]);
  const todayStart = useMemo(() => startOfDay(Date.now()), []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text entering={FadeIn.duration(360)} style={styles.title}>
        {t('history.title')}
      </Animated.Text>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('history.empty')}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <Animated.View entering={FadeIn.duration(360).delay(80)}>
              <Text style={styles.sectionLabel}>{t('history.timeline')}</Text>
              <TimelineChart records={records} days={7} />
            </Animated.View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>
                {formatSectionLabel(section.dayStart, todayStart, i18n.language, t)}
              </Text>
              <View style={styles.dayHeaderCountWrap}>
                <Text style={styles.dayHeaderCount}>{section.data.length}</Text>
              </View>
            </View>
          )}
          renderItem={({ item, index }) => <FeedingCard record={item} index={index} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: { paddingBottom: spacing.lg },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textSubtle, fontSize: 14 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  dayHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.1,
  },
  dayHeaderCountWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
    ...shadows.card,
  },
  dayHeaderCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    minWidth: 14,
    textAlign: 'center',
  },
});
