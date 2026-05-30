/**
 * 홈 화면 — 음성으로 수유 기록.
 *
 * 흐름:
 *   1. 마이크 탭 → 음성 인식 시작
 *   2. 인식 종료(transcript 수신) → 파싱 → 저장
 *   3. 저장 완료 시 "음성 인식이 완료되었습니다" 토스트 표시
 *   4. 잠시 후 기록(history) 탭으로 전환
 */

import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import VoiceButton from '@/components/VoiceButton';
import { useSpeechRecording } from '@/hooks/useSpeechRecording';
import { useFeedingStore } from '@/store';
import { ParseVoiceInputUseCase } from '@/domain/usecases/ParseVoiceInput';
import { VoiceParserFactory } from '@/data/voice/parsers/VoiceParserFactory';
import { colors, radius, shadows, spacing } from '@/theme';

const TOAST_VISIBLE_MS = 900;

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // 현재 로케일 파서 — 인식 힌트 + 정규화 + 파싱 모두 담당.
  const parser = useMemo(() => VoiceParserFactory.create(i18n.language), [i18n.language]);
  const { isRecording, transcript, error, start, stop, reset } = useSpeechRecording({
    contextualStrings: parser.hints,
  });
  const addRecord = useFeedingStore((s) => s.addRecord);

  const [recognized, setRecognized] = useState(false);

  const displayTranscript = transcript ? parser.normalize(transcript) : '';

  // 녹음이 끝나고 transcript 가 있으면 파싱 → 저장 → 토스트 → 히스토리 탭 이동.
  useEffect(() => {
    if (isRecording || !transcript) return;

    let cancelled = false;
    const parseUseCase = new ParseVoiceInputUseCase();
    const input = parseUseCase.execute({ transcript, parser });

    addRecord(input)
      .then(() => {
        if (cancelled) return;
        setRecognized(true);
        // 토스트 보여준 뒤 기록 탭으로 전환.
        setTimeout(() => {
          if (cancelled) return;
          setRecognized(false);
          reset();
          router.push('/history');
        }, TOAST_VISIBLE_MS);
      })
      .catch(() => {
        if (cancelled) return;
        reset();
      });

    return () => {
      cancelled = true;
    };
  }, [isRecording, transcript, parser, addRecord, reset, router]);

  const handlePress = () => {
    if (isRecording) stop();
    else start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(420).springify().damping(16)} style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </Animated.View>

      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(500).delay(80)}>
          <VoiceButton isRecording={isRecording} onPress={handlePress} />
        </Animated.View>

        {!!displayTranscript && !recognized && (
          <Animated.Text entering={FadeIn.duration(240)} style={styles.transcript}>
            “{displayTranscript}”
          </Animated.Text>
        )}
        {isRecording && (
          <Animated.Text entering={FadeIn.duration(200)} style={styles.status}>
            {t('home.listening')}
          </Animated.Text>
        )}
        {error === 'permission-denied' && (
          <Text style={styles.error}>{t('errors.permissionDenied')}</Text>
        )}
        {error && error !== 'permission-denied' && (
          <Text style={styles.error}>{t('errors.recognitionFailed')}</Text>
        )}
      </View>

      {recognized && (
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(16)}
          exiting={FadeOut.duration(180)}
          style={styles.toast}
        >
          <Text style={styles.toastIcon}>✓</Text>
          <Text style={styles.toastText}>{t('home.recognized')}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs + 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  transcript: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  status: { fontSize: 14, color: colors.textMuted, letterSpacing: 0.3 },
  error: { fontSize: 14, color: colors.recording },
  toast: {
    position: 'absolute',
    bottom: spacing.xxl + spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    ...shadows.lifted,
  },
  toastIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
