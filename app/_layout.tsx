/**
 * 루트 레이아웃.
 * - i18n 초기화 (첫 import 에서 i18next.init 실행)
 * - 앱 시작 시 저장소 hydrate
 * - 테마/SafeArea 래핑
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import '@/i18n';
import { useFeedingStore } from '@/store';

export default function RootLayout() {
  const hydrate = useFeedingStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
