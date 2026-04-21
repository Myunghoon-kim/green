import { VoiceParserFactory } from './VoiceParserFactory';
import { KoreanVoiceParser } from './KoreanVoiceParser';
import { EnglishVoiceParser } from './EnglishVoiceParser';

describe('VoiceParserFactory', () => {
  beforeEach(() => {
    VoiceParserFactory.clearCache();
  });

  it('ko-KR → KoreanVoiceParser 인스턴스를 반환한다', () => {
    const parser = VoiceParserFactory.create('ko-KR');
    expect(parser).toBeInstanceOf(KoreanVoiceParser);
  });

  it('en-US → EnglishVoiceParser 인스턴스를 반환한다', () => {
    const parser = VoiceParserFactory.create('en-US');
    expect(parser).toBeInstanceOf(EnglishVoiceParser);
  });

  it('지원하지 않는 로케일은 fallback(영어) 파서로 대체한다', () => {
    const parser = VoiceParserFactory.create('fr-FR');
    expect(parser).toBeInstanceOf(EnglishVoiceParser);
  });

  it('언어 prefix 만 있어도 매칭된다 (ko → ko-KR)', () => {
    const parser = VoiceParserFactory.create('ko');
    expect(parser).toBeInstanceOf(KoreanVoiceParser);
  });

  it('동일 로케일 두 번 호출 시 같은 인스턴스를 반환한다 (싱글턴 캐시)', () => {
    const a = VoiceParserFactory.create('ko-KR');
    const b = VoiceParserFactory.create('ko-KR');
    expect(a).toBe(b);
  });
});
