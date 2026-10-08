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
회원가입 화면은 `http://localhost:5173/sign-up`입니다. 개발 서버는 `/api` 요청을 `http://localhost:8080`으로 전달하므로, 가입 화면에서 API를 확인할 때는 아래 PostgreSQL과 백엔드도 실행해야 합니다.

프런트엔드 테스트와 production build는 각각 다음 명령으로 확인합니다.

```powershell
npm run lint --workspace frontend
npm run test --workspace frontend
npm run build --workspace frontend
```

프런트엔드는 React, TypeScript, Vite, React Router, Tailwind CSS와 TanStack Query를 사용합니다. ESLint는 TypeScript, React Hooks와 TanStack Query의 오류 예방 규칙을 검사하고 코드 formatting은 Prettier가 담당합니다. 초기 학습 단계에서는 API 실패를 바로 관찰할 수 있도록 TanStack Query의 자동 재시도와 창 focus 재조회를 비활성화합니다.

### 로컬 통합 검증

로컬에서 commit 또는 PR 준비 전 전체 검증을 한 번에 실행합니다.

```powershell
npm run verify
```

이 명령은 formatting 검사, 프런트엔드 lint·test·production build와 백엔드 Gradle `check`를 순서대로 실행하며 실패한 단계에서 중단합니다. 백엔드 테스트가 실행될 때 Testcontainers가 PostgreSQL을 시작하므로 Docker Desktop이 필요합니다.

`verify`는 개발자의 로컬 확인을 위한 편의 명령입니다. CI는 이 명령을 사용하지 않고 formatting, frontend와 backend의 검사 상태를 별도 job으로 보고합니다.

### CI

GitHub Actions는 모든 pull request와 `main` branch push에서 다음 세 job의 상태를 보고합니다.

- `Formatting`: 변경 영역에 관계없이 루트 Prettier 검사
- `Frontend`: 프런트엔드 변경 시 ESLint, Vitest와 production build
- `Backend`: 백엔드 변경 시 Spotless와 테스트를 포함한 Gradle `check`

문서만 변경한 PR에서는 Prettier만 실행합니다. 루트 npm 의존성 변경은 프런트엔드 변경으로, CI 설정 등 공통 파일 또는 분류되지 않은 파일 변경은 프런트엔드와 백엔드 변경으로 취급합니다. `main` push에서도 두 영역을 모두 검사합니다. 변경이 없는 영역의 job은 검사 대상만 확인하고 성공 상태를 보고하며, 변경 파일을 확인하지 못하면 실패합니다.

CI는 로컬 편의 명령인 `npm run verify`를 호출하지 않습니다. 백엔드 테스트는 GitHub-hosted runner의 Docker에서 Testcontainers PostgreSQL을 실행하며 Compose 개발용 데이터베이스는 시작하지 않습니다.

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

백엔드 시작 시 Flyway가 DB 스키마 변경을 적용하고, JPA는 `ddl-auto: validate`로 엔티티와 DB의 기본 구조를 확인합니다.

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
