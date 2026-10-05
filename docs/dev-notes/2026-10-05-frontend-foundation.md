# REST API 학습을 위한 프런트엔드 기반 구성

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 프런트엔드 실행 기반

## 배경

- 이 프로젝트의 중심은 Spring 학습이며 프런트엔드는 REST API의 요청, 응답, 오류와 서버 데이터 갱신을 확인하고 시연하는 역할을 맡는다.
- 화면 구현에 필요한 반복 작업은 줄이되 HTTP 동작과 서버 응답이 프런트엔드 추상화에 가려지지 않아야 했다.

## 관찰

- CSS Modules는 일반 CSS를 명시적으로 다룰 수 있지만 컴포넌트마다 이름과 파일을 관리하는 시간이 든다.
- TanStack Query는 서버 상태의 loading, success, error와 mutation 이후 재조회를 제공하지만 기본 자동 재시도와 창 focus 재조회는 Spring 요청 로그를 관찰할 때 숨은 요청처럼 보일 수 있다.
- Vite의 React TypeScript template에는 linter 설정도 포함되지만 프로젝트의 linter 기준은 아직 확정하지 않았다.
- Vitest에서 전역 API를 활성화하지 않은 구성은 React Testing Library의 자동 cleanup 조건을 만족하지 않아 첫 테스트의 DOM이 다음 테스트에 남았다.

## 고민한 선택지

1. CSS Modules와 직접 작성한 React 서버 상태를 사용하면 의존성은 줄지만 프런트엔드 보조 코드가 늘어난다.
2. Tailwind CSS와 TanStack Query를 사용하면 화면과 서버 상태 구현이 빨라지지만 자동화된 동작의 범위를 명시해야 한다.
3. Vite template 전체를 생성하면 빠르지만 아직 결정하지 않은 ESLint 구성이 함께 들어온다.
4. 확정된 Vite 기반 파일만 구성하면 초기 파일은 직접 관리해야 하지만 미결정 사항을 확정하지 않을 수 있다.

## 결정과 수정

- npm workspace 아래 `frontend/` application package를 만들었다.
- React, TypeScript, Vite와 React Router로 SPA 실행 기반과 기본 404 경로를 구성했다.
- Tailwind CSS를 기본 styling으로 사용하고 CSS Modules는 초기 구성에서 제외했다.
- TanStack Query는 native `fetch` 위에서 서버 상태만 관리하도록 두고 초기에는 query와 mutation의 자동 재시도, 창 focus 재조회를 껐다.
- optimistic update는 사용하지 않고 실제 기능에서는 쓰기 성공 후 관련 query를 invalidate해 서버 상태를 다시 확인한다.
- Vitest와 React Testing Library를 구성하고 테스트마다 `cleanup()`을 명시해 DOM을 격리했다.
- linter를 임의로 선택하지 않기 위해 Vite template 전체 대신 확정된 실행·테스트 파일만 추가했다.

## 검증

- `npm run test --workspace frontend`: 테스트 파일 2개, 테스트 3개 통과
- `npm run build --workspace frontend`: TypeScript 검사와 Vite production build 통과
- 실제 브라우저에서 홈 화면의 Tailwind 적용, 알 수 없는 경로의 404 표시와 홈 복귀를 확인했다.
- 브라우저 console warning과 error가 없음을 확인했다.
- npm 설치 결과 알려진 취약점은 0건이었다.

## 남은 내용

- 실제 Spring API가 정해지면 HTTP 상태와 오류 본문을 보존하는 공통 `fetch` 경계를 추가한다.
- 프런트엔드 linter와 구체적인 규칙은 별도 결정이 필요하다.
- caching, 선택적 retry와 optimistic update는 기본 CRUD 흐름을 확인한 뒤 필요성을 검토한다.

## 연결

- **관련 코드·테스트:** `frontend/src/app/`, `frontend/vite.config.ts`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** 해당 없음
