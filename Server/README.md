# Server

도형 운빨 디펜스의 계정 API다. Node.js와 Express로 만든다. 전투는 처리하지 않는다.

Git 브랜치 `Server`는 없다. 이 폴더의 커밋은 `Client`에 둔다. 브랜치 설명은 `Docs/Branchs/Server/README.md`에 있다.

## 실행

개발 중에는 Vite가 `PORT=8787`로 `index.js`를 띄운다. 직접 띄울 때는 이 폴더에서 `npm install` 뒤 `npm start`다. 확인은 `npm run check`다.

듣는 주소는 `127.0.0.1`이다. 기본 포트는 8787이다.

| 경로 | 역할 |
|---|---|
| `index.js` | 데이터베이스를 열고 앱을 듣는다. 기본 파일은 `data/accounts.sqlite` |
| `src/app.js` | Express 앱. JSON 본문, `/api`, 404, 오류 |
| `src/accounts.js` | 가입, 로그인, 로그아웃, 내 정보, 클리어 |
| `src/db.js` | `node:sqlite`로 사용자와 세션을 연다 |
| `check-accounts.mjs` | 가입, 로그인, 난이도 해금, 명예의 전당을 확인한다 |
| `package.json` | `start`, `check`. 의존성은 Express |

`data/`는 Git에 넣지 않는다. 계정 데이터베이스가 실행할 때 생긴다. `node_modules`도 Git에 넣지 않는다.
