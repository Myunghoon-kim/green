// Jest global setup — runs before each test file.
// Mock native modules that Jest cannot resolve in a Node environment.

// MMKV native module — replaced by an in-memory Map implementation for tests.
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key, value) => store.set(key, value),
      getString: (key) => store.get(key) ?? undefined,
      getNumber: (key) => store.get(key) ?? undefined,
      getBoolean: (key) => store.get(key) ?? undefined,
      delete: (key) => store.delete(key),
      getAllKeys: () => Array.from(store.keys()),
      clearAll: () => store.clear(),
      contains: (key) => store.has(key),
    })),
  };
});

// expo-speech-recognition — mocked so unit tests don't touch native code.
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    getSupportedLocales: jest.fn().mockResolvedValue(['ko-KR', 'en-US']),
  },
  useSpeechRecognitionEvent: jest.fn(),
}));
