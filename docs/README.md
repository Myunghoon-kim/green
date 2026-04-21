# docs/

기획·설계·운영 관련 문서를 보관합니다. 코드와 별도로, **계속 추가될 문서**를 체계적으로 모으는 공간입니다.

## 폴더 구조

```
docs/
├── README.md           # (이 파일)
├── TDD.md              # 테스트 주도 개발 가이드
├── ARCHITECTURE.md     # 아키텍처 결정 기록 (ADR 포함)
└── planning/           # 기획 문서 (기능별)
    ├── README.md
    └── <feature-name>.md
```

## 문서 작성 규칙

1. 모든 문서는 **Markdown** 으로 작성합니다.
2. 새 기획 문서는 `planning/` 아래에 기능명 파일로 추가합니다. 예: `planning/voice-recording.md`
3. 아키텍처 결정이 있으면 `ARCHITECTURE.md` 하단에 ADR(Architecture Decision Record) 형식으로 추가합니다.
4. 문서 파일명은 **kebab-case** 를 권장합니다: `voice-recording.md`, `multi-child-profile.md`

## ADR 템플릿 (ARCHITECTURE.md에 사용)

```markdown
## ADR-00X: {{결정 제목}}

- **날짜:** YYYY-MM-DD
- **상태:** Proposed | Accepted | Deprecated | Superseded

### 맥락
어떤 문제/요구사항 때문에 결정이 필요한가?

### 결정
무엇을 선택했는가?

### 대안
무엇을 고려했고, 왜 기각했는가?

### 결과
어떤 긍정적·부정적 영향을 예상하는가?
```

## 기획 문서 템플릿

`planning/<feature>.md` 작성 시 다음 섹션을 권장합니다:

1. **배경** — 왜 이 기능이 필요한가
2. **요구사항** — 사용자 시나리오, 수용 조건 (Acceptance Criteria)
3. **UX 플로우** — 화면 흐름, 엣지케이스
4. **기술 설계** — 데이터 모델, API 의존성
5. **테스트 계획** — TDD로 검증할 범위
6. **마일스톤** — 단계별 완료 기준
