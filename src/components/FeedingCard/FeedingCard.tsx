/**
 * 수유 기록 1건을 카드 형태로 표시.
 *
 * Reanimated FadeInDown 으로 진입 애니메이션 — FlatList 가 새 아이템을 마운트할 때마다 발생.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { FeedingRecord } from '@/domain/models/FeedingRecord';
import { colors, radius, shadows, spacing } from '@/theme';

export type FeedingCardProps = {
  record: FeedingRecord;
  /** FlatList index — stagger 지연용. */
  index?: number;
};

const FeedingCard: React.FC<FeedingCardProps> = ({ record, index = 0 }) => {
  const { t } = useTranslation();

  const timeLabel = format(new Date(record.timestamp), 'HH:mm');
  const typeLabel = t(`feeding.type.${record.feedingType}`);
  const sideLabel = record.side ? t(`feeding.side.${record.side}`) : null;
  const durationLabel =
    record.durationMinutes !== undefined
      ? t('feeding.minutes', { count: record.durationMinutes })
      : null;
  const amountLabel =
    record.amountMl !== undefined ? t('feeding.ml', { count: record.amountMl }) : null;

  const typeChipStyle = record.feedingType === 'breast' ? styles.chipBreast : styles.chipFormula;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(320).springify().damping(14)}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={styles.time}>{timeLabel}</Text>
        <Text style={styles.source}>{t(`feeding.source.${record.source}`)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={typeChipStyle}>{typeLabel}</Text>
        {sideLabel && <Text style={styles.chipNeutral}>{sideLabel}</Text>}
        {durationLabel && <Text style={styles.chipNeutral}>{durationLabel}</Text>}
        {amountLabel && <Text style={styles.chipNeutral}>{amountLabel}</Text>}
      </View>
      {record.note && <Text style={styles.note}>{record.note}</Text>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginVertical: spacing.xs + 2,
    marginHorizontal: spacing.lg,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
    flexWrap: 'wrap',
  },
  time: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  source: {
    fontSize: 11,
    color: colors.textSubtle,
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipFormula: {
    fontSize: 13,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    fontWeight: '600',
  },
  chipBreast: {
    fontSize: 13,
    color: colors.accentDark,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    fontWeight: '600',
  },
  chipNeutral: {
    fontSize: 13,
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  note: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default FeedingCard;
