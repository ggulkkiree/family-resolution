// ⚙️ Firebase 설정 및 연결 파일
// 앱의 '열쇠' 역할을 하는 중요한 파일입니다.

// Firebase 라이브러리 가져오기 (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 우리 앱의 비밀번호(설정)
const firebaseConfig = {
    apiKey: "AIzaSyD0Vorv3SFatQuC7OCYHPA-Nok4DlqonrI",
    authDomain: "family-resolution.firebaseapp.com",
    projectId: "family-resolution",
    storageBucket: "family-resolution.firebasestorage.app",
    messagingSenderId: "711396068080",
    appId: "1:711396068080:web:861c41a8259f0b6dca9035",
    measurementId: "G-RH6E87B4H0"
};

// Firebase 시작!
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 우리가 사용하는 문서 위치 (FamilyGoals_2026_Official)
// 이 'docRef'를 다른 파일들이 가져다 쓰게 됩니다.
export const docRef = doc(db, "appData", "FamilyGoals_2026_Official");
export { db };
