# 반응속도 측정기

파란 화면을 클릭해 게임을 시작하면, 1~12초 뒤 랜덤한 시점에 화면이 빨간색으로 바뀝니다.
빨간색이 된 순간부터 클릭까지 걸린 시간(ms)을 측정해 초록 화면에 결과와 랭킹을 보여줍니다.
빨간색이 되기 전에 클릭하면 실패 처리되고 다시 시작할 수 있습니다.

## 동작 방식

1. 파란 화면 클릭 → 게임 시작 (`WAITING` 상태, 화면은 계속 파란색)
2. 랜덤(1~12초) 시간 뒤 화면이 빨간색으로 전환 (`READY` 상태)
3. 빨간색에서 클릭 → 반응속도(ms) 측정, 초록 화면(`RESULT`)에 결과 표시
4. 파란색 상태에서 미리 클릭 → 실패(`FAIL`) 처리 후 재시작 가능
5. 결과 화면에서 닉네임 입력 후 저장하면 Firestore에 기록이 저장되고, 랭킹(TOP 10)이 갱신됨

## 파일 구조

- `index.html`, `style.css` : 화면 마크업/스타일
- `src/game.js` : 게임 상태 머신 (DOM에 의존하지 않는 순수 로직)
- `src/firebase-service.js` : Firestore 연동. `saveScore(nickname, ms)` / `getTop(n)` 두 함수만 외부에 노출
- `src/firebase-config.js` : Firebase 프로젝트 설정값 (직접 채워야 함)
- `src/main.js` : 게임 로직 + Firebase 함수를 실제 DOM에 연결
- `firestore.rules` : Firestore 보안 규칙 예시
- `.github/workflows/deploy-pages.yml` : GitHub Pages 자동 배포 워크플로우

## Firebase 설정 방법

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정 > 일반 > "웹 앱 추가"로 웹 앱을 등록하고, 표시되는 `firebaseConfig` 값을
   `src/firebase-config.js`의 `firebaseConfig` 객체에 그대로 붙여넣습니다.
3. Firestore Database를 생성합니다 (프로덕션 모드 권장).
4. Firestore 규칙 탭에 `firestore.rules` 내용을 붙여넣고 게시합니다.
   (닉네임 12자 이하, ms는 0~12000 범위의 숫자만 생성 가능하도록 제한, 읽기는 누구나 가능)
5. 값을 채운 뒤 배포하면 랭킹 저장/조회가 정상 동작합니다.

## GitHub Pages 배포

이 저장소는 `main` 브랜치에 푸시되면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

1. 저장소 Settings > Pages 에서 Source를 **GitHub Actions**로 설정합니다. (최초 1회)
2. `main` 브랜치에 머지/푸시하면 `.github/workflows/deploy-pages.yml` 워크플로우가 실행되어 배포됩니다.

## 로컬 실행

ES 모듈(`type="module"`)을 사용하므로 `file://`로 바로 열면 CORS 문제로 동작하지 않습니다.
아래처럼 간단한 정적 서버로 실행하세요.

```bash
npx serve .
# 또는
python3 -m http.server 8000
```
