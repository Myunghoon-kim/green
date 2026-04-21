import { ParseVoiceInputUseCase } from './ParseVoiceInput';
import type { IVoiceParser } from '@/data/voice/parsers/IVoiceParser';
import type { FeedingRecordInput } from '../models/FeedingRecord';

const makeStubParser = (result: Partial<FeedingRecordInput>): IVoiceParser => ({
  locale: 'ko-KR',
  parse: () => result,
});

describe('ParseVoiceInputUseCase', () => {
  it('파서의 결과와 원본 텍스트(note), source=voice 를 결합한다', () => {
    const parser = makeStubParser({ side: 'left', durationMinutes: 15 });
    const usecase = new ParseVoiceInputUseCase();

    const out = usecase.execute({ transcript: '왼쪽 15분', parser });

    expect(out.side).toBe('left');
    expect(out.durationMinutes).toBe(15);
    expect(out.note).toBe('왼쪽 15분');
    expect(out.source).toBe('voice');
  });

  it('파서가 빈 결과를 내도 note/source 는 반드시 채워진다', () => {
    const parser = makeStubParser({});
    const usecase = new ParseVoiceInputUseCase();

    const out = usecase.execute({ transcript: '알 수 없는 말', parser });

    expect(out.note).toBe('알 수 없는 말');
    expect(out.source).toBe('voice');
  });
});
