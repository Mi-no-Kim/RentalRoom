# DB 통합 테스트에 Testcontainers PostgreSQL 사용

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 백엔드 테스트 기반

## 배경

- 기존 애플리케이션 컨텍스트 테스트는 `application.yaml`의 기본 datasource를 사용해 로컬 Compose PostgreSQL이 실행 중이어야 했다.
- 테스트 실행 전에 개발자가 Compose DB를 준비해야 했고, 개발용 데이터와 테스트 환경이 분리되지 않았다.
- PostgreSQL 고유의 SQL, 제약, 잠금과 transaction 동작을 이후 통합 테스트에서도 확인해야 하므로 H2로 대체하지 않기로 했다.

## 고민한 선택지

1. Compose PostgreSQL을 테스트에서도 사용하면 설정은 단순하지만 테스트가 외부 실행 순서와 개발 데이터 상태에 의존한다.
2. H2를 사용하면 실행은 가볍지만 운영 대상으로 선택한 PostgreSQL과 동작 차이가 생길 수 있다.
3. Testcontainers PostgreSQL을 사용하면 Docker 엔진이 필요하고 시작 비용이 생기지만 테스트가 실제 PostgreSQL을 일회성 환경으로 직접 준비할 수 있다.

## 결정과 수정

- 수동 로컬 실행은 기존 Compose PostgreSQL을 유지하고 DB 통합 테스트만 Testcontainers PostgreSQL을 사용한다.
- Spring Boot 4.1.1의 dependency management가 선택하는 Testcontainers 2.0.5를 사용하며 개별 버전은 중복 선언하지 않는다.
- 테스트 의존성으로 `spring-boot-testcontainers`, `testcontainers-junit-jupiter`, `testcontainers-postgresql`을 추가했다.
- Testcontainers 2.x의 `org.testcontainers.postgresql.PostgreSQLContainer`를 사용했다.
- 기존 `RentalRoomApplicationTests`에 클래스 단위의 `static @Container`를 선언하고 `@ServiceConnection`으로 Spring Boot에 연결했다.
- 테스트 DB 이미지도 로컬 Compose와 같은 `postgres:18.6`으로 고정했다.
- 별도 테스트 YAML이나 `@DynamicPropertySource`, 공통 테스트 base class는 추가하지 않았다.

## 실제 실행 흐름

1. JUnit 5 확장이 `@Container` 필드를 발견한다.
2. Testcontainers가 PostgreSQL 18.6을 호스트의 임의 포트로 시작한다.
3. `@ServiceConnection`이 JDBC와 Flyway 연결 정보를 Spring Boot에 제공한다.
4. Flyway가 빈 테스트 DB의 schema history를 준비한다.
5. Spring Context 테스트가 실행된다.
6. 테스트 프로세스가 끝나면 Testcontainers가 임시 컨테이너를 제거한다.

## 검증

- `docker compose down`으로 Compose 서비스를 제거하고 `rental-room_postgres-data` volume이 보존된 것을 확인했다.
- Docker Desktop 엔진만 실행한 상태에서 Gradle 테스트를 강제로 다시 실행했다.
- Testcontainers 2.0.5가 `postgres:18.6` 컨테이너를 임의 포트 `54249`에 시작한 로그를 확인했다.
- Flyway가 해당 임시 DB에서 `flyway_schema_history`를 생성하고 migration 0건을 검증했다.
- `RentalRoomApplicationTests` 1건이 실패와 오류 없이 통과했다.
- Gradle 결과는 `BUILD SUCCESSFUL in 47s`, 4개 task 실행이었다.
- 테스트 종료 후 Testcontainers PostgreSQL과 Ryuk 컨테이너가 남지 않았고 Compose 서비스도 계속 중지 상태임을 확인했다.
- 로컬 개발용 named volume은 삭제되지 않았다.

## 남은 내용

- 후속 완료: 회원 테이블 Flyway V1 마이그레이션을 빈 Testcontainers PostgreSQL에 적용하고 제약 동작을 검증했다. [관련 기록](2026-10-07-member-uniqueness-migration.md)
- `static @Container`는 테스트 클래스 안에서 DB를 공유하므로 향후 여러 테스트 메서드의 데이터 격리 전략이 별도로 필요하다.
- 현재 로그의 Open EntityManager in View, 임시 Security 비밀번호와 Mockito agent 경고는 이번 Testcontainers 범위와 별개이며 각 기능을 구성할 때 다룬다.
- Docker 엔진이 없는 환경에서는 DB 통합 테스트를 실행할 수 없다.

## 연결

- **관련 코드·테스트:** `backend/build.gradle.kts`, `backend/src/test/java/com/minokim/rentalroom/RentalRoomApplicationTests.java`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** `docs/til/2026-10-05-spring-boot-testcontainers-postgresql.md`
