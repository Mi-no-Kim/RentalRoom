# 백엔드 formatting을 Spotless로 통합

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 백엔드 개발 기반

## 배경

- Java 소스와 Gradle Kotlin DSL의 서식을 개발자와 실행 환경에 관계없이 같은 기준으로 검사할 도구가 필요했다.
- 자동 수정과 변경 없는 검사를 분리하고, 표준 Gradle `check`와 `build`에서도 위반을 발견해야 했다.
- Java formatter, Kotlin DSL formatter와 일반 파일 처리를 각각 중복 plugin으로 구성하지 않고 한 진입점에서 관리하려 했다.

## 버전 선택

- Spotless Gradle plugin `8.10.3`: Gradle Plugin Portal에서 확인한 안정 버전이다.
- Palantir Java Format `2.98.0`: Spotless 8.10.3이 기본값으로 함께 검증한 버전을 명시적으로 고정했다.
- ktlint `1.8.0`: `2.0.0-ALPHA` 계열을 제외한 안정 버전을 고정했다.
- 현재 Gradle Wrapper 9.7.1과 Java 21 조합에서 실제 task 실행으로 호환성을 확인했다.

## 결정과 수정

- `backend/build.gradle.kts`에 `com.diffplug.spotless` plugin을 추가했다.
- 모든 Spotless 대상에 LF line ending을 명시했다.
- `src/main/java`와 `src/test/java`의 Java 파일에 Palantir Java Format을 적용하고 생성 코드 경로는 제외했다.
- Java의 사용하지 않는 import를 제거하고 wildcard import를 금지했다.
- 별도 import 순서, wildcard 자동 확장, license header는 추가하지 않았다.
- 백엔드 루트의 `*.gradle.kts`에는 Spotless의 `kotlinGradle`과 ktlint를 사용했다.
- 루트 `.editorconfig`에 Kotlin DSL의 공백 4칸과 `ktlint_official` 스타일을 기록했다.
- Gradle Wrapper와 향후 `src` 아래의 `.properties` 파일에는 trailing whitespace 제거와 마지막 줄바꿈만 적용했다.
- YAML과 JSON은 이후 루트 Prettier가 담당하므로 백엔드 Spotless 대상에 넣지 않았다.
- Checkstyle, SpotBugs, PMD, Error Prone 같은 추가 정적 분석은 현재 범위에서 제외했다.

## 명령 구분

- `spotlessApply`: 대상 파일을 정해진 형식으로 직접 수정한다.
- `spotlessCheck`: 파일을 수정하지 않고 위반이 있으면 실패한다.
- 표준 `check`와 `build`는 `spotlessCheck`를 포함한다.

## 검증

- `spotlessApply`가 6개 task를 실행하고 성공했다.
- 자동 수정은 `build.gradle.kts`와 기존 Java 운영·테스트 파일 2개에만 발생했으며 동작 코드는 바뀌지 않았다.
- Gradle Wrapper properties는 이미 기준을 만족해 내용 변경이 없었다.
- `spotlessCheck test build --rerun-tasks`가 `BUILD SUCCESSFUL in 49s`로 끝났고 13개 task가 실행됐다.
- Compose PostgreSQL을 중지한 상태에서도 Testcontainers PostgreSQL을 사용하는 테스트가 통과했다.
- `build --dry-run`에서 `spotlessJavaCheck`, `spotlessKotlinGradleCheck`, `spotlessPropertiesCheck`, `spotlessCheck`가 `check`와 `build`보다 먼저 연결된 것을 확인했다.
- `git diff --check`가 통과했다.

## 남은 내용

- 후속 완료: 루트 Prettier 설정과 formatting 통합 명령을 추가했다. [관련 기록](2026-10-05-repository-formatting.md)
- 후속 변경: 초기 CI formatting job에서 Spotless를 실행했다. 현재는 백엔드 변경 시 Backend job의 Gradle `check`에서 검사한다. [초기 구성](2026-10-05-ci-foundation.md), [현재 구성](2026-10-08-selective-ci-checks.md)

## 근거

- [Spotless Gradle plugin](https://plugins.gradle.org/plugin/com.diffplug.spotless)
- [Spotless Gradle 사용법](https://github.com/diffplug/spotless/blob/main/plugin-gradle/README.md)
- [Palantir Java Format](https://github.com/palantir/palantir-java-format)
- [ktlint releases](https://github.com/ktlint/ktlint/releases)

## 연결

- **관련 코드·설정:** `.editorconfig`, `backend/build.gradle.kts`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** 해당 없음
