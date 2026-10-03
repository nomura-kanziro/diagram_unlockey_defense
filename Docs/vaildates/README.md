# vaildates

검증한 항목과 근거를 남긴다. 폴더 철자는 사용자가 지정한 `vaildates`다.

## 2026-10-04 문서 골격 검증

대상은 에이전트 규칙과 `Docs` 추가다. 게임 동작 변경은 검증 대상이 아니다.

| 항목 | 기준 | 결과 |
|---|---|---|
| 통합 폴더 | `.agents/RULES.md`에 규칙 1~6이 있다 | 작성함 |
| Grok | `.Grok/rules/work-rules.md`가 있다 | 작성함 |
| Claude | `.Claude/CLAUDE.md`가 있다 | 작성함 |
| Codex | `.Codex/AGENTS.md`가 있다 | 작성함 |
| VS Code | `.Vscode/RULES.md`가 있다. 편집기 설정 파일은 없다 | 작성함 |
| Cursor | `.Curser/RULES.md`가 있다 | 작성함 |
| 루트 자동 로드 | `AGENTS.md`가 있다 | 작성함 |
| Docs | Architecture, Branchs, Build-up, Changelog, find_debug, guidance, plan, repeater, structure, trainings, vaildates, web_management | 작성함 |
| Branchs | Master, Devolop, Client, Server, database, commits | 작성함 |
| 커밋 문서 | 가이드와 템플릿이 `Docs/Branchs/commits`에 있다 | 작성함 |
| 원본 유지 | HTML SHA256이 작업 전 `4D172ACCA6582D379B5218A6BA635DFD72D4945F7AD4E70C4E074C3337711BEE`와 같다 | 통과. 2026-10-04 05:46:39 재계산 값이 같다 |
| 없는 브랜치 | `Devolop`, `Client`, `Server`, `database` Git 브랜치를 만들지 않는다 | 만들지 않음 |
| 계획 파일 | 이번 실행 명령에 대한 사후 계획을 `Docs/plan`에 넣지 않는다 | 형식 설명만 있음 |

2026-10-04 05:46:39에 SHA256을 다시 계산했고 작업 전 해시와 같았다. 원본 유지 항목은 통과다.
