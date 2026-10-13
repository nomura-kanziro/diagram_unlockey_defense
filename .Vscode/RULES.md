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

## 7. 개발 중에는 Devolop에만 병합한다

지금은 개발 모드다. 게임이 완성되기 전에는 `master`에 병합하지 않는다. `master`는 완성 뒤의 메인과 배포 브랜치다.

개발 중 병합 대상은 `Devolop`뿐이다. 철자는 `Devolop`이다. `develop`이나 `Develop`이라는 Git 브랜치를 만들지 않는다.

기능 커밋은 담당 브랜치에 남기고 그 브랜치를 `Devolop`으로 병합한다. `Devolop`에 기능 커밋을 직접 쌓지 않는다. 문서만 바꾸는 커밋은 `docs`에 둔 뒤 `Devolop`으로 병합한다.

2026-10-14에 `Client`를 `master`에 넣었던 병합은 취소했다. `master`는 병합 전 커밋 `adbef34f08df944c22dc789d609d16f93982534e`를 가리킨다.

`docs`와 `backup-before-split`은 2026-10-14에 `Devolop`으로 병합했다. `backup-before-split`의 파일 내용은 나누기 전 스냅샷이라 현재 트리를 유지했다. `Server`와 `database` 브랜치는 사용자 지시 없이 만들지 않는다.

## 저장소 현황

- 플레이하는 클라이언트는 루트 `Client`의 Vue 앱이다. 원본 `maple_unlucky_defense (51).html`은 변경 지시가 없으면 수정하지 않는다.
- 서버 프로세스와 데이터베이스는 아직 없다.
- 지금은 개발 모드다. 병합은 `Devolop`에만 하고, `master`는 완성이 끝난 뒤에만 병합한다.
- Git 브랜치는 `master`, `Devolop`, `Client`, `docs`, `backup-before-split`이 있다. `docs`와 `backup-before-split`의 커밋은 `Devolop`에 들어 있다.
