---
name: rels-git-commit
description: |
  Stages and commits changes in the Rels repo following the project commit convention.
  Use this skill when asked to "커밋해줘", "commit", "변경사항 커밋", "저장해줘", or after finishing
  a feature/fix and needing to commit. Splits changes into granular logical units and commits each
  separately with a Korean message.
---

## Commit Type Convention

| Type | When to use |
|------|-------------|
| `feat` | New functionality added |
| `fix` | Bug or logic error corrected |
| `refactor` | Code restructured, behavior unchanged |
| `style` | Whitespace, formatting, semicolons — no logic change |
| `design` | CSS, Tailwind classes, UI layout change |
| `docs` | Documentation, comments, README |
| `test` | Test files added or modified |
| `chore` | Build config, package.json, CI, tooling |

## Commit Message Format

```
{type}: {한국어 설명}
```

- Always write the description in **Korean**
- One line, noun or verb ending (e.g. `~추가`, `~수정`, `~생성`)
- No file names in the message — describe the functionality
- Max ~60 characters total

### Good examples
```
feat: axios 인스턴스 생성
feat: 강연 목록 검색 훅 추가
feat: 취소 svg 생성
fix: 신청 버튼 hydration 깜빡임 수정
design: 강연 카드 모바일 레이아웃 개선
chore: tsc 타입 체크 훅 추가
```

### Bad examples
```
feat: LectureCard.tsx와 page.tsx 수정    ← lists file names
feat: 여러 기능 추가                      ← too vague
feat: axios 인스턴스 생성 및 강연 훅 추가  ← two things in one commit
```

## Execution Steps

1. Run `git status` to see all changed files
2. Run `git diff HEAD` to understand the actual changes
3. **Split into logical units** — group only files that belong together
4. Stage and commit each group separately (`git add .` is never used)
5. Run `git log --oneline -5` to confirm results

## How to Split into Logical Units

One commit = one logical unit. Judgment guide:

| Example | Commits |
|---------|---------|
| axios instance file | 1 commit |
| 1 SVG icon | 1 commit |
| 1 domain hook (types.ts + useXxx.ts + index.ts update) | 1 commit |
| 1 new page | 1 commit |
| page + its dedicated component | 1 commit |
| 2 unrelated hooks | 2 commits |

Even within the same domain, split if the pieces can function independently.

## Safety Rules

- Never use `--no-verify`
- Never amend a commit that has already been pushed
- Do not commit `.env`, `*.local`, or any file containing secrets
