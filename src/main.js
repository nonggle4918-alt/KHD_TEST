import { createGame, STATE } from "./game.js";
import { saveScore, getTop } from "./firebase-service.js";

const RANKING_SIZE = 10;

const screen = document.getElementById("game-screen");
const message = document.getElementById("message");
const overlay = document.getElementById("overlay");
const resultView = document.getElementById("result-view");
const failView = document.getElementById("fail-view");
const resultMsEl = document.getElementById("result-ms");
const nicknameInput = document.getElementById("nickname-input");
const saveBtn = document.getElementById("save-btn");
const saveStatus = document.getElementById("save-status");
const rankingList = document.getElementById("ranking-list");
const playAgainBtn = document.getElementById("play-again-btn");
const retryBtn = document.getElementById("retry-btn");

let lastMs = 0;

function onStateChange(state) {
  screen.className = `screen ${state}`;
  overlay.classList.toggle("hidden", state !== STATE.RESULT && state !== STATE.FAIL);
  resultView.classList.toggle("hidden", state !== STATE.RESULT);
  failView.classList.toggle("hidden", state !== STATE.FAIL);

  if (state === STATE.IDLE) message.textContent = "클릭해서 시작";
  else if (state === STATE.WAITING) message.textContent = "빨간색이 될 때까지 기다리세요...";
  else if (state === STATE.READY) message.textContent = "지금 클릭!";
  else message.textContent = "";
}

async function onResult(ms) {
  lastMs = ms;
  resultMsEl.textContent = ms;
  nicknameInput.value = "";
  saveStatus.textContent = "";
  saveBtn.disabled = false;
  await refreshRanking();
}

async function refreshRanking() {
  try {
    const top = await getTop(RANKING_SIZE);
    rankingList.innerHTML = top
      .map((r) => `<li>${escapeHtml(r.nickname)} - ${r.ms}ms</li>`)
      .join("") || "<li>아직 기록이 없습니다</li>";
  } catch (err) {
    console.error(err);
    rankingList.innerHTML = "<li>랭킹을 불러오지 못했습니다 (Firebase 설정을 확인하세요)</li>";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

const game = createGame({ onStateChange, onResult });

screen.addEventListener("click", () => {
  if (game.getState() === STATE.IDLE) game.start();
  else game.click();
});

saveBtn.addEventListener("click", async () => {
  const nickname = nicknameInput.value.trim() || "익명";
  saveBtn.disabled = true;
  saveStatus.textContent = "저장 중...";
  try {
    await saveScore(nickname, lastMs);
    saveStatus.textContent = "저장되었습니다!";
    await refreshRanking();
  } catch (err) {
    console.error(err);
    saveStatus.textContent = "저장 실패 (Firebase 설정을 확인하세요)";
    saveBtn.disabled = false;
  }
});

playAgainBtn.addEventListener("click", () => game.reset());
retryBtn.addEventListener("click", () => game.reset());

onStateChange(STATE.IDLE);
