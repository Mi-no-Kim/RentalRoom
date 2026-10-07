# 회원가입 요청이 기본 보안 설정에서 차단됨

- **상태:** 정상 가입·중복·입력 오류 수동 확인과 통합 테스트 통과
- **발견일:** 2026-10-07
- **관련 기능:** Issue #3 w2 회원가입 API

## 문제와 관찰

- 로컬 PostgreSQL을 시작하고 백엔드가 기동한 뒤, 사용자가 Postman의 `POST /api/members`에서 처음 `401 Unauthorized`를 받았다.
- 당시 `SecurityFilterChain` 빈이 없었고, Spring Security 의존성이 포함되어 있었다. 기본 보안 설정이 공개 회원가입 요청보다 먼저 적용되는 상태였다.

## 선택과 수정

- 사용자가 `SecurityConfig.securityFilterChain`을 작성해 `POST /api/members`에 `permitAll`을 적용하고, `/api/members` 경로를 CSRF 검사에서 제외했다.
- 다른 요청에는 `authenticated` 규칙을 두었다. 로그인 방식은 아직 결정하지 않았다.

## 검증과 남은 내용

- 사용자가 재요청에서 `201 Created`를 받았다고 보고했다. 정상 요청이 보안 필터를 통과해 회원가입 성공 응답까지 도달한 증거다.
- 같은 JSON을 다시 보내 `409 Conflict`와 `{"code":"LOGIN_ID_ALREADY_USED","field":"loginId"}`를 받았다고 보고했다. 현재 구현에서는 DB 고유 인덱스 충돌을 해당 API 오류로 변환한다.
- 아이디만 사용하지 않은 값으로 바꾸고 닉네임을 유지했을 때 닉네임 중복 `409`와 계약한 오류 응답이 나왔다고 보고했다.
- 한 종류의 문자만 포함한 비밀번호 `abcdefgh`에 대해 `400 Bad Request`와 `{"code":"INVALID_INPUT","field":"password"}`를 받았다고 보고했다. 서비스의 비밀번호 문자 종류 검사가 동작했다.
- 5자인 아이디 `abc12`에 대해 `400 Bad Request`와 `{"code":"INVALID_INPUT","field":"loginId"}`를 받았다고 보고했다. DTO 길이 검증의 오류 응답 경로가 동작했다.
- 사용자가 `MemberSignUpIntegrationTests`에서 MockMvc 요청의 `201`·빈 본문과 Repository 조회로 저장된 아이디·이름·닉네임을 단언했다. 기존 `existsByLoginId`와 별개로, 로그인에서도 사용할 `Optional<Member> findByLoginId(String)`를 추가했다.
- 사용자가 저장 비밀번호를 `passwordEncoder.matches(...)`로 검증하도록 테스트를 보강하고 중복·입력 오류의 HTTP 검증을 추가했다.
- 2026-10-07 AI가 `gradlew.bat check --rerun-tasks --no-daemon`을 실행해 가입 통합 테스트 5개를 포함한 전체 7개 테스트의 실패 0건을 확인했다. Docker Desktop 활성 Linux 엔진 주소는 해당 실행의 `DOCKER_HOST`로 지정했다.
