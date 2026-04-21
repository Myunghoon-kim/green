/**
 * i18next 초기화 진입점.
 * App 진입 시 한 번만 import 하여 초기화. (루트 App.tsx 또는 app/_layout.tsx)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import { DEFAULT_LOCALE, FALLBACK_LOCALE, normalizeLocale } from './config';
import ko from './locales/ko.json';
import en from './locales/en.json';

// 번들에 포함되는 리소스.
// 새 언어 추가 시 여기 등록 + config.ts 의 SUPPORTED_LOCALES 에도 추가.
const resources = {
  'ko-KR': { translation: ko },
  'en-US': { translation: en },
};

// 디바이스 로케일 감지 (앱 시작 시 1회). 지원하지 않는 로케일이면 FALLBACK 으로.
const deviceLocale = normalizeLocale(Localization.getLocales()[0]?.languageTag ?? DEFAULT_LOCALE);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLocale,
    fallbackLng: FALLBACK_LOCALE,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    // react-i18next 가 Suspense 없이 동작하도록.
    react: {
      useSuspense: false,
    },
  });

export default i18n;
