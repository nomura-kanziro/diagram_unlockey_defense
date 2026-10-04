# Client

클라이언트 작업 브랜치의 문서 자리다.

Git 브랜치 `Client`가 있다. 클라이언트 기능 커밋은 이 브랜치에 둔다.

플레이하는 클라이언트는 루트 `Client`다. Vue 3와 Vite로 만들었고, 화면과 규칙은 `maple_unlucky_defense (51).html`과 같다. 상단 바를 전장 위에 두기 위해 화면만 세로로 쌓았다. 그 HTML은 원본으로 남아 있으며 수정하지 않았다.

실행은 `Client`에서 `npm install` 뒤 `npm run dev`다. 주소는 `http://localhost:5173/` 이다.

전투 상태, 소환, 강화, 합성, 승천, 라운드는 `Client/src/game/engine.js`에 있다. 서버로 상태를 보내지 않는다.
