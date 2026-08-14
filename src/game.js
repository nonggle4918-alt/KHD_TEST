// 반응속도 게임의 상태 머신.
// DOM을 직접 다루지 않고, 상태 변화가 생길 때마다 등록된 콜백을 호출한다.

export const STATE = {
  IDLE: "idle", // 시작 대기 (파란 화면)
  WAITING: "waiting", // 시작 클릭 후, 빨간색이 되기 전까지 대기 (파란 화면)
  READY: "ready", // 빨간 화면, 클릭을 기다림
  RESULT: "result", // 클릭 완료, 기록 표시 (초록 화면)
  FAIL: "fail", // 빨간색이 되기 전에 클릭함
};

const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;

export function createGame({ onStateChange, onResult }) {
  let state = STATE.IDLE;
  let timerId = null;
  let readyAt = 0;

  function setState(next) {
    state = next;
    onStateChange(state);
  }

  function start() {
    if (state !== STATE.IDLE && state !== STATE.RESULT && state !== STATE.FAIL) return;
    setState(STATE.WAITING);
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    timerId = setTimeout(() => {
      readyAt = performance.now();
      setState(STATE.READY);
    }, delay);
  }

  function click() {
    if (state === STATE.WAITING) {
      clearTimeout(timerId);
      setState(STATE.FAIL);
      return;
    }
    if (state === STATE.READY) {
      const ms = Math.round(performance.now() - readyAt);
      setState(STATE.RESULT);
      onResult(ms);
    }
  }

  function reset() {
    clearTimeout(timerId);
    setState(STATE.IDLE);
  }

  return { start, click, reset, getState: () => state };
}
