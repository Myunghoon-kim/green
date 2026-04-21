/**
 * react-native-mmkv 기반 IStorage 구현체.
 *
 * MMKV 는 동기 API 를 제공하지만, IStorage 계약은 동기 시그니처를 유지.
 * 비동기 저장소(RemoteStorage) 로 교체할 때는 Repository 측에서 async 로 래핑.
 */

import { MMKV } from 'react-native-mmkv';
import type { IStorage } from './IStorage';

export class MmkvStorage implements IStorage {
  private readonly mmkv: MMKV;

  /**
   * @param id MMKV 인스턴스 이름. 기본은 'green-app'. 테스트마다 분리하거나
   *           멀티 프로파일(다자녀) 지원 시 분리 용도.
   */
  constructor(id: string = 'green-app') {
    this.mmkv = new MMKV({ id });
  }

  get(key: string): string | undefined {
    return this.mmkv.getString(key);
  }

  set(key: string, value: string): void {
    this.mmkv.set(key, value);
  }

  delete(key: string): void {
    this.mmkv.delete(key);
  }

  keys(): string[] {
    return this.mmkv.getAllKeys();
  }

  clear(): void {
    this.mmkv.clearAll();
  }
}
