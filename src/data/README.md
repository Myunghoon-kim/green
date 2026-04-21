# data/

외부 I/O (저장소·API) 와의 경계 레이어. **도메인이 의존하는 인터페이스의 구현체**를 제공합니다.

## 폴더 구조

```
data/
├── storage/          # Key-value 저장소 추상화 + MMKV 구현체
├── repositories/     # 도메인 Repository 인터페이스 + 구현체
└── voice/
    └── parsers/      # 음성 파서 (Strategy 패턴, 언어별 구현체)
```

## 의존 방향

- 도메인(`src/domain/`) 은 `data/` 의 **인터페이스만** 알 수 있습니다.
- 프레젠테이션은 `data/` 를 직접 호출할 수 있지만, 가능하면 Use Case 를 통해서만 호출하세요.

## 왜 인터페이스를 따로 두는가
- 테스트에서 `InMemoryStorage`, `StubVoiceParser` 같은 가짜 구현체로 교체 가능
- 훗날 저장소를 **서버 API / Supabase** 로 교체할 때 도메인·UI 코드 변경 없이 data 레이어 교체만으로 해결
