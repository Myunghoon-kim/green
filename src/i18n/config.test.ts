import { normalizeLocale, FALLBACK_LOCALE } from './config';

describe('normalizeLocale', () => {
  it('정확히 일치하는 로케일을 그대로 반환한다', () => {
    expect(normalizeLocale('ko-KR')).toBe('ko-KR');
    expect(normalizeLocale('en-US')).toBe('en-US');
  });

  it('대소문자가 달라도 정상 매칭된다', () => {
    expect(normalizeLocale('ko-kr')).toBe('ko-KR');
    expect(normalizeLocale('EN-US')).toBe('en-US');
  });

  it('언어 prefix 만 있으면 해당 언어의 기본 로케일로 매핑된다', () => {
    expect(normalizeLocale('ko')).toBe('ko-KR');
    expect(normalizeLocale('en')).toBe('en-US');
  });

  it('지원하지 않는 로케일은 FALLBACK_LOCALE 을 반환한다', () => {
    expect(normalizeLocale('fr-FR')).toBe(FALLBACK_LOCALE);
    expect(normalizeLocale('ja')).toBe(FALLBACK_LOCALE);
  });

  it('null/undefined/빈 문자열은 FALLBACK_LOCALE 을 반환한다', () => {
    expect(normalizeLocale(null)).toBe(FALLBACK_LOCALE);
    expect(normalizeLocale(undefined)).toBe(FALLBACK_LOCALE);
    expect(normalizeLocale('')).toBe(FALLBACK_LOCALE);
  });
});
