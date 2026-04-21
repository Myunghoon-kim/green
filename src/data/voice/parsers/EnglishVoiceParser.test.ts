import { EnglishVoiceParser } from './EnglishVoiceParser';

describe('EnglishVoiceParser', () => {
  const parser = new EnglishVoiceParser();

  it('left 15 minutes → { side: left, durationMinutes: 15 }', () => {
    expect(parser.parse('left 15 minutes')).toEqual({ side: 'left', durationMinutes: 15 });
  });

  it('right 10 min → { side: right, durationMinutes: 10 }', () => {
    expect(parser.parse('right 10 min')).toEqual({ side: 'right', durationMinutes: 10 });
  });

  it('both 20 mins', () => {
    expect(parser.parse('both 20 mins')).toEqual({ side: 'both', durationMinutes: 20 });
  });

  it('formula 80ml → amountMl 80', () => {
    expect(parser.parse('formula 80ml')).toEqual({ amountMl: 80 });
  });

  it('대소문자는 무시한다', () => {
    expect(parser.parse('LEFT 15 Minutes').side).toBe('left');
  });

  it('빈 입력은 빈 객체', () => {
    expect(parser.parse('')).toEqual({});
  });
});
