/**
 * 음성 녹음 트리거 버튼.
 *
 * 애니메이션:
 *   - 녹음 중: 외곽 링이 천천히 펄스 (scale 1 → 1.4, opacity 0.6 → 0)
 *   - 탭: 햅틱 느낌의 살짝 스케일 다운 (0.94)
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, shadows } from '@/theme';

export type VoiceButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const BUTTON_SIZE = 168;

const VoiceButton: React.FC<VoiceButtonProps> = ({ isRecording, disabled = false, onPress }) => {
  const { t } = useTranslation();

  // 외곽 링 펄스 — 녹음 중일 때만 활성.
  const pulse = useSharedValue(0);
  // 탭 피드백 스케일.
  const press = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const handlePressIn = () => {
    press.value = withTiming(0.94, { duration: 90 });
  };
  const handlePressOut = () => {
    press.value = withSequence(
      withTiming(1.02, { duration: 90 }),
      withTiming(1, { duration: 120 }),
    );
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle, isRecording && styles.ringRecording]} />
      <Animated.View style={buttonStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? t('home.stopRecording') : t('home.startRecording')}
          style={[styles.button, isRecording ? styles.recording : null, disabled && styles.disabled]}
        >
          <View style={styles.inner}>
            <Text style={styles.icon}>{isRecording ? '■' : '●'}</Text>
            <Text style={styles.label}>
              {isRecording ? t('home.stopRecording') : t('home.startRecording')}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radius.pill,
    borderWidth: 6,
    borderColor: colors.primary,
  },
  ringRecording: {
    borderColor: colors.recording,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lifted,
  },
  recording: {
    backgroundColor: colors.recording,
  },
  disabled: {
    opacity: 0.6,
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
    letterSpacing: 0.3,
  },
});

export default VoiceButton;
