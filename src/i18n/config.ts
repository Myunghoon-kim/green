/**
 * 지원 로케일 정의.
 *
 * 새 언어 추가 시:
 *   1. SUPPORTED_LOCALES 에 항목 추가
 *   2. locales/<code>.json 리소스 추가
 *   3. index.ts resources 에 등록
 *   4. VoiceParserFactory 에 해당 언어 파서 등록
 */

export const SUPPORTED_LOCALES = ['ko-KR', 'en-US'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'ko-KR';

export const FALLBACK_LOCALE: SupportedLocale = 'en-US';

/**
 * 'ko', 'ko-KR', 'en', 'en-US' 등 다양한 형태의 locale tag 를 지원 로케일로 정규화.
 * 지원하지 않으면 FALLBACK_LOCALE 반환.
 */
export const normalizeLocale = (tag: string | undefined | null): SupportedLocale => {
  if (!tag) return FALLBACK_LOCALE;

  const lower = tag.toLowerCase();

  // Exact match (ko-KR, en-US)
  const exact = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  // Language prefix match (ko → ko-KR)
  const prefix = lower.split('-')[0];
  const byPrefix = SUPPORTED_LOCALES.find((l) => l.toLowerCase().startsWith(prefix + '-'));
  if (byPrefix) return byPrefix;

  return FALLBACK_LOCALE;
};
