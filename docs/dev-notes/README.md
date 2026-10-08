# 개발 노트

개발 중 고민하거나 수정한 내용을 포트폴리오 채택 여부와 관계없이 남기는 공간이다. 문제 해결, 설계 판단, 실패한 접근, 예상과 다른 동작을 주제별 파일로 기록한다.

## 파일 원칙

- 주제마다 `YYYY-MM-DD-short-topic.md` 형식의 파일을 하나 만든다.
- 한 파일에는 하나의 질문이나 문제만 다룬다.
- 완성된 글보다 당시 판단과 검증 근거를 보존하는 것을 우선한다.
- Phase 계획, Issue 운영 이력, 요구사항과 API 계약을 그대로 옮겨 적지 않는다. 해당 기준 문서와 별개로 기술적 선택의 이유·영향이나 문제의 재현·원인을 설명할 때만 개발 노트를 만든다.
- 사소한 오타 수정은 별도 교훈이나 재발 방지 가치가 있을 때만 기록한다.
- 해결하지 못한 문제도 `보류` 상태와 다음 확인 사항을 남길 수 있다.

## 기록 시점

아래 사례는 자동 작성 목록이 아니다. 다음 사람이 **왜 이 방법을 택했는지** 또는 **무엇이 잘못됐고 어떻게 확인했는지**를 기존 문서만으로 알기 어렵고, 그 답을 근거와 함께 남길 수 있을 때 작성한다. 구현 전의 중요한 설계 결정도 가능하지만 실제 검증과 예상 효과를 구분한다.

- 예상과 실제 동작이 달랐다.
- 구조, 데이터 정합성, 보안, 운영 또는 공개 계약에 영향을 주는 구현 방법을 비교하고 선택 이유가 있다.
- 버그의 원인을 찾아 수정했다.
- 테스트가 잘못된 가정이나 누락된 경계값을 드러냈다.
- 성능, 정합성, 보안 또는 유지보수 trade-off를 결정했다.
- 선택하지 않은 접근에서도 다시 참고할 교훈이 생겼다.

사소한 설정 변경, 일정·작업 순서 변경, 다른 문서에 이미 있는 결정 목록에는 별도 노트를 만들지 않는다. 이런 내용은 코드·PR, Milestone·Issue, API 계약 또는 인계 메모에 둔다.

## 다른 기록과의 관계

```text
개발 중 고민·수정
        ↓
개발 노트에 사실과 근거 기록
        ↓
├─ 포트폴리오 가치가 있으면 PORTFOLIO_NOTES.md에 후보 추가
└─ 학습 가치가 있으면 docs/til/에 주제별 핵심 요소 작성
```

개발 노트는 포트폴리오나 TIL로 반드시 발전할 필요가 없다. 반대로 포트폴리오와 TIL의 주장은 관련 개발 노트, 코드, 테스트 또는 로그로 다시 확인할 수 있어야 한다.

## 새 노트 만들기

[`_TEMPLATE.md`](_TEMPLATE.md)를 복사해 주제별 파일을 만들고, 확인되지 않은 항목은 추측으로 채우지 않는다.

## 기록 목록

- [로컬 PostgreSQL 실행에 Docker Compose 사용](2026-10-05-local-postgresql-docker-compose.md)
- [DB 통합 테스트에 Testcontainers PostgreSQL 사용](2026-10-05-testcontainers-postgresql.md)
- [백엔드 formatting을 Spotless로 통합](2026-10-05-backend-spotless-formatting.md)
- [REST API 학습을 위한 프런트엔드 기반 구성](2026-10-05-frontend-foundation.md)
- [저장소 formatting을 Prettier와 Spotless로 통합](2026-10-05-repository-formatting.md)
- [프런트엔드 ESLint를 코드 오류 예방에 한정](2026-10-05-frontend-eslint.md)
- [로컬 전체 검증을 하나의 npm 명령으로 통합](2026-10-05-local-integrated-verification.md)
- [영역별 CI 검사 구성](2026-10-05-ci-foundation.md)
- [변경 영역에 따른 CI 검사 선택](2026-10-08-selective-ci-checks.md)
- [CI job 단위 건너뜀](2026-10-08-ci-job-level-skip.md)
- [예약 이력이 있는 회의실의 운영 종료](2026-10-06-room-retirement-and-reservation-history.md)
- [로컬 PostgreSQL 미실행으로 백엔드 시작 실패](2026-10-07-local-postgresql-connection-refused.md)
- [회원가입 고유성을 PostgreSQL에서 보장하기](2026-10-07-member-uniqueness-migration.md)
- [회원가입 중복을 DB 제약에서 판정하고 API 오류로 변환하기](2026-10-07-member-duplicate-response.md)
- [회원가입 요청이 기본 보안 설정에서 차단됨](2026-10-07-sign-up-security-entry.md)
- [회원가입 화면의 입력 검사와 사전 중복 확인](2026-10-08-sign-up-input-and-availability.md)
- [회원 로그인 상태를 서버 세션으로 관리하기로 선택](2026-10-08-member-session-auth-choice.md)
- [세션 로그인 요청의 CSRF 토큰을 조회 API와 헤더로 전달하기](2026-10-08-session-csrf-token-delivery.md)
