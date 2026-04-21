# i18n/

다국어(Internationalization) 리소스와 설정.

## 구조

```
i18n/
├── index.ts              # i18next 초기화 + 공용 훅
├── config.ts             # 지원 로케일 상수, 기본 로케일
└── locales/
    ├── ko.json           # 한국어
    └── en.json           # 영어
```

## 새 언어 추가 절차

1. `locales/<lang>.json` 파일 추가 (기존 JSON 키 구조와 동일하게)
2. `config.ts` 의 `SUPPORTED_LOCALES` 에 등록
3. `index.ts` 의 `resources` 에 추가
4. `data/voice/parsers/` 에 `<Lang>VoiceParser` 구현체 추가
5. `VoiceParserFactory` 에 등록

## 사용 예

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <Text>{t('home.title')}</Text>;
};
```

## 로케일 변경 런타임 반영

```typescript
import i18n from '@/i18n';
i18n.changeLanguage('en');
```

`changeLanguage` 호출 시 `VoiceParserFactory` 도 새 로케일 파서를 제공하므로, 음성 인식도 자동으로 새 언어 기준으로 동작합니다.
