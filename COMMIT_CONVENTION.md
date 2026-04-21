# Git Commit Convention

이 프로젝트는 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) 규격을 따릅니다.
자동 CHANGELOG 생성, 시맨틱 버저닝, PR 리뷰어의 빠른 맥락 파악을 위해 모든 커밋은 아래 규칙을 지켜 주세요.

---

## 커밋 메시지 형식

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### 예시

```
feat(voice): add Korean locale support for speech recognition

Implement KoreanVoiceParser with regex-based extraction of feeding
side (left/right/both) and duration (minutes). Registered in
VoiceParserFactory to be selected automatically by current locale.

Closes #12
```

---

## Type (필수)

| type | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `feat(stats): add weekly line chart` |
| `fix` | 버그 수정 | `fix(voice): prevent double-start when tapping fast` |
| `refactor` | 기능 변경 없이 코드 구조 개선 | `refactor(store): split feeding slice` |
| `perf` | 성능 개선 | `perf(list): virtualize feeding history` |
| `test` | 테스트만 추가·수정 | `test(parser): cover edge cases for empty input` |
| `docs` | 문서만 변경 (README, 주석 등) | `docs: update install guide` |
| `style` | 포맷 변경만 (동작 변경 없음) | `style: apply prettier` |
| `chore` | 빌드·설정·의존성 변경 | `chore(deps): bump expo to 52` |
| `build` | 빌드 시스템 / 배포 파이프라인 | `build: add eas production profile` |
| `ci` | CI 설정 변경 | `ci: run tests on push to main` |
| `revert` | 이전 커밋 되돌림 | `revert: feat(voice): add continuous mode` |

---

## Scope (선택)

변경이 영향을 주는 **영역/모듈**을 명시합니다. 폴더명·기능명 기준.

권장 scope 예시:
- `voice` — 음성 인식 관련
- `stats` — 통계·차트
- `store` — 상태 관리
- `i18n` — 다국어
- `repo` — Repository 레이어
- `parser` — 음성 텍스트 파서
- `ui` — 공통 컴포넌트
- `deps` — 의존성

여러 영역을 동시에 건드린다면 scope 없이 작성해도 됩니다.

---

## Subject (필수)

- **50자 이내**, 명령문 (imperative mood): "add", "fix", "remove"
- 마침표 없이 끝냄
- 첫 글자 소문자
- 한국어·영어 모두 허용 (팀 합의 따름 — 이 프로젝트는 **영어 권장**, 복잡한 정책 변경은 한국어 허용)

**좋은 예:**
- `add Korean voice parser`
- `fix off-by-one in weekly aggregation`

**나쁜 예:**
- `Added some stuff` (과거형, 모호함)
- `Fixed the bug.` (마침표, 불명확)

---

## Body (선택)

**무엇을 바꿨는가**가 아니라 **왜 바꿨는가**를 설명합니다.

- 72자 줄바꿈
- subject와 빈 줄 하나로 분리
- 배경·대안·영향 범위를 서술

---

## Footer (선택)

### Breaking Change

호환성을 깨는 변경이 있다면:

```
feat(repo): change IFeedingRepository.save signature

BREAKING CHANGE: save() now returns the saved record instead of void.
Callers must update to use the returned value.
```

또는 type 뒤에 `!` 추가:

```
feat(repo)!: change save() return type
```

### 이슈 연결

```
Closes #42
Refs #18, #19
```

---

## 커밋 분리 원칙

- **하나의 커밋은 하나의 논리적 변경**만 담습니다
- 리팩터링과 기능 추가를 섞지 않습니다 → 각각 `refactor:`, `feat:` 커밋으로 분리
- 테스트는 기능 커밋과 함께 포함하는 것을 권장 (TDD 플로우)

---

## 릴리스 노트 자동 생성과의 관계

`feat` → minor 버전 업, `fix` → patch 버전 업, `BREAKING CHANGE` → major 버전 업으로 시맨틱 버저닝과 연결됩니다.
`docs`, `style`, `chore`, `refactor`, `test` 는 릴리스 노트에 포함되지 않습니다.

---

## 빠른 체크리스트

- [ ] type이 위 표에 있는가?
- [ ] subject가 50자 이내, 명령문, 소문자 시작, 마침표 없음?
- [ ] 변경이 커밋 하나에 담기에 적절한가? (너무 크면 분리)
- [ ] BREAKING CHANGE라면 footer에 명시했는가?
