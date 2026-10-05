# 영역별 CI 검사 구성

- **상태:** 로컬·원격 검증 완료, 대상 Ruleset 연결 확인
- **발견일:** 2026-10-05
- **관련 기능:** GitHub Actions 품질 검사

## 배경

- 로컬에서는 `npm run verify`로 전체 검사를 순차 실행하지만 CI에서는 실패 영역을 빠르게 구분하고 서로 독립적으로 실행할 구성이 필요했다.
- 저장소에는 루트 Node workspace와 `backend/` Gradle 프로젝트가 함께 있어 검사별 실행 환경이 다르다.
- backend 통합 테스트는 Testcontainers PostgreSQL을 사용하므로 CI runner에서도 Docker가 필요하다.

## 관찰

- formatting 검사는 Prettier뿐 아니라 backend Spotless도 호출하므로 Node.js와 Java가 모두 필요하다.
- frontend 검사는 npm 의존성을 설치한 뒤 lint, test와 production build를 실행해야 한다.
- backend `check`는 formatting과 테스트를 함께 검증하고 Testcontainers가 임시 PostgreSQL을 시작한다.
- `backend/gradlew`에 실행 권한이 없으면 Linux runner에서 Wrapper를 직접 실행할 수 없다.

## 고민한 선택지

1. CI에서 `npm run verify` 하나만 실행하면 구성이 단순하지만 한 job에 모든 환경과 검사가 묶인다.
2. formatting, frontend와 backend를 별도 job으로 나누면 일부 설치가 중복되지만 실패 원인이 분명하고 독립 실행할 수 있다.
3. Compose PostgreSQL을 별도 service로 실행하면 로컬 실행 환경과 비슷하지만 Testcontainers가 이미 테스트 생명주기와 연결 정보를 관리하므로 중복된다.

## 결정과 수정

- pull request와 `main` branch push에서 실행되는 `.github/workflows/ci.yml`을 추가했다.
- CI job 이름을 Ruleset에서 그대로 사용할 수 있도록 `Formatting`, `Frontend`, `Backend`로 고정했다.
- `Formatting`은 Node.js 24와 Java 21에서 `npm run format:check`를 실행한다.
- `Frontend`는 Node.js 24에서 npm clean install 후 lint, test와 production build를 실행한다.
- `Backend`는 Temurin Java 21에서 Gradle `check`를 실행한다.
- npm과 Gradle 의존성은 공식 setup action의 cache 기능을 사용한다.
- CI 권한은 checkout에 필요한 `contents: read`만 선언했다.
- Linux runner가 Gradle Wrapper를 직접 실행할 수 있도록 `backend/gradlew` 실행 권한을 저장소에 기록한다.
- backend 테스트 데이터베이스는 별도 Compose service 없이 Testcontainers가 관리한다.

## 검증

- `npm run verify`: exit code 0
- Prettier와 Spotless 검사 통과
- frontend ESLint warning 0건
- frontend 테스트 파일 2개, 테스트 3개 통과
- frontend TypeScript 검사와 Vite production build 통과
- backend Gradle `check` 성공
- PR #2의 GitHub-hosted runner에서 `Formatting`, `Frontend`, `Backend` 세 job 성공: https://github.com/Mi-no-Kim/RentalRoom/actions/runs/37289962547
- 세 check run의 source가 GitHub Actions app ID `15368`임을 확인했다.
- `protect-main`과 `protect-integration-branches`에서 세 job을 필수 check로 설정하고 최신 base 반영 조건을 켠 것을 원격 API 재조회로 확인했다.
- `protect-work-branches`의 기존 force push 차단 규칙은 그대로 유지했다.

## 남은 내용

- 실제 Phase·Issue PR에서 필수 check와 최신 base 조건의 병합 차단 동작은 아직 확인하지 않았다.

## 연결

- **관련 코드·테스트:** `.github/workflows/ci.yml`, `package.json`, `backend/build.gradle.kts`
- **포트폴리오 후보:** CI 품질 게이트 구성 후보
- **TIL 주제:** 해당 없음
