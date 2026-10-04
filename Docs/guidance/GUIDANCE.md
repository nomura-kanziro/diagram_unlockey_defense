# guidance

에이전트와 사람이 이 저장소에서 같은 순서로 일하기 위한 설명이다.

## 작업 순서

1. `.agents/RULES.md`의 여섯 조항을 따른다.
2. `Docs/README.md`에서 이번 작업과 관계된 폴더를 고르고 그 문서를 읽는다.
3. 게임 동작을 다루면 루트 `README.md`와 `Docs/Architecture/ARCHITECTURE.md`를 읽는다. 수치가 필요하면 `maple_unlucky_defense (51).html`을 확인한다. 확인하지 않은 수치는 문서에 새로 적지 않는다.
4. 사용자가 원본 변경을 지시하지 않았으면 `maple_unlucky_defense (51).html`을 수정하지 않는다.
5. 사용자가 확정한 명령의 작업 전 계획만 `Docs/plan`에 작성한다. 이미 실행 중인 지시의 사후 계획을 만들어 넣지 않는다.
6. 작업 뒤에 바뀐 폴더가 있으면 `Docs/structure/STRUCTURE.md`를 고친다. 동작이 바뀌면 `Architecture`, 단계가 쌓이면 `Build-up`, 변경 이력은 `Changelog`, 테스트는 `trainings`, 검증은 `vaildates`, 배포 상태는 `web_management`를 갱신한다.
7. 커밋은 `Docs/Branchs/commits/COMMIT_GUIDE.md`와 `COMMIT_TEMPLATE.md`를 따른다. 커밋 뒤에 `records`와 `git log`를 대조한다.

## 여섯 조항이 들어 있는 파일

통합 원본은 `.agents/RULES.md`다. 조항 문장을 고치면 아래 사본을 함께 고친다.

| 파일 | 읽는 주체 |
|---|---|
| `.agents/RULES.md` | 통합 원본. 사람이 고치는 기준 |
| `AGENTS.md` | Grok, Codex, Cursor, VS Code Copilot이 저장소 루트에서 읽음 |
| `.Grok/rules/work-rules.md` | Grok이 `.grok/rules/*.md`로 읽음 |
| `.Claude/CLAUDE.md` | Claude Code가 `.claude/CLAUDE.md`로 읽음. Grok 호환 모드도 이 경로를 읽을 수 있음 |
| `.Codex/AGENTS.md` | `.Codex` 폴더 사본. Codex의 기본 프로젝트 지침은 루트 `AGENTS.md` |
| `.Vscode/RULES.md` | `.Vscode` 폴더 사본. Copilot의 기본 프로젝트 지침은 루트 `AGENTS.md` |
| `.Curser/RULES.md` | 사용자가 지정한 Cursor 폴더 사본. Cursor의 `.cursor/rules`는 만들지 않음 |

Windows 파일 시스템은 대소문자를 구분하지 않는다. `.Grok`은 `.grok`, `.Claude`는 `.claude`, `.Codex`는 `.codex`, `.Vscode`는 `.vscode`와 같은 폴더다. `.Curser`는 `.cursor`와 다른 폴더다. `.agents`는 별도 폴더다.

`.Vscode`에 편집기 설정 파일을 사용자 지시 없이 추가하지 않는다.

## 브랜치 이름

문서 안의 역할 이름과 Git 브랜치를 구분한다.

| 문서 폴더 | 역할 | Git 브랜치 (2026-10-04) |
|---|---|---|
| `Docs/Branchs/Master` | 메인 및 배포 | `master`만 있음 |
| `Docs/Branchs/Devolop` | 개발 총합, 병합 전용, 테스트 | 없음 |
| `Docs/Branchs/Client` | 클라이언트 | 없음 |
| `Docs/Branchs/Server` | 서버 | 없음 |
| `Docs/Branchs/database` | 데이터베이스 | 없음 |

없는 브랜치는 사용자 지시 없이 만들지 않는다. 철자 `Devolop`, `vaildates`, `.Curser`는 사용자가 지정한 이름이라 그대로 둔다.

## 도메인 경계

플레이용 클라이언트는 루트 `Client`의 Vue 앱이다. 원본은 `maple_unlucky_defense (51).html`이며, 변경 지시가 없으면 그 파일을 수정하지 않는다. 서버와 데이터베이스 코드는 없다. 세 영역을 문서로 나누어 두었더라도, 없는 구현을 있는 것처럼 설계도에 추가하지 않는다. 구현 명령이 확정되면 `Docs/plan`에 적은 뒤 해당 `Branchs` 문서를 갱신한다.

## 커밋 문장

영문 접두만 쓰고 본문은 한글로 쓴다.

```
feat : 각 문서 페이지 수정 및 커밋 가이드 작성
```

접두는 `COMMIT_GUIDE.md`의 표를 따른다.
