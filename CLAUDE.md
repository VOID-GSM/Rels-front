# Rels

## 프로젝트 개요

Rels는 광주소프트웨어마이스터고 학생들이 주도적으로 강연을 개설하고 신청하며 성장하는 릴레이 스터디 관리 서비스입니다.
Next.js 기반 App Router 프론트엔드입니다.

## 기술 스택

**Framework**
- Next.js 16.2.2 (App Router)
- React 19, TypeScript 5 (strict mode, incremental)

**Styling**
- Tailwind CSS v4

**Server State**
- TanStack Query v5
- Axios

**Client State**
- Zustand v5

**Form / Validation**
- React Hook Form v7 + @hookform/resolvers
- Zod v4

**Notification**
- Sonner v2 (toast)

## 프로젝트 구조

`src/app` — 라우트 진입점, Next.js App Router 레이아웃, 경로 수준 인증 보호 장치

`src/components/common` — 재사용 가능한 UI 컴포넌트 (Button, Input, Badge, LectureCard, LectureForm 등)

`src/entities` — 도메인 타입, TanStack Query API 훅, 엔티티별 비즈니스 로직 (lecture, notice, auth)

`src/shared` — 공통 HTTP 클라이언트, API URL 상수, 쿼리 키, axios 인스턴스, OAuth 유틸리티

`src/stores` — 전역 클라이언트 상태 (Zustand authStore — 인증 토큰, 유저 정보)

`src/assets/svg` — SVG 아이콘 컴포넌트

`src/constants` — 앱 전역 상수 (roleTypes 등)

의존성을 단순하게 유지하고, `app`은 화면 진입과 보호를 담당하고, `components`는 UI 렌더링만 소유하며, `entities`는 도메인 동작을 소유하고, `shared`는 재사용 가능한 인프라를 포함합니다. 하위 레이어만 가져오고, 같은 레이어 내에서는 수평적으로 가져오지 마세요.

---

## Harness

**Goal:** Build Next.js features on an FSD architecture using an agent team following an API → Component → Page → QA pipeline.

**Trigger:** Use the `rels-orchestrator` skill for any code task — adding features, implementing components, writing API hooks, modifying pages, or fixing bugs. Answer simple explanation questions directly.

**Git automation skills** (trigger directly, no orchestrator needed):
- `rels-git-commit` — stage and commit with the correct type prefix
- `rels-git-pr` — create a PR following the project template
- `rels-issue-analysis` — fetch and map a GitHub issue to a work plan
- `rels-pr-review` — apply PR review comments and post replies

**Change Log:**
| Date | Change | Target | Reason |
|------|--------|--------|--------|
| 2026-05-31 | Initial setup | All | - |
| 2026-05-31 | Rewrite all files in English | All | Token efficiency + model instruction-following |
| 2026-05-31 | Add git automation skills (commit, PR, issue, review) | skills/ | Automate git workflow |
| 2026-05-31 | Add project overview, tech stack, structure | CLAUDE.md | Project context |
