# 회원가입 고유성을 PostgreSQL에서 보장하기

- **상태:** 해결 (DB 제약), API 충돌 응답은 별도 결정 노트에 기록
- **발견일:** 2026-10-07
- **관련 기능:** Issue #3 w2 회원가입 저장

## 배경

- 가입 계약은 아이디와 닉네임의 영문 대소문자 차이를 중복으로 보며, 성·이름 중복은 허용한다.
- 서비스의 `existsBy...` 조회만으로는 동시 삽입의 중복을 막을 수 없다.
- 새 PostgreSQL에 `members` 테이블을 재현할 Flyway 마이그레이션이 없었다.

## 관찰

- 변경 전 `backend/src/main/resources`에는 회원 테이블을 만드는 SQL이 없었다.
- Spring Boot의 PostgreSQL 기본 설정에서는 JPA가 테이블을 자동 생성하지 않는다.
- 초기 서비스의 아이디 사전 조회는 정확히 같은 문자열만 확인했다. DB 제약이 거부한 충돌을 `409`로 번역하는 처리는 당시 없었다.

## 고민한 선택지

1. 서비스의 중복 조회만 유지하면 구현이 단순하지만 동시 삽입의 최종 고유성을 보장하지 못한다.
2. PostgreSQL `citext`를 쓰면 대소문자 무시 비교를 열 타입으로 표현할 수 있지만 확장 설치와 타입 선택이 추가된다.
3. `lower(...)` 고유 표현식 인덱스는 확장 없이 두 열에만 필요한 고유성 규칙을 적용한다. 조회 SQL이 같은 표현식을 쓰지 않으면 해당 인덱스를 조회에 활용하지 못할 수 있다.

## 결정과 수정

- 사용자가 Flyway 마이그레이션의 직접 구현을 요청했다. AI가 `V1__create_members.sql`을 작성했다.
- 스키마 변경은 Flyway 마이그레이션에서만 수행하고, JPA의 `ddl-auto`는 `validate`로 명시해 시작 시 엔티티와 테이블의 구조를 확인한다. `none`은 구조 검사를 생략하고, `update`·`create` 계열은 Flyway 외에 스키마를 변경하므로 선택하지 않았다.
- `Member` 엔티티의 `IDENTITY` 키와 필드에 대응하는 `members` 테이블을 만들고, 원문 비밀번호가 아닌 인코딩 결과를 저장할 `password VARCHAR(255)`를 둔다.
- 아이디와 닉네임에 각각 `lower(...)` 고유 인덱스를 두었다. 두 열에 `COLLATE "C"`를 지정해 데이터베이스 기본 로캘과 무관하게 계약의 ASCII 영문 대소문자 규칙을 적용한다.
- 이름에는 고유 제약을 두지 않았다.
- PostgreSQL Testcontainers에서 대소문자만 다른 아이디·닉네임 삽입 거부와 같은 성·이름의 다른 회원 삽입 허용을 확인하는 마이그레이션 테스트를 추가했다.

## 검증

- `backend`에서 `gradlew.bat build --rerun-tasks`가 성공했다. Spotless, 컴파일, 테스트를 포함한다.
- 테스트 로그에서 PostgreSQL 18.6의 빈 스키마에 Flyway `1 - create members`가 적용됐음을 확인했다.
- `MemberMigrationTests` 1개 테스트가 실패 0건으로 통과했다. `RENTAL1`/`rental1`, `Min_1`/`min_1`, `I_방`/`i_방`의 중복 삽입은 거부되고, 다른 아이디·닉네임으로 같은 성·이름을 저장했다.
- PostgreSQL 통합 테스트를 `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`로 먼저 실행하고, `application.yaml`에 설정한 뒤 환경 변수 없이 다시 실행했다. 두 실행 모두 Flyway 적용 후 JPA 스키마 검사가 통과했다. 이는 인덱스의 의미나 모든 열 길이를 검증했다는 뜻은 아니다.
- 이는 DB 스키마의 동작 검증이며 HTTP 회원가입 응답 검증은 아니다.

## 남은 내용

- 이후 서비스의 사전 중복 조회를 제거하고 DB 충돌을 필드별 `409`로 변환했다. 선택 이유와 HTTP 통합 검증은 [별도 결정 노트](2026-10-07-member-duplicate-response.md)에 기록했다.
- 후속 완료: 가입 전 중복 확인 `GET`을 구현하고 PostgreSQL 통합 테스트를 통과시켰다. [관련 기록](2026-10-07-member-duplicate-response.md)
- 적용한 Flyway 버전 파일은 이후 영구 환경에 배포되면 직접 수정하지 않고 새 버전으로 변경해야 한다.

## 연결

- **관련 코드·테스트:** `backend/src/main/resources/db/migration/V1__create_members.sql`, `backend/src/test/java/com/minokim/rentalroom/member/MemberMigrationTests.java`
- **포트폴리오 후보:** 미정 (HTTP 충돌 처리와 통합 검증 이후 평가)
- **TIL 주제:** `docs/til/2026-10-07-case-insensitive-unique-index.md`
