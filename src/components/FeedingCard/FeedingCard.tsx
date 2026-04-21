/**
 * 수유 기록 1건을 카드 형태로 표시.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { FeedingRecord } from '@/domain/models/FeedingRecord';

export type FeedingCardProps = {
  record: FeedingRecord;
};

const FeedingCard: React.FC<FeedingCardProps> = ({ record }) => {
  const { t } = useTranslation();

  const timeLabel = format(new Date(record.timestamp), 'HH:mm');
  const sideLabel = record.side ? t(`feeding.side.${record.side}`) : null;
  const durationLabel =
    record.durationMinutes !== undefined
      ? t('feeding.minutes', { count: record.durationMinutes })
      : null;
  const amountLabel =
    record.amountMl !== undefined ? t('feeding.ml', { count: record.amountMl }) : null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>{timeLabel}</Text>
        <Text style={styles.source}>{t(`feeding.source.${record.source}`)}</Text>
      </View>
      <View style={styles.row}>
        {sideLabel && <Text style={styles.chip}>{sideLabel}</Text>}
        {durationLabel && <Text style={styles.chip}>{durationLabel}</Text>}
        {amountLabel && <Text style={styles.chip}>{amountLabel}</Text>}
      </View>
      {record.note && <Text style={styles.note}>{record.note}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1B1B',
  },
  source: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  chip: {
    fontSize: 13,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default FeedingCard;
