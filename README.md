# RentalRoom

Spring 학습을 위한 공간 예약·대여 서비스입니다.

## 로컬 개발 환경

### PostgreSQL 시작

Docker Desktop을 실행한 뒤 저장소 루트에서 PostgreSQL을 시작합니다.

```powershell
docker compose up -d
docker compose ps
```

기본 연결 정보는 다음과 같습니다.

- 주소: `localhost:5432`
- 데이터베이스: `rental_room`
- 사용자: `rental_room`
- 비밀번호: `rental_room`

이 값은 로컬 개발 전용입니다. 필요한 경우 `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT` 환경 변수로 변경할 수 있습니다.

### 백엔드 실행

Windows PowerShell에서는 다음 명령을 사용합니다.

```powershell
Set-Location backend
.\gradlew.bat bootRun
```

macOS 또는 Linux에서는 다음 명령을 사용합니다.

```bash
cd backend
./gradlew bootRun
```

백엔드의 기본 datasource 설정은 로컬 PostgreSQL을 사용합니다. 주소가 다른 경우 `DB_HOST` 환경 변수도 함께 설정합니다.

현재 애플리케이션 컨텍스트 테스트도 PostgreSQL에 연결하므로 컨테이너가 `healthy` 상태인 것을 확인한 뒤 실행합니다.

```powershell
.\gradlew.bat test
```

### PostgreSQL 중지

다음 명령은 컨테이너를 중지하되 데이터는 보존합니다.

```powershell
docker compose down
```

로컬 데이터를 완전히 초기화할 때만 아래 명령을 사용합니다. 이 명령은 PostgreSQL volume을 삭제해 복구할 수 없습니다.

```powershell
docker compose down --volumes
```

## 프로젝트 문서

- [기여 및 Git 운영 규칙](CONTRIBUTING.md)
- [개발 노트](docs/dev-notes/README.md)
