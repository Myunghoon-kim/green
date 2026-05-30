/**
 * 루트 레이아웃.
 * - i18n 초기화 (첫 import 에서 i18next.init 실행)
 * - 앱 시작 시 저장소 hydrate
 * - 테마/SafeArea 래핑
 * - 인앱 Lottie 스플래시 시퀀스 (네이티브 스플래시 → Lottie → 홈)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import '@/i18n';
import { useFeedingStore } from '@/store';
import AnimatedSplash from '@/components/AnimatedSplash';
import { colors } from '@/theme';

// 네이티브 스플래시는 우리 인앱 Lottie 가 mount 되기 전까진 노출 유지.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrate = useFeedingStore((s) => s.hydrate);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 우리 컴포넌트가 그려질 준비가 되면 네이티브 스플래시 즉시 hide → Lottie 인계.
  const handleReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={handleReady}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
      </View>
    </SafeAreaProvider>
  );
}
