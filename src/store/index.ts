/**
 * 전역 스토어 진입점.
 *
 * Repository 의 실제 구현(MMKV)을 여기서 주입. 테스트는 createFeedingSlice 를
 * 직접 호출하여 스텁 저장소로 검증하므로, 이 파일은 런타임 전용.
 */

import { create } from 'zustand';
import { createFeedingSlice, type FeedingSlice } from './feedingSlice';
import { FeedingRepository } from '@/data/repositories/FeedingRepository';
import { MmkvStorage } from '@/data/storage/MmkvStorage';

// 런타임 싱글턴 Repository.
const storage = new MmkvStorage();
const repository = new FeedingRepository(storage);

export const useFeedingStore = create<FeedingSlice>()(createFeedingSlice(repository));

// 스토어 외부에서 Repository 가 필요한 경우(예: background task)에 대비.
export const feedingRepository = repository;

export * from './selectors';
