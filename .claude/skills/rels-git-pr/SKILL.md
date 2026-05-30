---
name: rels-git-pr
description: |
  Creates a GitHub Pull Request for the Rels repo following the project PR template.
  Use this skill when asked to "PR 만들어줘", "PR 올려줘", "pull request 생성", "PR 작성해줘".
  Fills in the Korean PR template, determines the type prefix for the title from the branch commits,
  and runs gh pr create.
---

## PR Title Format

```
{type}: {한국어 설명}
```

Type follows the same convention as commit types:
`feat` | `fix` | `refactor` | `style` | `design` | `docs` | `test` | `chore`

If the branch has mixed types, use the most significant one (`feat` > `fix` > `refactor` > others).

### Examples
```
feat: 강연 목록 검색 기능 추가
fix: 신청 버튼 hydration 깜빡임 수정
design: 강연 카드 모바일 레이아웃 개선
chore: Claude Code 하네스 설정 추가
```

## PR Template

Fill every section in Korean. Use `-` bullet points in 작업 내용.

```markdown
## ❓ 개요

{이 PR이 왜 필요한지, 어떤 문제를 해결하는지 1-2문장}

## #️⃣ 연관된 이슈

{관련 이슈 번호 (예: close #12, 관련 #8). 없으면 "없음"}

## 📝 작업 내용

- {작업한 내용 — 논리 단위 하나당 불릿 하나}
- {파일명 나열 금지, 기능 중심으로 작성}

## 📄 리뷰 요청사항

> {리뷰어가 집중해서 봐줬으면 하는 부분. 없으면 "없음"}

## 📸 스크린샷/영상(선택)

{UI 변경이 있으면 첨부. 없으면 생략 또는 "없음"}
```

## Execution Steps

1. Confirm current branch is not `main` or `develop`
   ```bash
   git branch --show-current
   ```
2. Check for uncommitted changes — if any, run `rels-git-commit` first
   ```bash
   git status
   ```
3. Read commits on this branch
   ```bash
   git log main..HEAD --oneline
   ```
4. Read the diff stat
   ```bash
   git diff main..HEAD --stat
   ```
5. Determine type, title, and body content
6. Push the branch
   ```bash
   git push -u origin HEAD
   ```
7. Create the PR
   ```bash
   gh pr create \
     --title "{type}: {한국어 설명}" \
     --body "$(cat <<'EOF'
   ## ❓ 개요

   {개요}

   ## #️⃣ 연관된 이슈

   {이슈}

   ## 📝 작업 내용

   - {항목1}
   - {항목2}

   ## 📄 리뷰 요청사항

   > {요청사항}

   ## 📸 스크린샷/영상(선택)

   {없음}
   EOF
   )"
   ```
8. Output the PR URL

## Base Branch

- Default base: `main`
- If the branch was cut from `develop`, use `develop` as base

## Safety Rules

- Never create a PR from `main` to `main`
- Stop and ask user to commit first if `git status` shows uncommitted changes
- Confirm at least one commit ahead of base before creating PR
