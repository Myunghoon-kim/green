/**
 * 테스트·개발용 Map 기반 IStorage 구현체.
 *
 * 앱 런타임에서는 MmkvStorage 를 쓰지만, 단위 테스트는 이 구현체로
 * 네이티브 의존 없이 Repository 레이어를 검증한다.
 */

import type { IStorage } from './IStorage';

export class InMemoryStorage implements IStorage {
  private readonly map = new Map<string, string>();

  get(key: string): string | undefined {
    return this.map.get(key);
  }

  set(key: string, value: string): void {
    this.map.set(key, value);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  keys(): string[] {
    return Array.from(this.map.keys());
  }

  clear(): void {
    this.map.clear();
  }
}
