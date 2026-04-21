import { InMemoryStorage } from './InMemoryStorage';

describe('InMemoryStorage', () => {
  it('set 한 값을 get 으로 읽을 수 있다', () => {
    const s = new InMemoryStorage();
    s.set('a', '1');
    expect(s.get('a')).toBe('1');
  });

  it('없는 키는 undefined 를 반환한다', () => {
    const s = new InMemoryStorage();
    expect(s.get('none')).toBeUndefined();
  });

  it('delete 후에는 get 이 undefined 를 반환한다', () => {
    const s = new InMemoryStorage();
    s.set('a', '1');
    s.delete('a');
    expect(s.get('a')).toBeUndefined();
  });

  it('keys 는 저장된 모든 키를 반환한다', () => {
    const s = new InMemoryStorage();
    s.set('a', '1');
    s.set('b', '2');
    expect(s.keys().sort()).toEqual(['a', 'b']);
  });

  it('clear 는 모든 데이터를 삭제한다', () => {
    const s = new InMemoryStorage();
    s.set('a', '1');
    s.clear();
    expect(s.keys()).toEqual([]);
  });
});
