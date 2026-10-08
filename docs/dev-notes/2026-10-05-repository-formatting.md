# 저장소 formatting을 Prettier와 Spotless로 통합

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 저장소 전체 formatting

## 배경

- 백엔드 Java와 Gradle Kotlin DSL은 이미 Spotless로 검사하고 있었지만 Markdown, JSON, YAML과 프런트엔드 파일에는 저장소 공통 formatter가 없었다.
- 프런트엔드 기반이 생긴 뒤 전체 파일을 한 번에 정리하는 명령과 변경 없이 검사하는 명령이 필요했다.
- 루트 Node package는 formatting 진입점만 담당하고 프런트엔드와 백엔드의 build, test, lint는 각 package의 명령으로 유지해야 했다.

## 관찰

- Prettier 공식 문서는 patch release에서도 결과가 달라질 수 있으므로 정확한 버전을 설치하도록 권장한다.
- Prettier는 루트 `.gitignore`와 `.prettierignore`를 따르지만 중첩된 `backend/.gitignore`의 `HELP.md`는 루트 실행에서 별도로 제외해야 했다.
- Windows에서는 Node가 `.bat` 파일을 직접 실행하기보다 `cmd.exe`를 통해 Gradle Wrapper를 호출해야 한다.
- 제한된 실행 환경에서 Gradle 사용자 cache에 접근하지 못하면 Wrapper 단계가 실패할 수 있지만 일반 로컬 실행에서는 기존 사용자 Gradle cache를 사용한다.

## 고민한 선택지

1. Prettier와 Spotless 명령을 따로 실행하면 구현은 단순하지만 전체 formatting 검사를 놓치기 쉽다.
2. 별도 task runner를 추가하면 여러 도구를 묶기 쉽지만 현재 규모에는 불필요한 의존성이 된다.
3. Node 표준 `child_process`로 운영체제에 맞는 Gradle Wrapper를 선택하면 추가 의존성 없이 공통 npm 명령을 제공할 수 있다.

## 결정과 수정

- 루트 package에 Prettier `3.9.9`를 정확한 버전으로 설치했다.
- `.prettierrc.json`에서 LF와 `proseWrap: preserve`를 명시했다.
- `.prettierignore`에서 dependency, build, coverage, lockfile, 생성 파일과 로컬 문서를 제외했다.
- `scripts/run-backend-gradle.mjs`가 Windows에서는 `gradlew.bat`, 그 외 운영체제에서는 `./gradlew`로 Spotless를 실행하도록 구성했다.
- `npm run format`은 Prettier 적용 후 Spotless 적용을 실행하고 `npm run format:check`는 두 formatter를 변경 없이 검사한다.
- Prettier와 Spotless는 개별 npm script로도 실행할 수 있게 했다.

## 검증

- `npm run format`: Prettier와 Spotless 적용 성공
- `npm run format:check`: 모든 대상이 formatter 기준을 만족하고 백엔드 Spotless build 성공
- `npm run test --workspace frontend`: 테스트 파일 2개, 테스트 3개 통과
- `npm run build --workspace frontend`: TypeScript 검사와 Vite production build 통과
- `backend/gradlew.bat check`: 백엔드 check 성공
- `git diff --check`: whitespace 오류 없음

## 남은 내용

- 후속 변경: 초기 CI의 formatting job은 `npm run format:check`를 실행했다. 현재는 Prettier만 실행하고, 백엔드 Spotless는 변경 영역에 따라 Gradle `check`에서 검사한다. [초기 구성](2026-10-05-ci-foundation.md), [현재 구성](2026-10-08-selective-ci-checks.md)
- 후속 완료: 프런트엔드 linter의 역할과 규칙을 별도로 정했다. [관련 기록](2026-10-05-frontend-eslint.md)

## 연결

- **관련 코드·테스트:** `package.json`, `.prettierrc.json`, `.prettierignore`, `scripts/run-backend-gradle.mjs`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** 해당 없음
