# 기여 및 Git 운영 규칙

이 문서는 RentalRoom 저장소에서 Phase, Issue, Work를 관리하고 변경을 병합하는 기준을 정의한다.

## 작업 계층

- Phase는 시연 가능한 마일스톤이며 GitHub Milestone으로 관리한다.
- GitHub Milestone에는 Phase 목표, 완료 조건, 포함된 Issue를 기록한다.
- Issue는 사용자 가치 또는 기술 문제 하나를 다룬다.
- Work는 하나의 명확한 목적과 검증 방법을 가진 작은 변경이다.
- Work는 별도 GitHub Issue로 만들지 않고 부모 Issue의 체크리스트와 Work PR로 관리한다.

## Phase Milestone

Milestone 제목은 다음 형식을 사용한다.

```text
Phase <번호>: <시연 가능한 결과>
```

```text
Phase 1: 예약 MVP
```

Milestone 설명에는 다음 항목을 기록한다.

```markdown
## 목표

- 이 Phase가 끝났을 때 시연할 수 있는 결과

## 완료 조건

- [ ] 사용자가 확인할 수 있는 조건
- [ ] 핵심 실패 경로의 처리 조건
- [ ] 필요한 통합 검증 조건

## 시연 시나리오

1. 사용자가 수행하는 동작
2. 확인할 정상 결과
3. 확인할 핵심 실패 결과

## 제외 범위

- 이번 Phase에서 다루지 않는 기능이나 기술

## 검증 계획

- 실행할 통합 테스트
- 수동으로 확인할 흐름
- 필요한 경우 측정할 값

## 위험과 의존성

- 선행 결정이나 외부 조건
- 현재 알고 있는 Phase 수준의 위험
- 없다면 `없음`
```

포함된 Issue는 Milestone 할당으로 관리하므로 설명에 다시 나열하지 않는다. Due date는 실제 일정이 있을 때만 설정한다.

Milestone을 만들 때는 [Phase Milestone template](docs/templates/PHASE_MILESTONE.md)을 복사해 사용한다. GitHub는 Milestone 설명용 template을 직접 지원하지 않으므로 저장소 문서로 관리한다.

## Issue 유형과 생성 기준

기본적으로 사용자 가치 Issue를 생성한다. 구현 중 발견한 문제는 다음 기준으로 처리한다.

- 현재 사용자 가치 Issue의 인수 조건을 만족하기 위한 수정이면 같은 Issue에 새 Work를 추가한다.
- 기존 Issue 범위를 넘어 독립된 재현, 원인 조사, 완료 조건, 검증 방법이 필요하면 기술 문제 Issue를 생성한다.
- 여러 기능에 공통으로 영향을 주거나 현재 Issue에서 해결하지 않고 후속으로 넘길 문제도 기술 문제 Issue로 분리한다.
- 일반적인 Git merge conflict나 한 Work 안에서 해결할 수 있는 단순 수정은 별도 Issue로 만들지 않는다.

기술 문제 Issue가 현재 Phase 완료를 막으면 현재 Milestone에 배정한다. 현재 Phase에서 허용 가능한 제한이면 다음 Milestone에 배정하고, 처리 시점을 정하지 않았다면 Milestone 없이 backlog로 둔다.

아직 Phase에 통합되지 않은 사용자 가치 Issue의 코드에 강하게 의존하는 문제는 별도 기술 문제 Issue보다 기존 Issue의 Work로 처리한다. 독립된 기술 문제 Issue의 브랜치와 병합 방식은 다른 Issue와 같다.

Issue 제목에는 `[I-#]`, `[BUG]`, 영역명 같은 접두사를 사용하지 않고 실제 사용자 결과나 확인된 문제를 적는다. 유형은 다음 label로 구분한다.

- 사용자 가치 Issue: `type:user-value`
- 기술 문제 Issue: `type:technical-problem`
- 기대 동작과 실제 동작이 다른 결함: 기술 문제 label과 함께 `bug` 추가

### 사용자 가치 Issue

제목은 사용자가 얻게 될 결과를 드러내도록 작성한다. Phase에 포함해 진행할 Issue는 해당 GitHub Milestone에 배정한다.

```text
날짜별로 예약 가능한 방을 조회한다
```

본문에는 다음 항목을 기록한다.

```markdown
## 문제와 목표

현재 불편하거나 불가능한 상황과 이 Issue가 끝난 뒤 사용자가 얻게 될 결과를 작성한다.

## 인수 조건

- [ ] 외부에서 확인할 수 있는 완료 조건
- [ ] 주요 경계 또는 실패 상황

## 제외 범위

- 이번 Issue에서 다루지 않는 것
- 없으면 `없음`

## Work 계획

- [ ] w1: 논리적 변경 목적 — 검증 방법
- [ ] w2: 논리적 변경 목적 — 검증 방법

## 미결정 사항

- 구현 전에 결정해야 할 API 계약, 사용자 동작, 데이터 또는 보안 관련 선택
- 없으면 `없음`
```

- `문제와 목표`에는 현재 상황과 완료 후 결과를 함께 적고 형식적인 사용자 스토리 문법을 강제하지 않는다.
- `인수 조건`에는 구현 방법이 아니라 외부에서 관찰 가능한 결과를 적는다.
- `제외 범위`와 `미결정 사항`은 필수로 검토하고 해당 내용이 없으면 `없음`으로 작성한다.
- 각 Work에는 하나의 논리적 변경 목적과 그 Work의 검증 방법을 함께 적는다.
- Work 계획은 발견한 사실에 따라 갱신할 수 있지만 첫 Work 브랜치를 만들기 전에는 현재 계획을 정리한다.
- 별도 `검증 계획` 항목은 두지 않는다. 기대 결과는 인수 조건, Work별 확인 방법은 Work 계획, 실제 통합 검증 결과는 Issue 통합 PR에 기록한다.

### 기술 문제 Issue

제목은 해결책이나 작업명이 아니라 확인된 문제나 증상을 드러내도록 작성한다.

```text
예약 목록 조회에서 N+1 쿼리가 발생한다
```

본문에는 다음 항목을 기록한다.

```markdown
## 문제와 영향

현재 확인된 문제와 해결하지 않을 때 영향을 받는 동작이나 범위를 작성한다.

## 재현 방법과 근거

문제를 다시 확인할 수 있는 절차와 테스트, 로그, 측정값, 관련 Issue·PR·개발 노트 등의 근거를 작성한다.

## 완료 조건

- [ ] 기술적으로 확인할 수 있는 해결 결과
- [ ] 기존 동작 보존 또는 핵심 실패 경로
- [ ] 회귀 검증 조건

## 제외 범위

- 이번 Issue에서 다루지 않는 것
- 없으면 `없음`

## Work 계획

- [ ] w1: 논리적 변경 목적 — 검증 방법
- [ ] w2: 논리적 변경 목적 — 검증 방법

## 미결정 사항

- 구현 전에 결정하거나 추가로 조사해야 할 것
- 없으면 `없음`
```

- `문제와 영향`에는 잘못된 동작, 성능 저하, 장애 가능성, 구조적 제약처럼 독립 Issue로 해결할 이유를 적는다.
- `재현 방법과 근거`에는 클릭 순서뿐 아니라 실패 테스트, 오류 로그, 측정값, 의존성 구조처럼 문제를 다시 확인할 수 있는 증거를 사용할 수 있다.
- `완료 조건`에는 특정 구현 방법이 아니라 문제가 해결되었다고 판단할 수 있는 결과를 적는다.
- `제외 범위`와 `미결정 사항`은 필수로 검토하고 해당 내용이 없으면 `없음`으로 작성한다.
- 원인이 아직 확인되지 않았다면 해결 방법을 Work로 확정하지 않고 재현과 원인 범위 축소를 먼저 계획한다.
- 원인, 검토한 해결책, 선택 이유처럼 조사하며 확인되는 내용은 개발 노트에 기록하고 관련 Work PR에서 연결한다.
- 별도 `추정 원인`, `해결 방법`, `검증 계획`, `환경`, `관련 항목` 필드는 두지 않는다. 필요한 환경과 관련 링크는 재현 근거에 포함하고, 실제 검증 결과는 Work PR과 Issue 통합 PR에 기록한다.

### Issue Form

- 사용자 가치 Issue는 `.github/ISSUE_TEMPLATE/user-value.yml`을 사용한다.
- 기술 문제 Issue는 `.github/ISSUE_TEMPLATE/technical-problem.yml`을 사용한다.
- template을 거치지 않는 빈 Issue 생성은 비활성화한다.
- 기대 동작과 실제 동작이 다른 결함은 기술 문제 Issue를 만든 뒤 `bug` label을 추가한다.
- Issue Form의 label 자동 지정이 동작하려면 같은 이름의 label이 저장소에 먼저 존재해야 한다.

## 식별자와 브랜치

- Phase 번호는 프로젝트 자체 순번이다.
- Issue 번호는 GitHub Issue 번호다.
- Work 번호는 부모 Issue 안에서 `w1`부터 시작한다.
- 브랜치 이름에는 영문 소문자, 숫자, `-`, `/`만 사용한다.

```text
phase/<phase-number>/<slug>
issue/<github-issue-number>/<slug>
work/<github-issue-number>-w<work-number>/<slug>
```

```text
phase/1/reservation-mvp
issue/12/create-reservation
work/12-w1/create-domain
work/12-w2/validate-time-range
```

## 브랜치와 병합

| 변경 | base 브랜치 | 병합 방식 |
|---|---|---|
| Work PR | 부모 Issue 브랜치 | squash merge |
| Issue 통합 PR | 부모 Phase 브랜치 | merge commit |
| Phase 통합 PR | `main` | merge commit |

- Work PR은 부모 Issue를 `Related to #<issue>`로 연결하고 자동 종료하지 않는다.
- Phase 통합 PR에서 포함된 Issue를 종료한다.
- 자식 브랜치는 최신 부모 브랜치를 merge하여 동기화한다: `main → phase → issue → work`.
- 공유된 브랜치는 rebase나 force push로 이력을 재작성하지 않는다.
- 병합 결과와 상위 브랜치 검증을 확인한 뒤 병합된 자식 브랜치를 로컬과 원격에서 삭제한다.

## Commit message

아래 Conventional Commit 형식은 일반 commit과 Work squash commit에 적용한다. Issue와 Phase의 merge commit은 계층 통합을 나타내므로 예외로 둔다.

백엔드 또는 프런트엔드 한 영역의 변경은 다음 형식을 사용한다.

```text
<type>(be|fe): <한글 요약>
```

저장소 전체에 걸친 변경은 scope를 생략한다.

```text
<type>: <한글 요약>
```

### Type

- `feat`: 새로운 기능이나 동작
- `fix`: 잘못된 동작 수정
- `refactor`: 동작을 유지한 구조 변경
- `perf`: 동작을 유지한 성능 개선
- `test`: 테스트만 변경
- `docs`: 문서만 변경
- `build`: 빌드 설정이나 의존성 변경
- `ci`: GitHub Actions 등 자동화 변경
- `chore`: 그 밖의 저장소 관리

### Scope

- scope는 `be`, `fe`만 허용한다.
- 저장소 전체 변경에는 scope를 사용하지 않는다.
- `reservation`, `domain`, `api`, `service` 같은 기능이나 계층 이름은 scope로 추가하지 않는다.

### 제목 요약

- 구체적인 대상과 실제 변화를 드러내는 한글 명사형으로 작성한다.
- 한 줄로 작성하고 마침표를 붙이지 않는다.
- 전체 제목은 50자 이내를 권장하고 72자를 넘기지 않는다.
- Issue, Work, PR 번호를 넣지 않는다.
- `작업`, `수정`, `변경`, `개선`, `처리`, `반영`, `기타`처럼 결과가 불분명한 표현을 단독으로 사용하지 않는다.

```text
feat(be): 예약 종료 시간 검증 추가
fix(be): 동일 시간 예약 허용 오류 차단
perf(be): 예약 조회의 N+1 제거
feat(fe): 예약 실패 사유 표시
docs: Git 운영 규칙 추가
```

### 본문

- 제목만으로 변경을 충분히 설명할 수 있으면 본문을 생략한다.
- 변경 이유, 비직관적인 동작, 중요한 제약 또는 의도적으로 제외한 범위가 있으면 본문을 작성한다.
- 제목과 본문 사이에는 빈 줄을 둔다.
- diff에서 바로 확인되는 파일 목록이나 제목의 반복은 적지 않는다.

```text
feat(be): 예약 종료 시간 검증 추가

종료 시간은 시작 시간보다 늦어야 한다.
시간 중복 검증은 다음 Work에서 처리한다.
```

### Commit 단위

- commit 하나에는 하나의 논리적 변화만 담는다.
- 구현과 그 동작을 직접 검증하는 테스트는 같은 commit에 포함한다.
- 목적이 다른 리팩터링, 문서, 설정 변경은 별도 commit으로 분리하거나 현재 Work에서 제외한다.
- 같은 동작을 Controller, Service, Repository 같은 파일이나 계층별 commit으로 인위적으로 나누지 않는다.
- 각 commit은 작업에 맞는 빌드나 테스트로 독립적으로 검증할 수 있어야 한다.
- 하나의 Work PR에 여러 commit이 포함될 수 있으며, Issue 브랜치에는 squash된 하나의 commit으로 병합한다.

## Line ending과 formatter

- 저장소의 일반 텍스트 파일은 LF와 UTF-8을 사용한다.
- Windows 전용 batch 파일인 `.bat`, `.cmd`만 CRLF를 사용한다.
- Git의 정규화 기준은 `.gitattributes`, 편집기 기본값은 `.editorconfig`로 관리한다.
- formatter를 도입할 때 line ending을 LF로 명시하고 `.gitattributes`와 충돌하지 않는지 확인한다.
- 기존 파일을 정규화해야 하면 `git add --renormalize .` 후 staged diff를 검토한다.
- 대량 formatter 변경은 기능 변경과 섞지 않고 별도의 논리적 commit으로 분리한다.

## PR 공통 체크리스트

PR 종류에 따라 `.github/PULL_REQUEST_TEMPLATE/`의 `work.md`, `issue.md`, `phase.md`를 사용한다. GitHub는 base나 branch 이름으로 여러 PR template 중 하나를 자동 선택하지 않으므로 PR 생성 URL의 `template` query parameter로 파일을 지정한다.

```text
template=work.md
template=issue.md
template=phase.md
```

모든 PR에서 다음 항목을 확인한다.

- [ ] 올바른 base 브랜치를 대상으로 한다.
- [ ] 연결한 상위 작업의 범위만 변경하며 관련 없는 변경을 포함하지 않는다.
- [ ] 필요한 검증을 실행하고 결과를 PR에 기록했다.
- [ ] 관련 문서·계약을 갱신했거나 갱신이 필요 없음을 확인했다.

PR 필수 여부, 필수 CI 통과, force push, 보호 브랜치 삭제처럼 자동 판정할 수 있는 항목은 이 체크리스트와 중복하지 않고 GitHub Rules나 저장소 설정으로 관리한다.

## AI의 PR 생성·병합 권한

AI는 사용자가 대상 작업을 특정해 명시적으로 지시한 경우에만 PR을 생성하거나 병합한다.

- 작업 진행, commit, push 또는 계획에 대한 승인을 PR 생성이나 병합 승인으로 확대 해석하지 않는다.
- PR 생성 승인과 병합 승인은 서로 별개다. PR을 만들라는 지시는 해당 PR의 병합까지 허용하지 않는다.
- 과거에 같은 종류의 작업을 승인했더라도 새로운 PR 생성이나 병합에는 다시 명시적 지시가 필요하다.
- 대상 PR, base 브랜치 또는 병합 방식이 불명확하면 실행 전에 사용자에게 확인한다.

## Work PR과 squash commit

Work PR 제목은 식별을 위해 다음 형식을 사용한다.

```text
[#<issue>-w<work>] <요약>
```

```text
[#12-w1] 예약 도메인 생성
```

Work PR에는 다음 항목을 기록한다.

- `Related to #<issue>` 형식의 부모 Issue 링크
- Work 번호와 이름
- 실제 변경 결과
- 계획과 달라진 점
- 제외 범위와 남은 사항
- 검증 방법과 결과
- 최종 squash commit message

### 계획과 달라진 점

계획과 실제 구현에 차이가 없으면 `없음`으로 작성한다. 차이가 있으면 다음 형식을 사용한다.

```markdown
- 계획:
- 실제:
- 변경 이유:
- 영향 및 후속 조치:
- 관련 개발 노트:
```

- 구현 세부 방식만 달라졌다면 Work PR에 기록한다.
- 의미 있는 기술 판단은 관련 개발 노트로 연결한다.
- Issue 범위나 인수 조건이 달라졌다면 부모 Issue도 갱신한다.
- API 계약, 데이터 또는 보안에 영향이 있다면 구현 전에 별도 결정을 거친다.

### Work 체크리스트

- [ ] 부모 Issue의 Work 번호·내용과 이 PR이 일치한다.
- [ ] squash commit message가 최종 diff와 일치한다.

Work PR template에 최종 squash commit message를 미리 작성한다. Squash merge 직전에 GitHub가 자동 생성한 메시지를 이 값으로 수정한다.

```text
feat(be): 예약 도메인 생성
```

## Issue·Phase 통합 PR과 merge commit

Issue 통합 PR 제목과 merge commit 제목은 다음 형식을 사용한다.

```text
[Issue #<issue>] <요약>
```

Phase 통합 PR 제목과 merge commit 제목은 다음 형식을 사용한다.

```text
[Phase <phase>] <요약>
```

```text
[Issue #12] 예약 생성 기능 통합
[Phase 1] 예약 MVP 통합
```

Issue와 Phase를 merge commit으로 병합할 때 PR 제목을 merge commit 제목으로 유지한다.

### Issue 통합 PR

Issue 통합 PR에는 다음 항목을 기록한다.

- `Related to #<issue>` 형식의 부모 Issue 링크
- 포함된 Work PR 목록
- Work를 합친 상태의 통합 결과
- 부모 Issue 인수 조건 또는 완료 조건의 검증 근거
- Issue 전체에 영향을 주는 계획과 달라진 점
- 남은 제한

Issue의 문제 배경, 목표, 인수 조건 원문과 Work별 구현 내용은 반복하지 않는다. Work 수준의 상세한 차이는 해당 Work PR이나 개발 노트로 연결한다. 계획과 달라진 점이나 남은 제한이 없으면 `없음`으로 작성한다.

다음 항목을 추가로 확인한다.

- [ ] 부모 Issue의 모든 필수 Work가 포함되었다.
- [ ] 부모 Issue의 Work 체크리스트를 현재 상태로 갱신했다.
- [ ] Work를 합친 상태에서 부모 Issue의 인수 조건 또는 완료 조건을 검증했다.
- [ ] 이 PR에서 부모 Issue를 자동 종료하지 않는다.

### Phase 통합 PR

Phase 통합 PR에는 다음 항목을 기록한다.

- 해당 GitHub Milestone 링크
- `Closes #<issue>` 형식의 포함된 Issue 목록
- Issue를 합친 상태의 Phase 통합 결과
- 사용자 시연 시나리오와 핵심 실패 경로
- Milestone 완료 조건의 검증 근거
- Phase 전체에 영향을 주는 계획과 달라진 점
- 알려진 제한과 후속 작업

Milestone의 목표·완료 조건 원문과 Issue별 배경·구현 내용·Work 목록은 반복하지 않는다. 계획과 달라진 점이나 알려진 제한이 없으면 `없음`으로 작성한다.

다음 항목을 추가로 확인한다.

- [ ] Milestone의 필수 Issue가 모두 Phase 브랜치에 통합되었다.
- [ ] Milestone 완료 조건을 통합된 상태에서 검증했다.
- [ ] 시연 시나리오와 핵심 실패 경로를 확인했다.
- [ ] `Closes` 목록이 실제 포함된 Issue와 일치한다.

## 실패 복구

- 충돌 중인 merge는 abort하여 시작 전 상태로 돌아갈 수 있어야 한다.
- 이미 push 또는 merge된 변경은 이력을 재작성하지 않고 revert나 수정 PR로 복구한다.
- `reset --hard`와 공유 브랜치 force push는 복구 방법으로 사용하지 않는다.

## GitHub Rules와 저장소 설정

### `protect-main`

대상은 `main`이다.

- PR을 통한 변경을 필수로 한다.
- 필요한 승인 수는 현재 `0`으로 둔다.
- 승인 수 `0`과 충돌하는 code owner, 마지막 push, 출처 미귀속 변경의 추가 승인 요구는 비활성화한다.
- 리뷰 대화를 모두 해결해야 병합할 수 있다.
- PR merge 방식은 merge commit만 허용한다.
- force push와 브랜치 삭제를 차단한다.
- CI를 구성한 뒤 필수 검사와 최신 base 반영 조건을 추가한다.

### `protect-integration-branches`

대상은 `phase/**/*`, `issue/**/*`다.

- PR을 통한 변경을 필수로 한다.
- 필요한 승인 수는 현재 `0`으로 둔다.
- 승인 수 `0`과 충돌하는 code owner, 마지막 push, 출처 미귀속 변경의 추가 승인 요구는 비활성화한다.
- 리뷰 대화를 모두 해결해야 병합할 수 있다.
- Phase와 Issue 브랜치를 함께 대상으로 하므로 merge commit과 squash merge를 허용하고 실제 방식은 브랜치·병합 표를 따른다.
- force push를 차단한다.
- 병합 후 브랜치를 삭제해야 하므로 브랜치 삭제는 허용한다.
- CI를 구성한 뒤 필수 검사와 최신 base 반영 조건을 추가한다.

### `protect-work-branches`

대상은 `work/**/*`다.

- force push를 차단한다.
- 개발 commit의 직접 push와 병합 후 브랜치 삭제는 허용한다.
- PR 필수 규칙은 적용하지 않는다.

### 적용하지 않는 규칙

- Issue와 Phase에 merge commit이 필요하므로 linear history를 요구하지 않는다.
- 현재 1인 저장소이므로 승인 1명을 요구하지 않는다.
- commit message는 merge commit 예외와 squash 흐름을 고려해 Rules로 강제하지 않는다.
- 필수 CI 검사는 실제 workflow를 만든 뒤 추가한다.

저장소에서는 squash merge와 merge commit을 허용하고 rebase merge는 비활성화한다. 병합 결과를 검증한 뒤 브랜치를 삭제하기 위해 자동 브랜치 삭제는 비활성화한다.
