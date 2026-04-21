/**
 * 로케일에 맞는 IVoiceParser 인스턴스를 생성하는 Factory.
 *
 * - 지원하지 않는 로케일은 FALLBACK (영어) 파서로 대체
 * - 새 언어 추가 시 `register` 맵에만 항목을 추가하면 된다 (OCP)
 * - 파서는 상태가 없으므로 싱글턴 캐시 가능 (성능 최적화)
 */

import type { IVoiceParser } from './IVoiceParser';
import { KoreanVoiceParser } from './KoreanVoiceParser';
import { EnglishVoiceParser } from './EnglishVoiceParser';
import {
  SupportedLocale,
  FALLBACK_LOCALE,
  normalizeLocale,
} from '@/i18n/config';

// 로케일 → 파서 생성자 매핑. 새 언어 추가 시 여기에 한 줄 추가.
const register: Record<SupportedLocale, () => IVoiceParser> = {
  'ko-KR': () => new KoreanVoiceParser(),
  'en-US': () => new EnglishVoiceParser(),
};

export class VoiceParserFactory {
  // 파서 싱글턴 캐시. 동일 로케일로 여러 번 요청 시 같은 인스턴스 반환.
  private static cache = new Map<SupportedLocale, IVoiceParser>();

  /**
   * 주어진 로케일에 맞는 파서를 반환.
   * 지원하지 않는 로케일은 FALLBACK_LOCALE 파서로 대체.
   */
  static create(localeTag: string): IVoiceParser {
    const locale = normalizeLocale(localeTag);
    const cached = this.cache.get(locale);
    if (cached) return cached;

    const factory = register[locale] ?? register[FALLBACK_LOCALE];
    const parser = factory();
    this.cache.set(locale, parser);
    return parser;
  }

  /** 테스트에서 캐시를 초기화할 때 사용. */
  static clearCache(): void {
    this.cache.clear();
  }
}
