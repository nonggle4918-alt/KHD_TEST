// Firestore를 이용한 랭킹 저장/조회.
// 요구사항에 맞춰 저장(saveScore)과 조회(getTop) 두 함수로만 외부에 노출한다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SCORES_COLLECTION = "scores";

/**
 * 반응속도 기록을 Firestore에 저장한다.
 * @param {string} nickname 닉네임 (최대 12자)
 * @param {number} ms 반응속도(ms), 낮을수록 좋은 기록
 */
export async function saveScore(nickname, ms) {
  await addDoc(collection(db, SCORES_COLLECTION), {
    nickname: (nickname || "익명").slice(0, 12),
    ms,
    createdAt: serverTimestamp(),
  });
}

/**
 * 반응속도가 빠른 순으로 상위 n개의 기록을 가져온다.
 * @param {number} n 가져올 개수
 * @returns {Promise<Array<{nickname: string, ms: number}>>}
 */
export async function getTop(n) {
  const q = query(collection(db, SCORES_COLLECTION), orderBy("ms", "asc"), limit(n));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}
