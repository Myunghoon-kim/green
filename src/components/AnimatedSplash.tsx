/**
 * 인앱 스플래시 오버레이.
 *
 * 구성 (Reanimated 로 직접 구현 — Lottie 의존 제거하여 포맷 호환 문제 회피):
 *   - 바깥 링: scale 1.0 → 1.4, opacity 0.6 → 0 펄스 (반복)
 *   - 중앙 원: scale 0 → 1.05 → 1, 옅은 회전, 그림자
 *   - 작은 흰 드롭: 위에서 살짝 떨어져 정착
 *   - 타이틀/서브타이틀: 페이드 인
 *
 * 시퀀스: mount → 약 2초 후 컨테이너 페이드 아웃 → onFinish 콜백.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '@/theme';

export type AnimatedSplashProps = {
  /** 페이드 아웃 종료 후 호출 — 부모가 이 시점에 언마운트. */
  onFinish: () => void;
};

const TOTAL_HOLD_MS = 1700; // 진입+회전 끝나고 잠깐 정착
const FADE_OUT_MS = 380;

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onFinish }) => {
  // 컨테이너 페이드 아웃.
  const containerOpacity = useSharedValue(1);

  // 바깥 링 펄스 (반복).
  const pulse = useSharedValue(0);

  // 중앙 원 진입 + 회전.
  const coreScale = useSharedValue(0);
  const coreRotation = useSharedValue(0);
  const coreOpacity = useSharedValue(0);

  // 작은 드롭.
  const dropY = useSharedValue(-30);
  const dropOpacity = useSharedValue(0);
  const dropScale = useSharedValue(0);

  // 텍스트는 Animated.Text 의 entering 으로 별도 처리.

  useEffect(() => {
    // 1) 중앙 원 진입
    coreOpacity.value = withTiming(1, { duration: 360 });
    coreScale.value = withSequence(
      withTiming(1.08, { duration: 360, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 12, stiffness: 140 }),
    );
    coreRotation.value = withTiming(180, { duration: 1700, easing: Easing.inOut(Easing.cubic) });

    // 2) 바깥 링 펄스 시작 (살짝 지연)
    pulse.value = withDelay(
      200,
      withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );

    // 3) 드롭 (조금 더 지연)
    dropOpacity.value = withDelay(450, withTiming(1, { duration: 300 }));
    dropScale.value = withDelay(450, withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.6)) }));
    dropY.value = withDelay(
      450,
      withSequence(
        withTiming(8, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 220, easing: Easing.inOut(Easing.cubic) }),
      ),
    );

    // 4) 일정 시간 후 페이드 아웃 → onFinish
    const fadeOut = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        },
      );
    }, TOTAL_HOLD_MS);

    return () => {
      clearTimeout(fadeOut);
      cancelAnimation(pulse);
    };
  }, [containerOpacity, coreOpacity, coreScale, coreRotation, pulse, dropOpacity, dropScale, dropY, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.value),
    transform: [{ scale: 0.6 + pulse.value * 0.8 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: coreOpacity.value,
    transform: [{ scale: coreScale.value }, { rotate: `${coreRotation.value}deg` }],
  }));

  const dropStyle = useAnimatedStyle(() => ({
    opacity: dropOpacity.value,
    transform: [{ translateY: dropY.value }, { scale: dropScale.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
      <View style={styles.stage}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.core, coreStyle]}>
          <Animated.View style={[styles.drop, dropStyle]} />
        </Animated.View>
      </View>
      <Animated.Text entering={FadeIn.delay(500).duration(500)} style={styles.title}>
        Green
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(800).duration(500)} style={styles.subtitle}>
        수유 기록
      </Animated.Text>
    </Animated.View>
  );
};

const STAGE_SIZE = 200;
const RING_SIZE = 200;
const CORE_SIZE = 130;
const DROP_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  stage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 5,
    borderColor: colors.primary,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  drop: {
    width: DROP_SIZE,
    height: DROP_SIZE,
    borderRadius: DROP_SIZE / 2,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    letterSpacing: 0.6,
  },
});

export default AnimatedSplash;
