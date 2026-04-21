/**
 * 음성 녹음/전사 커스텀 훅.
 *
 * expo-speech-recognition 의 이벤트 구독을 추상화하여 컴포넌트에서는
 * start/stop/isRecording/transcript/error 만 다루면 되도록 한다.
 *
 * 로케일은 i18n 의 현재 언어를 사용. 언어 변경 시 자동으로 파서·인식 언어 갱신.
 */

import { useCallback, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTranslation } from 'react-i18next';

export type UseSpeechRecordingReturn = {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

export const useSpeechRecording = (): UseSpeechRecordingReturn => {
  const { i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- 이벤트 구독 ---
  useSpeechRecognitionEvent('start', () => setIsRecording(true));
  useSpeechRecognitionEvent('end', () => setIsRecording(false));

  useSpeechRecognitionEvent('result', (e: { results?: Array<{ transcript?: string }> }) => {
    const text = e.results?.[0]?.transcript ?? '';
    setTranscript(text);
  });

  useSpeechRecognitionEvent('error', (e: { error?: string; message?: string }) => {
    setError(e.message ?? e.error ?? 'unknown');
    setIsRecording(false);
  });

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    // 권한 요청 — 이미 승인되었으면 즉시 반환.
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('permission-denied');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: i18n.language,
      interimResults: true,
      continuous: false,
    });
  }, [i18n.language]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { isRecording, transcript, error, start, stop, reset };
};
