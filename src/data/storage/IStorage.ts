/**
 * 키-값 저장소 인터페이스.
 *
 * 문자열만 취급하는 의도적으로 작은 계약(ISP).
 * 복잡한 직렬화는 Repository 레이어에서 JSON 으로 처리한다.
 */
export type IStorage = {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  keys(): string[];
  clear(): void;
};
