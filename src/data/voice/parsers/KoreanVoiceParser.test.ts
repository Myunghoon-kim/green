import { KoreanVoiceParser } from './KoreanVoiceParser';

describe('KoreanVoiceParser', () => {
  const parser = new KoreanVoiceParser();

  describe('방향 추출', () => {
    it.each([
      ['왼쪽 15분', 'left'],
      ['좌측으로 10분', 'left'],
      ['오른쪽 10분', 'right'],
      ['우측 수유', 'right'],
      ['양쪽 20분', 'both'],
      ['둘 다 먹였어', 'both'],
    ] as const)('"%s" → side=%s', (input, expected) => {
      expect(parser.parse(input).side).toBe(expected);
    });

    it('방향 단어가 없으면 side 를 설정하지 않는다', () => {
      expect(parser.parse('10분').side).toBeUndefined();
    });
  });

  describe('시간(분) 추출', () => {
    it.each([
      ['왼쪽 15분', 15],
      ['10 분 먹었어', 10],
      ['3분', 3],
    ])('"%s" → %i 분', (input, expected) => {
      expect(parser.parse(input).durationMinutes).toBe(expected);
    });

    it('시간 표현이 없으면 durationMinutes 를 설정하지 않는다', () => {
      expect(parser.parse('왼쪽').durationMinutes).toBeUndefined();
    });
  });

  describe('양(ml) 추출', () => {
    it.each([
      ['분유 80ml', 80],
      ['100 ml 먹었어', 100],
      ['60 밀리', 60],
      ['120밀리리터', 120],
    ])('"%s" → %i ml', (input, expected) => {
      expect(parser.parse(input).amountMl).toBe(expected);
    });

    it('양 표현이 없으면 amountMl 을 설정하지 않는다', () => {
      expect(parser.parse('왼쪽 15분').amountMl).toBeUndefined();
    });
  });

  describe('복합 추출', () => {
    it('방향 + 시간을 동시에 추출한다', () => {
      const r = parser.parse('왼쪽 15분');
      expect(r).toEqual({ side: 'left', durationMinutes: 15 });
    });

    it('양만 있는 분유 기록도 처리한다', () => {
      const r = parser.parse('분유 80ml');
      expect(r).toEqual({ amountMl: 80, feedingType: 'formula' });
    });

    it('"모유" 단어가 있으면 feedingType=breast 로 추출한다', () => {
      expect(parser.parse('왼쪽 모유 15분').feedingType).toBe('breast');
    });
  });

  describe('오인식 보정 (normalize + parse)', () => {
    it('"수육" 은 "수유" 로 정규화된다', () => {
      expect(parser.normalize('수육 15분')).toBe('수유 15분');
    });

    it('잘못된 방향 표기("외쪽","왼족") 는 "왼쪽" 으로 보정된다', () => {
      expect(parser.parse('외쪽 10분').side).toBe('left');
      expect(parser.parse('왼족 10분').side).toBe('left');
    });

    it('"왼쪽" 정상 입력은 보정 후에도 그대로 유지된다', () => {
      expect(parser.normalize('왼쪽 15분')).toBe('왼쪽 15분');
    });
  });

  describe('엣지케이스', () => {
    it('빈 문자열은 빈 객체를 반환한다', () => {
      expect(parser.parse('')).toEqual({});
    });

    it('공백만 있는 문자열은 빈 객체를 반환한다', () => {
      expect(parser.parse('   ')).toEqual({});
    });

    it('인식되지 않는 문장은 빈 객체를 반환한다', () => {
      expect(parser.parse('오늘 날씨 좋다')).toEqual({});
    });
  });
});
