# src

계정 API의 Express 구성이다. `Server/index.js`가 이 폴더를 불러 듣는다.

| 파일 | 역할 |
|---|---|
| `app.js` | `createApp(store)`. `x-powered-by`를 끄고 JSON은 100kb까지 받는다. 라우터는 `/api`에 붙인다 |
| `accounts.js` | `accountRouter(store)`. 비밀번호는 scrypt, 세션 토큰은 무작위 24바이트 hex |
| `db.js` | `openDatabase(dbPath)`. `users`와 `sessions` 테이블. 클리어 칸은 고정된 이름만 갱신한다 |
