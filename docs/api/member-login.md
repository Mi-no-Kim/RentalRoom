# 회원 로그인 API 계약

- **상태:** Issue #4 w1 계약 자체 검토 완료, 미구현·미검증
- **범위:** 자체 아이디·비밀번호 로그인, 현재 회원 확인, 로그아웃, CSRF 토큰 전달과 공통 실패 응답
- **전제:** 브라우저의 React 화면이 `/api`를 같은 출처로 호출한다. 로컬 개발은 기존 Vite proxy를 사용한다. 화면과 API를 서로 다른 출처에 배치할 때의 CORS·쿠키 정책은 이 계약의 범위 밖이다.

## 공통 원칙

- 로그인 상태는 서버 세션에 보관한다. 브라우저에는 세션 ID 쿠키만 전달하며, 세션 ID·비밀번호·CSRF 토큰을 로그인 성공 본문에 포함하지 않는다.
- 유효한 세션은 새로고침 후에도 유지된다. `무활동 30분`은 마지막 서버 요청 뒤 새 서버 요청이 없는 시간을 뜻한다. 화면 안에서 클릭하거나 입력만 하는 행위는 시간을 연장하지 않는다. 로그아웃은 서버 세션을 즉시 무효화한다. 자동 로그인 기능은 제공하지 않는다.
- 세션 쿠키는 `HttpOnly`, `SameSite=Lax`, `Path=/`이며 `Domain`, `Max-Age`, `Expires`를 지정하지 않는다. HTTPS 환경에서는 `Secure`를 사용한다. 로컬 HTTP 개발 환경에서는 `Secure` 여부를 환경에 맞게 확인한다. 브라우저 종료만으로 서버 세션이 즉시 끝난다고 보장하지 않는다.
- 인증과 CSRF 응답에는 `Cache-Control: no-store`를 사용한다. 클라이언트는 CSRF 토큰을 메모리에서 다루며 URL이나 영구 브라우저 저장소에 넣지 않는다.
- 기존 [회원가입 계약](member-sign-up.md)의 `POST /api/members`는 `201`과 빈 본문을 유지하며 자동 로그인하지 않는다. 기존 공개 회원가입 `POST`의 CSRF 제외 설정도 이번 계약에서 바꾸지 않는다.

## 경로 요약

| 요청                    | 로그인 필요 | `X-CSRF-TOKEN` 필요 | 성공                              |
| ----------------------- | ----------- | ------------------- | --------------------------------- |
| `GET /api/auth/csrf`    | 아니요      | 아니요              | `200`, 토큰 JSON                  |
| `POST /api/auth/login`  | 아니요      | 예                  | `200`, 회원 JSON과 세션 쿠키      |
| `GET /api/auth/me`      | 예          | 아니요              | `200`, 회원 JSON                  |
| `POST /api/auth/logout` | 아니요      | 예                  | `204`, 빈 본문과 기존 세션 무효화 |

### CSRF 토큰 조회

화면은 로그인 요청 전에 공개 `GET /api/auth/csrf`로 토큰을 받는다. 이 응답은 익명 세션을 만들거나 기존 세션을 사용할 수 있다. 토큰과 세션 쿠키가 같은 브라우저 흐름에서 사용되어야 한다.

```http
GET /api/auth/csrf

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"token":"<CSRF 토큰>"}
```

화면은 받은 값을 로그인·로그아웃과 이후 CSRF 보호 대상 변경 요청의 `X-CSRF-TOKEN` 헤더에 넣는다. 인증용 세션 쿠키는 브라우저가 함께 보낸다. 로그인 성공과 로그아웃 성공 뒤에는 이전 토큰을 버리고, 다음 변경 요청 전에 이 `GET`을 다시 호출한다. `GET /api/auth/me`에는 CSRF 헤더가 필요하지 않다.

### 로그인

`POST /api/auth/login`에 JSON 문자열 `loginId`와 `password`를 보낸다. 두 값은 필수이며 빈 문자열은 허용하지 않는다. 앞뒤 공백 제거·아이디 대문자 변환은 하지 않는다. 빈 값 외의 자격 증명 불일치는 동일한 실패로 처리한다. 회원가입의 비밀번호 조합 규칙은 로그인 시 다시 검사하지 않는다.

```http
POST /api/auth/login
Content-Type: application/json
X-CSRF-TOKEN: <CSRF 토큰>

{"loginId":"rental1","password":"Example9!"}
```

올바른 자격 증명이면 서버가 인증 상태를 세션에 저장하고 세션 ID를 갱신한다. 응답 본문은 화면에 필요한 최소 정보만 담는다. 예약 등 인증된 API는 클라이언트가 보낸 회원 ID 대신 서버 세션에서 회원을 식별한다.

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store
Set-Cookie: <세션 ID 쿠키>

{"loginId":"rental1","nickname":"Min_1"}
```

### 현재 회원 확인

새로고침 뒤 화면은 `GET /api/auth/me`로 현재 인증 상태를 확인한다. 유효한 세션이면 로그인 성공과 같은 필드의 `200`을 반환한다. 세션이 없거나 만료됐으면 아래 `401 UNAUTHENTICATED`를 반환한다. 이 `GET`에는 비밀번호나 CSRF 토큰을 보내지 않는다.

```http
GET /api/auth/me

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"loginId":"rental1","nickname":"Min_1"}
```

### 로그아웃

화면은 유효한 CSRF 토큰을 넣어 `POST /api/auth/logout`을 보낸다. 서버는 인증된 세션이 있으면 즉시 무효화하고, 응답은 빈 본문의 `204 No Content`다. 유효한 CSRF 토큰이 있지만 이미 로그인하지 않은 상태여도 `204`를 반환한다. 이후 이전 세션 ID로 `GET /api/auth/me`를 호출하면 `401`이어야 한다.

```http
POST /api/auth/logout
X-CSRF-TOKEN: <CSRF 토큰>

HTTP/1.1 204 No Content
Cache-Control: no-store
```

토큰이 없거나 만료됐다면 로그아웃 처리 전에 아래 `403 INVALID_CSRF_TOKEN`을 반환한다. 세션이 만료된 뒤 다시 로그인하려면 새 CSRF 토큰을 조회한다.

30분 무활동으로 세션이 만료되면 이전 CSRF 토큰을 실은 `POST`는 인증 오류보다 먼저 `403 INVALID_CSRF_TOKEN`을 받을 수 있다. 화면은 이 `403`만으로 로그인 여부를 판단하지 않는다. `GET /api/auth/me`로 인증 상태를 확인하고, 새 `GET /api/auth/csrf`로 토큰을 받은 뒤 필요한 요청을 다시 시작한다.

## 실패 응답

회원가입 계약과 같이 오류 본문은 `code`와 `field`를 가진다. 필드 오류가 아니면 `field`는 JSON `null`이다. 한 요청에는 서버가 확인한 오류 하나를 반환한다.

| 조건                                            | 상태               | 본문                                                                                            |
| ----------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `loginId` 또는 `password` 누락·`null`·빈 문자열 | `400 Bad Request`  | `{"code":"INVALID_INPUT","field":"loginId"}` 또는 `{"code":"INVALID_INPUT","field":"password"}` |
| 존재하지 않는 아이디 또는 틀린 비밀번호         | `401 Unauthorized` | `{"code":"INVALID_CREDENTIALS","field":null}`                                                   |
| `GET /api/auth/me`에서 세션 없음·만료           | `401 Unauthorized` | `{"code":"UNAUTHENTICATED","field":null}`                                                       |
| 보호 대상 `POST`의 CSRF 헤더 누락·불일치·만료   | `403 Forbidden`    | `{"code":"INVALID_CSRF_TOKEN","field":null}`                                                    |

- 존재하지 않는 아이디와 틀린 비밀번호는 같은 상태 코드·오류 코드·화면 문구로 처리한다. 어떤 필드가 틀렸는지 알려주지 않는다. 구현 시 아이디 존재 여부에 따라 비밀번호 확인을 건너뛰어 응답 시간 차이가 커지는지도 검토한다.
- `loginId`와 `password`가 모두 빠졌을 때 먼저 반환할 필드는 보장하지 않는다. 누락·빈 값 확인은 유효한 CSRF 토큰을 받은 요청에서 적용하며, 토큰 검사에 실패한 변경 요청은 입력 검사보다 먼저 `403`이 될 수 있다.
- 잘못된 JSON 문법 등 공통 요청 파싱 오류와 다른 기능의 권한 부족 `403`은 이 로그인 필드 계약에서 정의하지 않는다.

## 흐름과 확인 사례

1. 화면 시작 → `GET /api/auth/csrf` → 유효한 토큰을 받은 뒤 로그인 `POST`.
2. 로그인 성공 → 이전 CSRF 토큰 폐기 → `GET /api/auth/csrf` 재호출 → 새 토큰으로 후속 변경 요청.
3. 새로고침 → 기존 세션 쿠키로 `GET /api/auth/me` → 현재 회원 표시. 세션이 만료됐다면 `401`과 로그인 화면 표시.
4. 로그아웃 → `POST /api/auth/logout`에 현재 CSRF 토큰 전달 → `204` → `GET /api/auth/me`는 `401` → 다시 로그인하려면 CSRF 토큰 재조회.

| 사례                                                 | 기대 결과                                              |
| ---------------------------------------------------- | ------------------------------------------------------ |
| 올바른 아이디·비밀번호와 CSRF 토큰                   | 로그인 `200`, 후속 `/me`에서 같은 회원                 |
| 로그인 전 익명 세션 ID·CSRF 토큰을 로그인 뒤 재사용  | 이전 ID로 `/me`는 `401`, 이전 토큰의 변경 요청은 `403` |
| 존재하지 않는 아이디 / 등록된 아이디의 틀린 비밀번호 | 둘 다 같은 `401 INVALID_CREDENTIALS`                   |
| 아이디 또는 비밀번호 누락·빈 문자열                  | `400 INVALID_INPUT`, 해당 필드                         |
| CSRF 토큰 없이 로그인·로그아웃                       | `403 INVALID_CSRF_TOKEN`, 인증 상태 변경 없음          |
| 로그인 후 새로고침                                   | `/me` `200`, 동일 회원                                 |
| 마지막 서버 요청 뒤 30분 동안 요청 없음              | `/me` `401 UNAUTHENTICATED`                            |
| 세션 만료 뒤 이전 CSRF 토큰으로 변경 요청            | `403 INVALID_CSRF_TOKEN` 가능, `/me`는 `401`           |
| 로그아웃 직후 이전 세션 ID로 조회                    | `/me` `401 UNAUTHENTICATED`                            |
| 유효한 CSRF 토큰으로 중복 로그아웃                   | `204`                                                  |
| 인증·CSRF 응답의 캐시 및 세션 쿠키 속성              | `no-store`와 합의한 쿠키 속성 확인                     |

## 구현 전제와 검증 상태

- 이 문서는 Issue #4 w1의 설계 계약이다. 로그인 API·보안 설정·화면·통합 테스트는 아직 구현하지 않았으므로, 위 상태 코드와 헤더는 실행으로 검증되지 않았다.
- 현재 코드에는 `MemberRepository.findByLoginId`와 비밀번호 해시용 `PasswordEncoder` 사용 사례가 있다. 반면 `SecurityConfig`는 가입 경로만 공개하며 로그인·CSRF 조회 경로, 세션 시간·쿠키 설정과 로그인 API는 없다. 기존 `ErrorResponse`는 `code`·`field` 구조지만, 인증 필터의 `401`·CSRF 필터의 `403`을 이 JSON으로 바꾸는 설정도 아직 없다. [회원가입 계약](member-sign-up.md)과 대조했으며 설계 일치 여부만 검토했다.
- 공개 CSRF 조회·헤더 전달·인증 후 재조회는 [Spring Security CSRF 지침](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html), 알 수 없는 아이디와 틀린 비밀번호에 같은 오류를 주는 기준은 [OWASP 인증 지침](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)을 확인했다.
- 백엔드 구현 시 직접 만든 로그인 처리는 인증 정보를 현재 요청에 넣는 데 그치지 않고 세션에 저장해야 한다. 로그인 시 세션 ID 교체와 이전 CSRF 토큰 폐기도 직접 연결하거나 같은 동작을 제공하는 Spring Security 인증 절차를 사용해야 한다. [Spring Security 세션 관리 지침](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)을 참고한다.
- 로그아웃 경로를 `/api/auth/logout`으로 맞추고 세션·인증 상태·CSRF 토큰을 정리하며 `204`를 반환해야 한다. 보안 필터에서 거부한 `/me`와 CSRF 요청에는 각각 계약한 JSON `401`·`403`이 나와야 한다. [Spring Security 로그아웃 지침](https://docs.spring.io/spring-security/reference/servlet/authentication/logout.html)을 참고한다.
- 통합 테스트에서 위 표의 정상·실패 경로와 30분 만료, 쿠키 속성, 응답 캐시 지시를 확인한다. 화면은 자격 증명 오류·세션 만료·CSRF 오류를 구분해 표시한다. 이 실행 검증은 아직 하지 않았다.
- 동시 로그인 수 제한, 자동 로그인, 계정 잠금, 인증 제공자 추가는 이번 계약 범위에 넣지 않는다. 단일 출처 전제나 공개 배포 조건이 달라지면 쿠키·CORS 정책을 다시 검토한다.

선택의 배경과 미검증 한계는 [서버 세션 선택](../dev-notes/2026-10-08-member-session-auth-choice.md), [CSRF 전달 선택](../dev-notes/2026-10-08-session-csrf-token-delivery.md)에 기록했다.
