# Build-up

기능을 한 번에 가정하지 않고, 확인된 단계만 쌓는다. 다음 단계는 사용자가 확정한 뒤에 `Docs/plan`에 적고, 그 작업이 끝난 뒤 이 문서에 단계를 추가한다.

## 0. 프로토타입

브라우저에서 여는 `maple_unlucky_defense (51).html`이 있다. 전투, 소환, 강화, 합성, 승천이 이 파일 안에서 동작한다. 서버와 데이터베이스는 없다.

이 단계는 이번 문서 작업 전에 이미 있었다. 이번 작업에서 파일 내용은 바꾸지 않는다.

## 1. 작업 규칙과 문서 골격

2026-10-04에 추가했다.

- 통합 규칙 `.agents/RULES.md`
- 도구별 폴더 `.Grok`, `.Claude`, `.Codex`, `.Vscode`, `.Curser`
- 루트 `AGENTS.md`
- `Docs`의 Architecture, Branchs, Build-up, Changelog, find_debug, guidance, plan, repeater, structure, trainings, vaildates, web_management

이 단계는 문서를 쌓는 단계다. 게임 동작을 바꾸지 않는다.

## 2. Vue 클라이언트

2026-10-04에 루트 `Client`를 추가했다.

- Vue 3와 Vite
- 원본 HTML의 화면과 전투 규칙을 `src/game/engine.js`로 옮김
- 원본 HTML 파일은 유지

서버와 데이터베이스는 이 단계에 없다.

## 3. 화면, 배속, 합성 수정

2026-10-04에 Vue 클라이언트만 고쳤다.

- 화면이 가로 전체를 채우고 비율에 맞게 전장 크기가 변함
- 배속 변경 뒤에도 이번 라운드의 남은 적이 나옴
- 배속은 소환 유닛의 공격 간격에도 적용됨
- 합성 버튼이 자기 등급만 합침
- 원본 HTML 파일은 유지
