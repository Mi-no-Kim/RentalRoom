# RentalRoom

Spring 학습을 위한 공간 예약·대여 서비스입니다.

## 로컬 개발 환경

### 프런트엔드 실행

저장소 루트에서 npm 의존성을 설치하고 프런트엔드 개발 서버를 실행합니다.

```powershell
npm install
npm run dev --workspace frontend
```

기본 주소는 `http://localhost:5173`입니다.

프런트엔드 테스트와 production build는 각각 다음 명령으로 확인합니다.

```powershell
npm run test --workspace frontend
npm run build --workspace frontend
```

프런트엔드는 React, TypeScript, Vite, React Router, Tailwind CSS와 TanStack Query를 사용합니다. 초기 학습 단계에서는 API 실패를 바로 관찰할 수 있도록 TanStack Query의 자동 재시도와 창 focus 재조회를 비활성화합니다.

### 전체 formatting

저장소 루트에서 다음 명령으로 Markdown, JSON, YAML과 프런트엔드 파일은 Prettier로, 백엔드 Java와 Gradle Kotlin DSL은 Spotless로 자동 정리합니다.

```powershell
npm run format
```

파일을 변경하지 않고 전체 formatting 위반만 검사하려면 다음 명령을 사용합니다.

```powershell
npm run format:check
```

Prettier와 백엔드 Spotless는 `format:prettier`, `format:prettier:check`, `format:backend`, `format:backend:check` 명령으로 각각 실행할 수도 있습니다.

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

테스트는 Testcontainers가 별도의 PostgreSQL 18.6 컨테이너를 자동으로 시작하고 종료합니다. Docker Desktop은 실행 중이어야 하지만 로컬 Compose PostgreSQL을 미리 시작할 필요는 없습니다.

```powershell
.\gradlew.bat test
```

처음 실행할 때는 PostgreSQL 이미지와 테스트 의존성을 내려받기 때문에 시간이 더 걸릴 수 있습니다.

### PostgreSQL 중지

다음 명령은 컨테이너를 중지하되 데이터는 보존합니다.

```powershell
docker compose down
```

로컬 데이터를 완전히 초기화할 때만 아래 명령을 사용합니다. 이 명령은 PostgreSQL volume을 삭제해 복구할 수 없습니다.

```powershell
docker compose down --volumes
```

### 백엔드 formatting

백엔드 디렉터리에서 다음 명령으로 Java, Gradle Kotlin DSL과 `.properties` 파일을 자동 정리합니다.

```powershell
.\gradlew.bat spotlessApply
```

파일을 변경하지 않고 formatting 위반만 검사하려면 다음 명령을 사용합니다.

```powershell
.\gradlew.bat spotlessCheck
```

macOS 또는 Linux에서는 `./gradlew`를 사용합니다. 백엔드 `check`와 `build`에도 `spotlessCheck`가 포함됩니다.

## 프로젝트 문서

- [기여 및 Git 운영 규칙](CONTRIBUTING.md)
- [개발 노트](docs/dev-notes/README.md)
