---
name: rels-orchestrator
description: |
  Rels frontend development orchestrator. Runs an agent team for all code tasks: adding features,
  implementing components, writing API hooks, modifying pages, fixing bugs — covering lectures,
  enrollments, notices, mypage, and auth flows.
  Use this skill for any request like "add", "create", "fix", "update", "improve", "redo",
  "based on previous result", or any code modification. Exclude pure explanation questions.
---

## Execution Mode: Agent Team (Pipeline Pattern)

API → Component → Page → QA sequential pipeline. Each stage depends on the previous stage's output.

All Agent calls must include `model: "opus"`.

## Phase 0: Context Check

1. Check if `_workspace/` directory exists
   - **Absent** → fresh run, proceed to Phase 1
   - **Present + user requests partial fix** → re-invoke only the relevant agent
   - **Present + new request** → rename `_workspace/` to `_workspace_prev/`, then Phase 1

## Phase 1: Requirements Analysis

Identify:
- **Domain:** lecture / notice / auth / new
- **Task type:** new feature / component / API hook / page modification / bug fix
- **Affected layers:** entities (hooks+types) / components / pages / all
- **Access requirements:** ADMIN only / creator only / authenticated / public

Decide team composition based on affected layers:

| Scope | Agents |
|-------|--------|
| API hooks/types only | rels-api-architect + rels-qa |
| Components only | rels-component-writer + rels-qa |
| Full feature | All 4 agents (pipeline) |

## Phase 2: Team Setup and Task Assignment

### Full Feature Pipeline

```
[1] rels-api-architect
    → Write types.ts + useXxx hooks
    → Update queryKeys.ts / apiUrls.ts
    → Update index.ts barrel exports

[2] rels-component-writer  (after [1])
    → Write / modify shared components
    → Reuse existing components first

[3] rels-feature-builder  (after [1] + [2])
    → Implement src/app/ pages
    → Compose hooks + components

[4] rels-qa  (after [3])
    → Run tsc --noEmit
    → Cross-validate types, role gates, rendering states, FSD layers
    → On issue found: request rework from responsible agent (1 retry)
```

## Phase 3: Execution and Monitoring

Pass key information between stages:
- api-architect done → send hook names + return types to component-writer / feature-builder
- component-writer done → send component names + props interfaces to feature-builder
- feature-builder done → send page file paths to qa

## Phase 4: QA and Wrap-up

Review qa report:
- All checks pass → proceed to Phase 5
- Issues found → request rework from responsible agent (max 1 retry)
- After retry still failing → orchestrator fixes directly

## Phase 5: Auto-commit

After QA passes, always commit automatically without waiting for the user to ask.

1. Run `git status` to confirm which files changed
2. Determine the commit type from the work done (same convention as `rels-git-commit`)
3. Stage relevant files and commit:
   ```bash
   git add {changed files}
   git commit -m "{type}: {short description}"
   ```
4. Output the final list of committed files and the commit message

Do not skip this step. The user should not need to say "커밋해줘" separately.

## Data Transfer Protocol

| Method | Purpose |
|--------|---------|
| File-based (`_workspace/`) | Intermediate artifacts (`{stage}_{agent}_{name}.md`) |
| SendMessage | Key info between stages (hook names, props summary) |
| Actual `src/` paths | Final deliverables |

## Error Handling

- Agent failure: 1 retry → on second failure, orchestrator handles directly
- Conflicting information: use existing code as source of truth; ask user if uncertain
- Upstream dependency error: request rework from upstream agent, then re-run downstream

## Project Conventions (shared across all agents)

### FSD Directory Structure

```
src/
├── app/                   # Next.js routes (route components only)
├── entities/              # Domain entities
│   ├── {domain}/model/    # types.ts + useXxx.ts
│   └── {domain}/index.ts  # barrel exports
├── components/common/     # Shared UI components
├── shared/
│   ├── api/               # index.ts (wrappers), apiUrls.ts, queryKeys.ts
│   └── lib/               # axios instance, utilities
├── stores/                # Zustand (authStore)
├── assets/svg/            # SVG icon components
└── constants/             # App constants
```

Layer dependency direction: `app → entities/components ← shared` (no reverse imports)

### Tailwind v4 Color Tokens

| Token | Use |
|-------|-----|
| `main` | Primary action (`bg-main`, `text-main`) |
| `main-100/200/300` | Background and border shades |
| `error` | Error state (`text-error`, `border-error`) |

Never hardcode arbitrary colors (`text-blue-500`, `bg-red-100`, etc.).

### State Management

- **Server state:** TanStack Query v5 (`useQuery`, `useMutation`)
- **Global client state:** Zustand v5 (`authStore`)
- **Local state:** `useState`

### Auth and Role Pattern

```tsx
// Route protection
const { accessToken, initFromSession, user } = useAuthStore();
useEffect(() => {
  const token = initFromSession();
  if (!token) router.replace("/login");
}, [initFromSession, router]);
if (!accessToken) return <Spinner>;

// Role gates
const isAdmin = user?.role === "ADMIN";
const isCreator = user?.userId === resource.creatorId;
```

### Toast (sonner)

```tsx
import { toast } from "sonner";
toast.success("Saved.");
toast.error("Something went wrong.");
```

## Test Scenarios

**Happy path:** "Add search to the lecture list"
1. api-architect: add `search?: string` param to `useGetLectures`, handle query string in URL
2. component-writer: create `SearchInput` component
3. feature-builder: integrate SearchInput into home page, manage search state
4. qa: verify types + empty result state handling

**Error path:** component-writer imports a non-existent type
→ qa catches tsc error → SendMessage to component-writer → rework → qa re-validates
