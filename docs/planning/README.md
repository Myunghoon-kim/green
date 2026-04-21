# planning/

기능별 기획 문서 모음. 새 기능을 시작할 때 여기에 `<feature>.md` 파일을 추가합니다.

## 현재 기획 문서

- [voice-recording.md](voice-recording.md) — 음성 인식으로 수유 기록 입력
- [feeding-history.md](feeding-history.md) — 수유 기록 목록·검색
- [statistics.md](statistics.md) — 일별/주별 통계 차트

## 기획 문서 작성 템플릿

새 기획 문서는 다음 섹션을 포함해 작성합니다:

```markdown
# <기능 이름>

## 배경
왜 이 기능이 필요한가? 어떤 사용자 문제를 해결하는가?

## 요구사항
- 사용자 시나리오 (As a user, I want...)
- 수용 조건 (Acceptance Criteria) — 체크리스트 형식

## UX 플로우
1. 진입점
2. 주요 상호작용
3. 엣지케이스 (권한 거부, 네트워크 없음 등)

## 기술 설계
- 관련 도메인 모델
- 필요한 use case
- 외부 의존성 (라이브러리, API)

## 테스트 계획
TDD 로 검증할 단위:
- [ ] xxx 클래스의 yyy 메서드
- [ ] 파서의 특정 입력 케이스

## 마일스톤
- [ ] M1: 기본 동작
- [ ] M2: 엣지케이스 처리
- [ ] M3: UX 개선
```
