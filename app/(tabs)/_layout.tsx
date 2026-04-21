/**
 * 탭 네비게이터. 홈/기록/통계 3개 탭.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="history" options={{ title: t('tabs.history') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
    </Tabs>
  );
}
