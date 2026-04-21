# data/voice/

음성 관련 도메인 외 인프라. 현재는 **파서(Strategy 패턴)** 만 담고 있으며,
향후 음성 엔진 어댑터(iOS/Android SFSpeech/Google) 를 감쌀 클래스도 여기에 둡니다.

```
voice/
└── parsers/         # 언어별 음성 텍스트 파서 (Strategy + Factory)
```
