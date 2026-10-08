# 프런트엔드 ESLint를 코드 오류 예방에 한정

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 프런트엔드 lint

## 배경

- 프런트엔드 기반에 TypeScript 검사와 테스트는 있었지만 React Hooks와 TanStack Query의 사용 오류를 조기에 찾는 정적 검사가 없었다.
- 저장소 formatting은 이미 Prettier가 담당하므로 ESLint에는 코드 동작과 유지보수에 영향을 주는 규칙만 필요했다.

## 관찰

- 처음 설치된 TypeScript 7.0.2는 typescript-eslint 8.71.0의 peer dependency 범위인 `>=4.8.4 <6.1.0`을 벗어나 npm 설치가 `ERESOLVE`로 중단됐다.
- `--force`나 `--legacy-peer-deps`를 사용하면 설치는 가능하지만 지원하지 않는 compiler와 parser 조합으로 lint 결과의 신뢰성이 떨어질 수 있다.
- typescript-eslint의 `recommended` preset은 correctness 중심이고 formatting 규칙을 활성화하지 않는다.
- typed lint는 더 깊은 검사가 가능하지만 TypeScript project 분석 비용과 초기 설정 복잡도가 추가된다.

## 고민한 선택지

1. 강제 설치로 TypeScript 7을 유지하면 현재 compiler를 보존할 수 있지만 공식 지원 범위를 벗어난다.
2. ESLint를 보류하면 호환성 문제는 피하지만 Hooks와 Query 사용 오류를 검사하지 못한다.
3. TypeScript를 지원 범위 안의 최신 6.0.3으로 낮추면 강제 옵션 없이 공식 권장 preset을 사용할 수 있다.
4. type-aware·strict·stylistic preset까지 활성화하면 검사 범위가 넓지만 Spring 학습을 보조하는 최소 프런트엔드 기준을 넘어선다.

## 결정과 수정

- TypeScript를 7.0.2에서 6.0.3으로 변경했다.
- ESLint 10 flat config를 사용하고 JavaScript·typescript-eslint의 안정적인 `recommended` preset을 적용했다.
- React Hooks의 `recommended`와 TanStack Query의 `flat/recommended`를 application source에 적용했다.
- application source에는 browser globals, Vite와 ESLint 설정 파일에는 Node globals를 분리해 지정했다.
- strict, stylistic, type-aware lint와 ESLint formatting 규칙은 초기 구성에서 제외했다.
- `npm run lint --workspace frontend`가 warning도 실패로 처리하도록 `--max-warnings 0`을 사용했다.
- 자동 수정 명령은 실제 필요가 생기기 전에는 추가하지 않았다.

## 검증

- ESLint package 설치 후 npm audit에서 알려진 취약점 0건 확인
- `npm run lint --workspace frontend`: 오류·warning 없이 통과
- `npm run test --workspace frontend`: 기존 component·설정 테스트 통과
- `npm run build --workspace frontend`: TypeScript 검사와 Vite production build 통과
- `npm run format:check`: Prettier와 Spotless 검사 통과

## 남은 내용

- 실제 코드에서 타입 정보가 필요한 문제가 반복되면 `recommended-type-checked` 도입 비용과 효과를 다시 검토한다.
- 후속 완료: CI의 frontend job에서 lint, test와 build를 각각 실행한다. [관련 기록](2026-10-05-ci-foundation.md)
- TypeScript 7은 typescript-eslint가 공식 지원한 뒤 별도 dependency update로 검토한다.

## 연결

- **관련 코드·테스트:** `frontend/eslint.config.js`, `frontend/package.json`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** 해당 없음
