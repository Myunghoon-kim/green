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

export type UseSpeechRecordingOptions = {
  /**
   * SFSpeechRecognitionRequest.contextualStrings 로 전달되는 어휘 힌트.
   * 도메인 단어를 넘겨주면 동음이의어 인식 정확도가 올라간다.
   */
  contextualStrings?: readonly string[];
};

export type UseSpeechRecordingReturn = {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

export const useSpeechRecording = (
  options: UseSpeechRecordingOptions = {},
): UseSpeechRecordingReturn => {
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

  // 새 배열 참조가 매 렌더마다 들어와도 useCallback 가 재생성되지 않도록
  // 내용 키로 메모이즈.
  const hintsKey = (options.contextualStrings ?? []).join('|');

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('permission-denied');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: i18n.language,
      interimResults: true,
      continuous: false,
      // 도메인 어휘 힌트 — iOS Speech 가 우선 인식하도록 편향.
      ...(options.contextualStrings && options.contextualStrings.length > 0
        ? { contextualStrings: [...options.contextualStrings] }
        : {}),
    });
    // hintsKey 가 동일하면 동일 옵션이라 의도적으로 함수 ID 안정화.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, hintsKey]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return { isRecording, transcript, error, start, stop, reset };
};
