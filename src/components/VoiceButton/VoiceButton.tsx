/**
 * 음성 녹음 트리거 버튼.
 * 순수 프레젠테이션 컴포넌트 — 녹음 상태/콜백을 props 로 받는다.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export type VoiceButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const VoiceButton: React.FC<VoiceButtonProps> = ({ isRecording, disabled = false, onPress }) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? t('home.stopRecording') : t('home.startRecording')}
      style={({ pressed }) => [
        styles.button,
        isRecording && styles.recording,
        (disabled || pressed) && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.icon}>{isRecording ? '■' : '●'}</Text>
        <Text style={styles.label}>
          {isRecording ? t('home.stopRecording') : t('home.startRecording')}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  recording: {
    backgroundColor: '#C62828',
  },
  pressed: {
    opacity: 0.7,
  },
  inner: {
    alignItems: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 48,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VoiceButton;
