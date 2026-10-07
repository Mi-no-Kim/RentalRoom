# 회원가입 중복을 DB 제약에서 판정하고 API 오류로 변환하기

- **상태:** 가입 `POST` 구현·검증 완료, 사전 중복 확인 `GET`은 후속
- **발견일:** 2026-10-07
- **관련 기능:** Issue #3 w2 회원가입

## 배경

- 아이디와 닉네임은 각각 영문 대소문자를 무시해 고유해야 한다. PostgreSQL의 `lower(...)` 고유 인덱스가 최종 저장을 제한한다.
- 처음에는 서비스에서 저장 전에 중복을 조회했지만, 조회와 삽입 사이에 다른 요청이 같은 값을 저장할 수 있다. DB가 거부한 충돌도 가입 계약의 필드별 `409`로 응답해야 했다.

## 관찰

- 서비스의 사전 조회만으로는 DB 고유 인덱스가 거부한 경우를 처리하지 못한다.
- 비밀번호 인코딩은 저장 전에 실행된다. 사전 조회를 없애면 중복 요청에도 PBKDF2 인코딩 비용이 든다.
- 가입 화면의 아이디·닉네임 사전 중복 확인을 도입하기로 했으나, 조회 API와 화면은 아직 구현되지 않았다. 중복 가입 요청이 얼마나 줄어들지는 측정하지 않았다.

## 고민한 선택지

1. 서비스의 사전 조회만 사용하면 일반적인 중복을 일찍 알 수 있지만 조회 후 삽입 전 충돌을 막지 못한다.
2. 사전 조회와 DB 충돌 처리를 함께 사용하면 일반적인 중복에서 비밀번호 인코딩을 피할 수 있다. 정상 가입에도 조회가 추가되고 두 처리 경로를 유지해야 한다.
3. DB 충돌만 API 오류로 변환하면 가입 `POST`의 중복 판단 경로가 하나로 단순해진다. 중복 요청도 인코딩을 거치며, 실제 성능 차이는 요청 비율과 DB 조회 비용을 측정해야 알 수 있다.

## 결정과 수정

- 사용자는 가입 `POST`에서 서비스의 아이디·닉네임 사전 중복 조회를 제거하고 DB 제약을 최종 판정 기준으로 선택했다.
- `MemberExceptionHandler`는 `DataIntegrityViolationException`의 원인에서 Hibernate 제약 위반과 인덱스 이름을 확인한다. 두 고유 인덱스에 해당하면 각각 `LOGIN_ID_ALREADY_USED/loginId` 또는 `NICKNAME_ALREADY_USED/nickname`의 `409`를 반환하고, 알 수 없는 제약 오류는 그대로 다시 던진다.
- 가입 전 조회는 사용자의 입력 편의를 위한 별도 `GET` 계약으로 정했다. 조회 결과가 가입 시점까지 값을 예약하지 않으므로 `POST`의 DB 제약과 `409` 처리는 유지한다.

## 검증

- PostgreSQL Testcontainers 마이그레이션 테스트에서 대소문자만 다른 아이디·닉네임의 삽입 거부와 같은 성·이름 허용을 확인했다.
- `MemberSignUpIntegrationTests`에서 아이디 중복과 대소문자만 다른 닉네임 중복을 각각 필드별 `409`로 확인했다. 정상 가입·대표 입력 오류·이름 중복 허용 테스트도 통과했다.
- 2026-10-07 `gradlew.bat check --rerun-tasks --no-daemon`에서 Spotless·컴파일·테스트가 모두 통과했다. 테스트 결과 XML에는 가입 테스트 5개, 마이그레이션 테스트 1개, 앱 테스트 1개가 모두 실패 0건으로 기록됐다. 이 실행은 Docker Desktop의 활성 Linux 엔진 주소를 `DOCKER_HOST`에 지정했다.

## 남은 내용

- 동시에 같은 값으로 가입하는 요청을 별도 테스트로 재현하지는 않았다. 최종 고유성은 PostgreSQL 인덱스에 의존한다.
- 사전 중복 확인 `GET`과 화면은 아직 구현 전이다. 중복 요청 빈도, PBKDF2 낭비, 사전 조회의 총비용은 측정하지 않았다.
- 인덱스 이름을 바꾸면 예외 처리기의 이름 매핑도 함께 변경해야 한다.

## 연결

- **관련 코드·테스트:** `backend/src/main/java/com/minokim/rentalroom/member/service/MemberService.java`, `backend/src/main/java/com/minokim/rentalroom/member/controller/MemberExceptionHandler.java`, `backend/src/test/java/com/minokim/rentalroom/member/MemberSignUpIntegrationTests.java`
- **API 계약:** `docs/api/member-sign-up.md`
- **포트폴리오 후보:** 미정 (동시 요청이나 성능 비교 실험은 수행하지 않음)
- **TIL 주제:** 해당 없음
