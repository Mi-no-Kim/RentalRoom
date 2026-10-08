# 로컬 PostgreSQL 실행에 Docker Compose 사용

- **상태:** 해결
- **발견일:** 2026-10-05
- **관련 기능:** 백엔드 로컬 실행 기반

## 배경

- PostgreSQL을 별도로 설치하지 않고 개발자마다 같은 버전과 설정으로 실행할 방법이 필요했다.
- Spring Boot는 IDE와 Gradle에서 직접 실행해 디버깅 흐름을 단순하게 유지하려 했다.

## 관찰

- Spring Initializr가 생성한 Gradle 구성에는 PostgreSQL Driver, Flyway starter, PostgreSQL용 Flyway 모듈이 포함돼 있었다.
- Docker Compose는 설치돼 있었지만 Docker 엔진은 처음 확인했을 때 실행 중이 아니었다.
- PostgreSQL 18 이상 공식 이미지는 데이터 volume 연결 위치로 `/var/lib/postgresql`을 사용한다. 이전 버전에서 흔히 사용한 `/var/lib/postgresql/data`와 다르다.

## 고민한 선택지

1. PostgreSQL을 호스트에 직접 설치하면 Docker 없이 실행할 수 있지만 설치와 버전 관리가 개발자 환경에 의존한다.
2. Spring Boot와 PostgreSQL을 모두 Compose에서 실행하면 실행 환경은 통일되지만 초기 개발의 IDE 디버깅과 재빌드 흐름이 복잡해진다.
3. PostgreSQL만 Compose에서 실행하면 DB 버전을 고정하면서 Spring Boot는 호스트에서 단순하게 실행할 수 있다.

## 결정과 수정

- PostgreSQL만 Docker Compose로 실행하고 Spring Boot는 호스트에서 실행한다.
- 공식 `postgres:18.6` 이미지를 정확한 버전으로 고정했다.
- Compose 파일은 monorepo 루트의 `compose.yaml`에 두었다.
- PostgreSQL 포트는 `127.0.0.1:5432`에만 공개하고 named volume을 `/var/lib/postgresql`에 연결했다.
- 로컬 기본 DB 이름, 사용자, 비밀번호는 `rental_room`으로 통일하고 환경 변수로 덮어쓸 수 있게 했다.
- healthcheck는 `pg_isready`를 사용한다.
- `application.yaml`의 datasource 기본값을 Compose 설정과 맞췄다.
- 애플리케이션 컨테이너화와 pgAdmin은 이번 범위에서 제외했다.
- 수동 로컬 실행은 Compose PostgreSQL을 사용하고, DB 통합 테스트는 별도의 Testcontainers PostgreSQL을 사용하는 방향으로 결정했다. Testcontainers 구현은 후속 작업으로 남겼다.

## 검증

- `docker compose config --quiet`가 종료 코드 0으로 통과했다.
- PostgreSQL 컨테이너가 `healthy` 상태가 되는 것을 확인했다.
- `psql`로 `rental_room` 데이터베이스와 사용자, PostgreSQL 18.6 서버 버전을 확인했다.
- Flyway의 `flyway_schema_history` 테이블이 생성됐고 아직 migration은 0건임을 확인했다.
- PostgreSQL 컨테이너가 실행된 상태에서 Gradle 테스트가 통과했다: `BUILD SUCCESSFUL`.

## 남은 내용

- 후속 완료: Compose DB 없이 Testcontainers PostgreSQL 테스트를 통과시켰다. [관련 기록](2026-10-05-testcontainers-postgresql.md)
- 운영 환경의 비밀값 관리와 PostgreSQL 배포 방식은 현재 범위가 아니다.
- PostgreSQL major version을 올릴 때는 기존 volume을 그대로 재사용하지 않고 별도 upgrade 또는 백업·복원 절차가 필요하다.

## 연결

- **관련 코드·테스트:** `compose.yaml`, `backend/src/main/resources/application.yaml`, `backend/src/test/java/com/minokim/rentalroom/RentalRoomApplicationTests.java`
- **포트폴리오 후보:** 해당 없음
- **TIL 주제:** `docs/til/2026-10-05-postgresql-18-docker-volume.md`
