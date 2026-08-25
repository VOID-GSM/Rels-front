# Rels (Relay Study)

Rels는 **광주소프트웨어마이스터고등학교 릴레이 스터디**의 전체 운영 과정을 하나의 플랫폼에서 효율적으로 관리하기 위한 서비스입니다.

이 저장소는 **프론트엔드**입니다. 백엔드는 [Rels-back](https://github.com/VOID-GSM/Rels-back)에서 관리합니다.

## 구성

이 저장소는 Next.js App Router 기반의 단일 애플리케이션이며, 레이어드 아키텍처로 구성되어 있습니다.

| 디렉터리 | 설명 |
|---|---|
| `src/app` | 라우트 진입점, App Router 레이아웃, 경로 수준 인증 보호 장치 |
| `src/components` | UI 컴포넌트 (`common` 공용, `layout` 레이아웃, 도메인별 하위 디렉터리) |
| `src/entities` | 도메인 타입과 TanStack Query 훅 (lecture, notice, auth, notification) |
| `src/shared` | HTTP 클라이언트, API URL·쿼리 키 상수, 공용 유틸리티 |
| `src/stores` | 전역 클라이언트 상태 (Zustand — 인증 토큰, 유저 정보) |
| `src/assets` | SVG 아이콘 컴포넌트 |
| `src/constants` | 앱 전역 상수 |
| `worker` | 서비스 워커 소스 (웹 푸시 수신·알림 클릭 처리) |

의존성은 `app → components → entities → shared` 단방향으로 흐릅니다. 하위 레이어만 가져오고, 같은 레이어 내에서는 수평적으로 가져오지 않습니다.

## 기술 스택

- **Framework & Core:** Next.js 16 (App Router), React 19, TypeScript 5
- **Data Fetching & State:** TanStack Query 5, Axios, Zustand 5
- **Form & Validation:** React Hook Form 7, Zod 4
- **Styling & UI:** Tailwind CSS 4, Pretendard, Sonner
- **PWA:** @ducanh2912/next-pwa, Web Push (VAPID)
- **Package Manager:** npm

## 시작하기

### 요구 사항

- Node.js 20 이상 (CI 기준 버전)
- npm 10 이상

### 설치

```bash
git clone https://github.com/VOID-GSM/Rels-front.git
cd Rels-front
npm install
```

### 환경 변수

루트에 `.env.local` 파일을 만들고 아래 값을 채워 주세요.

```bash
NEXT_PUBLIC_BACKEND_URL=        # 백엔드 서버 주소 (/api/* 요청이 이 주소로 프록시됩니다)
NEXT_PUBLIC_BASE_URL=           # 프론트엔드 주소 (OAuth 리다이렉트에 사용)
```

### 개발 서버 실행

```bash
npm run dev
```

기본 주소는 http://localhost:3000 입니다.

> PWA와 서비스 워커는 개발 모드에서 비활성화됩니다. 푸시 알림 동작은 `npm run build && npm start`로 빌드하거나 배포본에서 확인해 주세요. 웹 푸시는 HTTPS에서만 동작합니다.

### 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |
| `npx tsc --noEmit` | 타입 검사 |

## 브랜치 전략

git flow를 따릅니다. 기능 브랜치는 항상 `develop`을 향합니다.

```
feature/* → develop → main
```

CI는 `main`·`develop`으로의 push와 pull request에서 Lint → Type Check → Build 순으로 실행됩니다.

## 버그 제보 및 이슈

버그를 발견하거나 기능 제안이 있다면 GitHub 이슈 트래커를 이용해 주세요.

- **이슈 트래커:** https://github.com/VOID-GSM/Rels-front/issues/new
