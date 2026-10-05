# 로컬 전체 검증을 하나의 npm 명령으로 통합

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 로컬 개발 검증

## 배경

- formatting, frontend lint·test·build와 backend check가 각각 구성돼 있었지만 개발자가 commit이나 PR 전에 모든 명령을 직접 순서대로 실행해야 했다.
- CI는 실패 원인과 실행 환경을 분리하기 위해 영역별 job을 유지해야 하지만 로컬에서는 한 명령으로 전체 상태를 확인할 필요가 있었다.

## 관찰

- 루트 Node package는 처음에 formatting 진입점만 담당하도록 제한했기 때문에 전체 검증 명령이 없었다.
- backend Gradle Wrapper 파일 이름이 Windows와 macOS/Linux에서 다르므로 package script에 직접 고정하면 cross-platform 실행이 어렵다.
- backend 통합 테스트가 실제로 실행되면 Testcontainers가 Docker를 사용한다.

## 고민한 선택지

1. 모든 명령을 계속 개별 실행하면 구성은 단순하지만 일부 검증을 빠뜨릴 수 있다.
2. CI workflow를 로컬에서 재사용하면 실행 환경과 debugging이 복잡해지고 CI job 분리 원칙도 흐려진다.
3. 루트 npm script가 기존 검증 명령을 순차 호출하면 추가 task runner 없이 실패를 즉시 전달할 수 있다.

## 결정과 수정

- 루트에 로컬 전용 `npm run verify` 명령을 추가했다.
- `verify`는 formatting 검사, frontend lint·test·production build, backend Gradle `check` 순서로 실행한다.
- 각 단계는 `&&`로 연결해 앞 단계가 실패하면 즉시 중단한다.
- backend 실행 script를 `run-backend-gradle.mjs`로 일반화하고 허용된 Gradle task만 실행하도록 제한했다.
- 루트 Node package의 책임을 formatting 진입점에서 로컬 통합 검증 진입점까지 확장했다.
- CI는 `verify`를 호출하지 않고 formatting, frontend와 backend 명령을 별도 job에서 직접 실행한다.

## 검증

- `npm run verify`: exit code 0
- Prettier와 Spotless 검사 통과
- frontend ESLint warning 0건
- frontend 테스트 파일 2개, 테스트 3개 통과
- frontend TypeScript 검사와 Vite production build 통과
- backend Gradle `check` 성공

## 남은 내용

- backend 테스트 실행 시 Docker Desktop이 필요하다는 조건을 유지한다.
- CI에서는 로컬 편의 명령을 재사용하지 않고 job별 명령을 명시한다.

## 연결

- **관련 코드·테스트:** `package.json`, `scripts/run-backend-gradle.mjs`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** 해당 없음
