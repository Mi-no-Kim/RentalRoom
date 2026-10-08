# 변경 영역에 따른 CI 검사 선택

- **상태:** 로컬 분류·서식 검증 완료, 원격 PR 검증 전
- **발견일:** 2026-10-08
- **관련 기능:** GitHub Actions 품질 검사

## 배경

기존 CI는 문서만 수정한 PR에도 프런트엔드 빌드와 백엔드 통합 테스트를 실행했다. 세 job 이름 `Formatting`, `Frontend`, `Backend`는 보호 브랜치의 필수 검사로 등록되어 있어 유지해야 한다.

## 검토한 방식

1. workflow 전체를 파일 경로로 건너뛰면 필수 검사 상태가 대기 중으로 남아 병합을 막을 수 있다.
2. job 전체를 조건부로 건너뛰면 성공 상태가 되지만, 변경 파일 판별 실패가 검사를 건너뛰는 결과로 이어질 수 있다.
3. 필수 job은 항상 시작하고 내부에서 변경 파일을 판별하면, 판별 오류를 해당 필수 검사 실패로 보고할 수 있다.

## 결정

- `Formatting`은 모든 PR과 `main` push에서 Prettier만 실행한다. 로컬 `npm run format:check`는 Prettier와 Spotless를 모두 검사한다.
- `Frontend`와 `Backend`는 항상 상태를 보고하되, PR의 변경 파일에 따라 실제 검사 단계를 실행한다. `Backend`의 Gradle `check`가 Spotless와 테스트를 함께 검사한다.
- `docs/`와 Markdown 파일만 변경한 PR은 두 영역의 실제 검사를 건너뛴다. `frontend/`와 루트 npm 의존성 파일은 프런트엔드, `backend/`는 백엔드 변경이다.
- CI 설정처럼 공통 파일과 분류되지 않은 파일은 두 영역을 모두 검사한다. `main` push에서도 둘 다 검사한다.
- 변경 파일 판별 명령이 실패하면 해당 job도 실패한다. 검사 대상을 알 수 없는 상태를 성공으로 처리하지 않는다.

## 검증과 남은 한계

- 기존 commit의 변경 파일 목록을 사용해 문서 전용(`false/false`), 프런트엔드 전용(`true/false`), 백엔드 전용(`false/true`), CI 공통 및 혼합 변경(`true/true`)을 확인했다. `main` push는 두 영역 모두 `true`였고 PR SHA 누락 시 분류 명령이 실패했다.
- Bash 구문 검사, Prettier 검사와 `git diff --check`가 통과했다.
- w5 PR의 필수 검사 결과는 PR 생성 후 확인한다. 변경 유형별 실제 GitHub PR은 검증용으로 만들지 않는다. 후속 실제 PR에서 예상과 다른 동작이 발견되면 수정한다.

## 연결

- **관련 코드:** `.github/workflows/ci.yml`, `scripts/ci/should-check.sh`
- **선행 결정:** [영역별 CI 검사 구성](2026-10-05-ci-foundation.md)
