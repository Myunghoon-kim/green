/**
 * 홈 화면 — 음성으로 수유 기록.
 *
 * 책임:
 *   1. 음성 녹음 훅 결과를 VoiceButton 에 연결
 *   2. 전사 완료 시 파싱 → 저장 (usecase 조합)
 *   3. 상태/에러를 화면에 표시
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import VoiceButton from '@/components/VoiceButton';
import { useSpeechRecording } from '@/hooks/useSpeechRecording';
import { useFeedingStore } from '@/store';
import { ParseVoiceInputUseCase } from '@/domain/usecases/ParseVoiceInput';
import { VoiceParserFactory } from '@/data/voice/parsers/VoiceParserFactory';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { isRecording, transcript, error, start, stop, reset } = useSpeechRecording();
  const addRecord = useFeedingStore((s) => s.addRecord);

  // 녹음이 끝나고 transcript 가 있으면 파싱 + 저장.
  // 이 effect 는 홈 화면에서만 활성 — 다른 화면으로 이동하면 자동 해제.
  useEffect(() => {
    if (isRecording || !transcript) return;

    const parser = VoiceParserFactory.create(i18n.language);
    const parseUseCase = new ParseVoiceInputUseCase();
    const input = parseUseCase.execute({ transcript, parser });

    addRecord(input).finally(reset);
  }, [isRecording, transcript, i18n.language, addRecord, reset]);

  const handlePress = () => {
    if (isRecording) stop();
    else start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.body}>
        <VoiceButton isRecording={isRecording} onPress={handlePress} />

        {!!transcript && <Text style={styles.transcript}>{transcript}</Text>}
        {isRecording && <Text style={styles.status}>{t('home.listening')}</Text>}
        {error === 'permission-denied' && (
          <Text style={styles.error}>{t('errors.permissionDenied')}</Text>
        )}
        {error && error !== 'permission-denied' && (
          <Text style={styles.error}>{t('errors.recognitionFailed')}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1B1B1B' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  transcript: { fontSize: 16, color: '#333', textAlign: 'center', paddingHorizontal: 24 },
  status: { fontSize: 14, color: '#888' },
  error: { fontSize: 14, color: '#C62828' },
});
