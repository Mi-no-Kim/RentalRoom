# 변경 없는 영역의 CI job 건너뛰기

- **상태:** 로컬 분류·서식과 공통 변경 PR의 CI 검증 완료, 문서 전용 PR 검증 전
- **발견일:** 2026-10-08
- **관련 작업:** [Issue #4](https://github.com/Mi-no-Kim/RentalRoom/issues/4) w4
- **초기 분리 기록:** [Issue #17](https://github.com/Mi-no-Kim/RentalRoom/issues/17)

## 문제와 재현

[문서 전용 PR #16](https://github.com/Mi-no-Kim/RentalRoom/pull/16)의 [CI 실행](https://github.com/Mi-no-Kim/RentalRoom/actions/runs/37791175399)에서 `Formatting`, `Frontend`, `Backend` 세 job이 모두 시작했다. 프런트엔드·백엔드의 설치와 검사는 건너뛰었지만, 두 job은 runner에서 checkout과 변경 파일 판별 단계를 실행했다. Issue #3 w5의 단계별 검사 선택은 동작했으나, 문서 PR에서 관련 없는 job 자체를 시작하지 않으려는 기대에는 미치지 못했다.

처음에는 공통 CI 문제라는 이유로 Issue #17을 분리했다. 하지만 그 경로에서 Phase 브랜치까지 병합해도 진행 중인 Issue #4 브랜치에는 변경이 자동 반영되지 않아 PR #16에서 새 동작을 확인할 수 없다. 이 문제를 발견한 문서 PR에 먼저 적용하도록 Issue #4의 w4로 작업 경로를 바로잡는다.

## 검토한 방식

1. 기존처럼 각 job에서 변경 파일을 판별하면 판별 실패를 해당 필수 검사에서 보고할 수 있지만, 모든 job에 runner가 할당된다.
2. workflow 전체에 경로 필터를 걸면 필수 검사 결과가 대기 상태로 남을 수 있다.
3. 별도 판별 job을 추가할 수도 있지만 job이 네 개로 늘고, 판별 실패와 기존 필수 검사의 관계도 정해야 한다.
4. 항상 실행하는 `Formatting`에서 변경 파일을 판별하고 그 결과를 다른 job의 실행 조건으로 전달하면 기존 세 검사 이름을 유지할 수 있다.

## 선택과 영향

- `Formatting`에서 PR의 공통 조상 기준 변경 파일을 판별한다. 기존 `scripts/ci/should-check.sh`의 영역 규칙을 그대로 사용한다.
- 판별 결과를 job 출력으로 전달하고, `Frontend`와 `Backend`는 job 조건으로 필요한 영역에서만 시작한다. 문서 전용 PR은 두 job이 runner를 사용하기 전에 건너뛴다.
- 판별에 실패하면 `Formatting`이 실패한다. 성공 여부를 모르는 상태에서 검사를 통과시키지 않는다.
- 필수 검사 이름은 `Formatting`, `Frontend`, `Backend`로 유지한다. [GitHub Actions 문서](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions)에 따르면 조건으로 건너뛴 job의 필수 검사는 성공으로 취급된다.
- `Frontend`와 `Backend`는 `Formatting`이 끝난 후 시작하므로, 두 영역을 모두 검사하는 PR에서는 기존 병렬 실행보다 종료 시점이 늦어질 수 있다.

## 검증과 남은 한계

- 기존 commit을 사용한 변경 파일 판별 결과는 문서 `false/false`, 프런트엔드 `true/false`, 백엔드 `false/true`, CI 공통 파일 `true/true`였다. `push` 이벤트는 두 영역 모두 `true`였고 잘못된 PR SHA는 실패했다.
- Bash 구문 검사, 저장소 Prettier 검사, Git 공백 검사가 통과했다. `npm` 명령은 로컬 npm 설치 경로 오류로 시작되지 않아 동일한 Prettier CLI를 직접 실행했다.
- 초기 [PR #18의 CI 실행](https://github.com/Mi-no-Kim/RentalRoom/actions/runs/37796159122)에서 `Formatting`·`Frontend`·`Backend`가 모두 통과했다. 이 PR은 CI 설정 파일을 바꿔 공통 변경으로 분류됐으므로 세 job이 실행된 결과다.
- CI 설정 파일 자체의 변경은 공통 파일로 분류되어 이 설정 변경을 포함한 PR에서는 세 job이 모두 실행된다. 실제 문서 전용 PR의 job 건너뜀은 이 변경이 해당 PR의 대상 브랜치에 반영된 뒤 확인해야 한다.

## 연결

- **관련 코드:** `.github/workflows/ci.yml`, `scripts/ci/should-check.sh`
- **선행 결정:** [변경 영역에 따른 CI 검사 선택](2026-10-08-selective-ci-checks.md)
