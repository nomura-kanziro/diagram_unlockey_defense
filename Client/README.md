# Client

메이플 운빨 디펜스의 Vue 3 클라이언트다. 화면, 문구, 등급, 소환, 강화, 합성, 승천, 전투 루프는 `maple_unlucky_defense (51).html`과 같다. 그 HTML 파일은 원본으로 남겨 두었고 이 폴더가 바꾸지 않는다.

## 실행

```
cd Client
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/` 을 연다.

규칙 수치 확인은 `npm run check`, 정적 빌드는 `npm run build`다. 빌드 결과는 `dist`이며 Git에는 넣지 않는다.

## 구성

| 경로 | 역할 |
|---|---|
| `src/App.vue` | 시작 화면, 게임 화면, 설명 모달, S/N 키 |
| `src/components/StartScreen.vue` | 시작 화면 |
| `src/components/GameScreen.vue` | 상단 상태, 캔버스, 사이드바, 로그 |
| `src/components/ExplanationModal.vue` | 원본과 같은 게임 설명 |
| `src/game/constants.js` | 등급, 확률, 합성, 보스 레벨 |
| `src/game/engine.js` | 원본 스크립트의 상태와 전투 루프 |
| `src/styles/game.css` | 원본 스타일 |

상단 바를 전장 위에 두기 위해 `.game-screen`에 `flex-direction: column`을 넣었다. 원본 CSS는 방향을 지정하지 않았다.
