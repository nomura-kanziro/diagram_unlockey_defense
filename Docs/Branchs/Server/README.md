# Server

서버 작업 브랜치의 문서 자리다.

Git 브랜치 `Server`는 아직 없다. 사용자 지시 없이 만들지 않는다. 계정 서버 파일은 저장소 루트 `Server`에 있고, 커밋은 `Client`에 둔 뒤 `Devolop`으로 병합한다.

계정 서버는 `Server/index.js`다. Node 기본 모듈 `node:sqlite`를 쓰고 별도 패키지는 설치하지 않는다. 개발 중에는 Vite가 `127.0.0.1:8787`로 띄우고, 클라이언트는 `/api`로 호출한다.

- `POST /api/register` 아이디와 비밀번호로 가입하고 로그인 토큰을 준다.
- `POST /api/login` 아이디와 비밀번호로 로그인한다.
- `POST /api/logout` 토큰을 지운다.
- `GET /api/me` 로그인한 계정을 준다.
- `POST /api/clear` 난이도 클리어를 기록한다.

비밀번호는 scrypt 해시로 저장한다. 데이터베이스 파일은 `Server/data/accounts.sqlite`이고 Git에 넣지 않는다.
