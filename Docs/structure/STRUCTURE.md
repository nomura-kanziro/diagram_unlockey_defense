# structure

2026-10-04 기준 저장소 구조다. Vue 클라이언트 `Client`를 반영했다. 폴더나 파일이 바뀌면 이 문서를 갱신한다.

```
maple_unlucky_defense/
├── maple_unlucky_defense (51).html
├── README.md
├── AGENTS.md
├── package.json
├── package-lock.json
├── Client/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── .gitignore
│   ├── README.md
│   ├── scripts/
│   │   └── check-rules.mjs
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── styles/
│       │   └── game.css
│       ├── game/
│       │   ├── constants.js
│       │   └── engine.js
│       └── components/
│           ├── StartScreen.vue
│           ├── GameScreen.vue
│           └── ExplanationModal.vue
├── .agents/
│   └── RULES.md
├── .Grok/
│   ├── README.md
│   └── rules/
│       └── work-rules.md
├── .Claude/
│   ├── README.md
│   └── CLAUDE.md
├── .Codex/
│   ├── README.md
│   └── AGENTS.md
├── .Vscode/
│   ├── README.md
│   └── RULES.md
├── .Curser/
│   ├── README.md
│   └── RULES.md
└── Docs/
    ├── README.md
    ├── Architecture/
    │   └── ARCHITECTURE.md
    ├── Branchs/
    │   ├── Master/
    │   │   └── README.md
    │   ├── Devolop/
    │   │   └── README.md
    │   ├── Client/
    │   │   └── README.md
    │   ├── Server/
    │   │   └── README.md
    │   ├── database/
    │   │   └── README.md
    │   ├── docs/
    │   │   └── README.md
    │   └── commits/
    │       ├── COMMIT_GUIDE.md
    │       ├── COMMIT_TEMPLATE.md
    │       └── records/
    │           ├── 0001.md
    │           ├── 0002.md
    │           ├── 0003.md
    │           ├── 0004.md
    │           ├── 0005.md
    │           ├── 0006.md
    │           ├── 0007.md
    │           ├── 0008.md
    │           ├── 0009.md
    │           ├── 0010.md
    │           ├── 0011.md
    │           ├── 0012.md
    │           ├── 0013.md
    │           ├── 0014.md
    │           ├── 0015.md
    │           ├── 0016.md
    │           ├── 0017.md
    │           ├── 0018.md
    │           ├── 0019.md
    │           ├── 0020.md
    │           ├── 0021.md
    │           └── 0022.md
    ├── Build-up/
    │   └── BUILD_UP.md
    ├── Changelog/
    │   └── CHANGELOG.md
    ├── find_debug/
    │   ├── README.md
    │   ├── 20261004-155252-화면비율.md
    │   ├── 20261004-155410-배속소환.md
    │   └── 20261004-155515-합성등급.md
    ├── guidance/
    │   └── GUIDANCE.md
    ├── plan/
    │   └── README.md
    ├── repeater/
    │   └── REPEATER.md
    ├── structure/
    │   └── STRUCTURE.md
    ├── trainings/
    │   └── README.md
    ├── vaildates/
    │   └── README.md
    └── web_management/
        └── README.md
```

`.git`은 Git 메타데이터라 이 목록에 넣지 않는다.

## 루트 파일

| 파일 | 역할 |
|---|---|
| `maple_unlucky_defense (51).html` | 게임 원본. 시작 화면, 스타일, 전투 스크립트가 한 파일에 있다. |
| `README.md` | 플레이 규칙 설명. |
| `AGENTS.md` | 루트에서 여러 도구가 읽는 작업 규칙 사본. |
| `package.json` | 루트에서 `npm install`, `npm run dev`를 `Client`로 연결한다. |

## Client

Vue 3와 Vite로 만든 클라이언트다. `node_modules`와 `dist`는 `.gitignore`에 있어 이 목록에 넣지 않는다.

| 경로 | 역할 |
|---|---|
| `Client/index.html` | Vite 진입 HTML. 제목과 글꼴 |
| `Client/package.json` | `dev`, `build`, `check` 스크립트 |
| `Client/vite.config.js` | Vue 플러그인, 포트 5173 |
| `Client/src/main.js` | Vue 앱 시작 |
| `Client/src/App.vue` | 화면 전환과 S/N 키 |
| `Client/src/components/*.vue` | 시작 화면, 게임 화면, 설명 모달 |
| `Client/src/game/constants.js` | 등급, 보스 레벨, 소환 상한 100, 원형·삼각형·사각형 |
| `Client/src/game/engine.js` | 소환, 강화, 합성, 승천, 판매, 전투 루프. 묶음 판매는 고른 모양과 등급만 판다. 뫼비우스 스플래시는 태초, 종말과 같다 |
| `Client/src/styles/game.css` | 화면 스타일. 가로 전체를 쓰고 전장은 남은 칸에 맞춘 정사각형이다 |
| `Client/scripts/check-rules.mjs` | 피해, 판매가, 강화, 합성, 보스 체력 확인 |

## 에이전트 폴더

| 폴더 | 안의 파일 | 역할 |
|---|---|---|
| `.agents` | `RULES.md` | 통합 규칙 원본 |
| `.Grok` | `README.md`, `rules/work-rules.md` | Grok용 폴더와 자동 로드 규칙 |
| `.Claude` | `README.md`, `CLAUDE.md` | Claude Code용 폴더와 자동 로드 규칙 |
| `.Codex` | `README.md`, `AGENTS.md` | Codex용 폴더와 규칙 사본 |
| `.Vscode` | `README.md`, `RULES.md` | VS Code용 폴더와 규칙 사본. 편집기 설정 파일은 없다. |
| `.Curser` | `README.md`, `RULES.md` | 사용자가 지정한 Cursor용 폴더와 규칙 사본 |

## Docs

| 폴더 | 안의 파일 | 역할 |
|---|---|---|
| `Docs` | `README.md` | 문서 목록 |
| `Architecture` | `ARCHITECTURE.md` | 현재 프로토타입의 구성과 관계 |
| `Branchs/Master` | `README.md` | 메인 및 배포 브랜치 설명 |
| `Branchs/Devolop` | `README.md` | 개발 모드의 병합 대상. 완성 전에는 `master`로 병합하지 않는다 |
| `Branchs/Client` | `README.md` | 클라이언트 브랜치 설명 |
| `Branchs/Server` | `README.md` | 서버 브랜치 설명 |
| `Branchs/database` | `README.md` | 데이터베이스 브랜치 설명 |
| `Branchs/docs` | `README.md` | 문서 브랜치 설명 |
| `Branchs/commits` | `COMMIT_GUIDE.md`, `COMMIT_TEMPLATE.md`, `records/0001.md`부터 `records/0022.md` | 커밋 문장 규칙, 기록 템플릿, 커밋 기록 |
| `Build-up` | `BUILD_UP.md` | 확인된 준비 단계 |
| `Changelog` | `CHANGELOG.md` | 시간순 변경 이력 |
| `find_debug` | `README.md`, 화면·소환·합성 기록 | 디버그 기록 형식과 확인한 사건 |
| `guidance` | `GUIDANCE.md` | 작업 순서와 도구별 규칙 위치 |
| `plan` | `README.md` | 작업 전 계획 형식. 현재 계획 파일은 없다. |
| `repeater` | `REPEATER.md` | 반복되는 작업 절차와 게임 핵심 |
| `structure` | `STRUCTURE.md` | 이 문서 |
| `trainings` | `README.md` | 테스트 기록 |
| `vaildates` | `README.md` | 검증 기록 |
| `web_management` | `README.md` | 배포 전 점검과 배포 상태 |
