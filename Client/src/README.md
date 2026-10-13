# src

Vue 클라이언트의 소스다. `main.js`가 앱을 만들고 `styles/game.css`를 읽은 뒤 `#app`에 붙인다.

| 경로 | 역할 |
|---|---|
| `main.js` | Vue 앱 시작 |
| `App.vue` | 시작 화면, 게임 화면, 설명 모달. 개발 중에는 `window.__MAPLE_GAME__`에 게임을 둔다. S는 소환, N은 다음 라운드 |
| `components/` | 시작 화면, 게임 화면, 설명 모달 |
| `game/` | 상수, 전투 엔진, 계정 API 호출 |
| `styles/` | 화면 스타일 |
