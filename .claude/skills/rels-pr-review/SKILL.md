---
name: rels-pr-review
description: |
  Fetches PR review comments for the Rels repo, applies the requested code changes, and posts
  reply comments confirming each fix.
  Use this skill when asked to "리뷰 반영해줘", "코멘트 처리해줘", "PR 리뷰 답글 달아줘",
  "리뷰 코멘트 적용해줘", or "review 반영".
---

## Execution Steps

### Step 1: Identify the PR

If a PR number is given, use it. Otherwise, detect from the current branch:
```bash
gh pr view --json number,title,url
```

### Step 2: Fetch all review comments

```bash
# Inline code review comments (line-level)
gh api repos/:owner/:repo/pulls/{PR_NUMBER}/comments \
  --jq '[.[] | {id, path, line, body, user: .user.login}]'

# General review-level comments
gh pr view {PR_NUMBER} --json reviews \
  --jq '.reviews[] | select(.state != "APPROVED") | {id, body, state, author: .author.login}'
```

Get owner/repo from:
```bash
gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"'
```

### Step 3: Process each comment

For every review comment, in order:

1. **Read** the file at the commented path and line
2. **Understand** the requested change
3. **Apply** the fix using Edit (prefer surgical edits over full rewrites)
4. **Verify** the fix makes sense in context
5. **Record** the comment ID for the reply step

Group comments on the same file to minimize reads.

### Step 4: Run type check after all fixes

```bash
npx tsc --noEmit
```

Fix any type errors before proceeding.

### Step 5: Commit all changes at once

Single commit after all code changes are done:
```bash
git add {changed files}
git commit -m "fix: 리뷰 코멘트 반영"
```

Get the short hash immediately after:
```bash
git rev-parse --short HEAD
```

### Step 6: Post reply to each comment

Reply using the commit hash from Step 5:
```bash
gh api repos/:owner/:repo/pulls/comments/{COMMENT_ID}/replies \
  -X POST \
  -f body="반영했습니다. {SHORT_HASH}"
```

Reply format — commit hash only, no description:
```
반영했습니다. a3f91bc
```

If the comment is a **question** (no code change needed), reply with a brief explanation in Korean.

If **disagreeing or needing clarification**:
```
확인했습니다. 의도한 동작이 맞다면 유지하겠습니다. 의견 주시면 반영하겠습니다.
```

### Step 7: Summary report

```
## 리뷰 반영 결과

커밋: {SHORT_HASH}

반영 완료 {N}건:
1. {file}:{line} → 답글 게시 ✓
2. {file}:{line} → 답글 게시 ✓

건너뜀 (질문/확인 필요): {해당 항목}
```

## Edge Cases

- **Comment on a deleted file**: note in summary, reply explaining the file was removed
- **Conflicting comments**: apply both, or ask user to prioritize
- **Thread already resolved**: verify the fix is actually in place before skipping
- **Cannot determine intent**: reply asking for clarification, never guess
