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

화면은 브라우저 가로 전체를 쓰고, 원형 전장은 남은 칸의 비율에 맞춰 정사각형으로 커지거나 줄어든다. 세로가 더 긴 화면에서는 사이드바가 전장 아래로 내려간다. 캔버스 비트맵은 700×700이라 좌표는 그대로다. 일반 라운드에서 배속을 바꿔도 남은 적 소환은 이어진다. 합성은 클릭한 유닛의 등급만 합친다. 소환 유닛의 공격 간격은 게임 배속을 따른다.
