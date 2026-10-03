# 작업 규칙

메이플 운빨 디펜스 저장소의 작업 규칙이다. 통합 원본은 `.agents/RULES.md`이다. 이 파일은 `.Vscode` 폴더용 사본이다. Windows에서는 `.Vscode`와 `.vscode`가 같은 폴더다. VS Code Copilot이 저장소 루트에서 읽는 파일은 `AGENTS.md`이다.

같은 조항이 아래 사본에도 있다.

- `.agents/RULES.md`
- `AGENTS.md`
- `.Grok/rules/work-rules.md`
- `.Claude/CLAUDE.md`
- `.Codex/AGENTS.md`
- `.Curser/RULES.md`

조항을 고치면 원본과 사본을 함께 고친다. 설명은 `Docs/guidance/GUIDANCE.md`에 있다.

## 1. 원본을 훼손하지 않는다

수정이나 추가를 할 때, 사용자가 원본 변경을 지시하지 않았으면 원본을 바꾸지 않는다. 원본의 내용, 파일 이름, 동작을 유지한다. 추가가 필요하면 원본과 분리해서 둔다.

현재 게임 원본은 `maple_unlucky_defense (51).html`이다.

## 2. 섣불리 작업하지 않는다

대상과 영향 범위를 확인하기 전에 수정, 삭제, 이동, 브랜치 생성, 배포를 하지 않는다. 관련 코드와 `Docs`를 먼저 읽는다.

## 3. 도메인 지식의 오차를 줄인다

도메인, 서버, 클라이언트, 데이터베이스를 작업 전에 코드와 문서에서 확인한다. 확인하지 않은 구조나 동작을 있는 것처럼 적지 않는다. 아직 없는 서버와 데이터베이스는 없는 상태로 기록한다.

## 4. 사용자 지시를 따른다

사용자가 정한 이름, 범위, 순서를 지킨다. 지시하지 않은 리팩터링이나 이름 변경을 하지 않는다.

## 5. 커밋은 문서 폴더에서 확인한다

커밋 메시지는 `Docs/Branchs/commits/COMMIT_GUIDE.md`를 따른다. 영문 접두만 쓰고 본문은 한글로 쓴다. 커밋마다 `Docs/Branchs/commits/COMMIT_TEMPLATE.md` 형식으로 `Docs/Branchs/commits/records/`에 기록을 남긴다. 커밋 뒤에 그 기록과 `git log`를 대조한다.

## 6. Docs를 읽고 작업 뒤에 갱신한다

작업 전에 `Docs`의 관련 문서를 읽는다. 작업 뒤에 구성, 동작, 구조, 검증, 테스트, 변경 이력, 커밋 기록 중 바뀐 항목을 해당 문서에 갱신한다.

## 저장소 현황

- 실행 파일은 브라우저에서 여는 단일 HTML이다. 서버 프로세스와 데이터베이스는 아직 없다.
- 문서상 브랜치 역할은 Master(메인 및 배포), Devolop(개발 총합, 병합 전용, 테스트), Client, Server, database이다.
- Git에 브랜치를 더 만드는 일은 사용자 지시가 있을 때 한다. 이 규칙을 작성한 시점의 Git 브랜치는 `master`뿐이다.
