---
name: rels-issue-analysis
description: |
  Fetches and analyzes a GitHub issue for the Rels repo, then maps it to an actionable work plan.
  Use this skill when asked to "이슈 분석해줘", "이슈 #N 봐줘", "이슈 보고", "어떤 작업인지 알려줘",
  or before starting work on a reported issue.
---

## Execution Steps

### Step 1: Fetch the issue

```bash
gh issue view {N} --json title,body,labels,assignees,comments
```

If no issue number is given, list open issues first:
```bash
gh issue list --state open --limit 20
```

### Step 2: Analyze the issue

Identify:
- **Type**: bug / feature request / design / chore / question
- **Domain**: lecture / notice / auth / component / infrastructure
- **Affected layers**: entities (hooks/types) / components / pages / shared / config
- **Acceptance criteria**: what "done" looks like

### Step 3: Map to codebase

Locate relevant files based on the domain and issue description:
- Bug in enrollment → `src/entities/lecture/model/useEnrollLecture.ts`, `src/app/lectures/[lectureId]/page.tsx`
- UI issue on lecture card → `src/components/common/LectureCard.tsx`
- Auth flow problem → `src/stores/authStore.ts`, `src/shared/lib/axios.ts`
- Notice CRUD → `src/entities/notice/`, `src/app/notification/`

Read the identified files to understand the current implementation before proposing a plan.

### Step 4: Output a structured work plan

```
## Issue #{N}: {title}

**Type:** {bug | feature | design | chore}
**Domain:** {lecture | notice | auth | component | infra}
**Affected layers:** {entities | components | pages | shared}

### Summary
{1-2 sentences on what the issue is about}

### Root cause / Gap
{For bugs: what is causing it. For features: what is currently missing.}

### Work plan
1. [{layer}] {specific action} — {file path}
2. [{layer}] {specific action} — {file path}
...

### Suggested commit type
`{type}`: {short description}

### Notes
{Any edge cases, risks, or questions to clarify before starting}
```

### Step 5: Offer to trigger the orchestrator

After outputting the plan, ask:
> "Should I start implementing this now with the rels-orchestrator?"

If yes, hand the work plan to `rels-orchestrator` as the requirements input.

## Tips

- Check if the issue has linked PRs already: `gh issue view {N} --json closedByPullRequests`
- Check related issues/comments for context before proposing a plan
- If the issue is a bug, reproduce the scenario mentally by tracing the code path before suggesting a fix
