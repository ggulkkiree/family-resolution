// 🧠 Main Controller (사령관) - 완독 및 취소 로직 완벽 연동 버전
import { docRef } from './js/config.js';
import { onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { BIBLE_DATA, USER_SLOTS } from './js/data.js';
import * as UI from './js/ui.js';

let appData = {};
let myName = localStorage.getItem('myId');
let isDataLoaded = false;
let bibleState = { currentTestament: null, currentBook: null };
let rangeStart = null;

// 1. 앱 시작 및 실시간 데이터 리스너
function startApp() {
    onSnapshot(docRef, (snapshot) => {
        const splash = document.getElementById('splash-screen');
        if (snapshot.exists()) {
            appData = snapshot.data();
            isDataLoaded = true;
            
            // 로딩 화면 제거
            if (splash) { 
                splash.style.opacity = '0'; 
                setTimeout(() => splash.style.display = 'none', 500); 
            }

            // 기본 데이터 구조 초기화
            if (!appData.auth) appData.auth = {};
            if (!appData.period) {
                const y = new Date().getFullYear();
                appData.period = { start: `${y}-01-01`, end: `${y}-12-31` };
            }
            
            checkLoginStatus();
        } else {
            console.error("데이터를 불러올 수 없습니다.");
        }
    });
}

// 2. 데이터 저장 로직
async function saveData() {
    if (!isDataLoaded) return;
    try {
        await setDoc(docRef, appData);
        console.log("Data Sync Success!");
    } catch (e) {
        console.error("Save Error:", e);
        alert("데이터 저장 중 오류가 발생했습니다.");
    }
}

// 3. 로그인 상태 체크 및 화면 렌더링
function checkLoginStatus() {
    const loginModal = document.getElementById('login-modal');
    const appContainer = document.getElementById('app-container');

    if (!myName) {
        loginModal.classList.remove('hidden');
        appContainer.classList.add('hidden');
        renderLoginGrid();
    } else {
        loginModal.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // 현재 탭에 맞는 화면 렌더링
        const activeTab = document.querySelector('.nav-item.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
            refreshUI(tabName);
        } else {
            refreshUI('resolution');
        }
    }
}

// 4. 성경 완독 로직 (Finish)
window.finishBook = async () => {
    const bookName = bibleState.currentBook;
    if (!bookName) return;

    if (!appData[myName].bibleRounds) appData[myName].bibleRounds = {};
    
    // 현재 독수 증가
    const currentRound = appData[myName].bibleRounds[bookName] || 0;
    appData[myName].bibleRounds[bookName] = currentRound + 1;

    // 해당 권의 모든 장 체크 기록 초기화 (다음 독을 위해)
    const book = BIBLE_DATA.books.find(b => b.name === bookName);
    for (let i = 1; i <= book.chapters; i++) {
        delete appData[myName].bible[`${bookName}-${i}`];
    }

    await saveData();
    alert(`🎉 [${bookName}] ${currentRound + 1}독을 축하합니다!`);
    UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
};

// 5. [신규] 성경 완독 취소 로직 (Undo Finish)
window.undoFinishBook = async () => {
    const bookName = bibleState.currentBook;
    if (!bookName) return;

    const currentRound = (appData[myName].bibleRounds && appData[myName].bibleRounds[bookName]) || 0;
    if (currentRound <= 0) return;

    if (!confirm(`'${bookName}'의 완독(🔄 ${currentRound}독)을 취소하시겠습니까?\n(가장 최근의 완독 기록이 삭제됩니다.)`)) return;

    // 독수 1 차감
    appData[myName].bibleRounds[bookName] = currentRound - 1;
    if (appData[myName].bibleRounds[bookName] === 0) {
        delete appData[myName].bibleRounds[bookName];
    }

    // 취소 시 UI 편의를 위해 해당 권의 모든 장을 다시 '읽음' 상태로 되돌림 (완독 직전 상태)
    const book = BIBLE_DATA.books.find(b => b.name === bookName);
    const today = UI.getTodayDate();
    if (!appData[myName].bible) appData[myName].bible = {};
    
    for (let i = 1; i <= book.chapters; i++) {
        appData[myName].bible[`${bookName}-${i}`] = today;
    }

    await saveData();
    alert("완독 기록이 취소되었습니다.");
    UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
};

// 6. 성경 장별 토글 (Range Fix 포함)
window.toggleChapter = async (num, key, isChecking) => {
    if (!appData[myName].bible) appData[myName].bible = {};
    if (!appData[myName].bibleLog) appData[myName].bibleLog = [];

    const today = UI.getTodayDate();

    // 범위 선택 (Shift 클릭 대용)
    if (isChecking && rangeStart !== null) {
        const start = Math.min(rangeStart, num);
        const end = Math.max(rangeStart, num);
        for (let i = start; i <= end; i++) {
            const k = `${bibleState.currentBook}-${i}`;
            if (!appData[myName].bible[k]) {
                appData[myName].bible[k] = today;
                appData[myName].bibleLog.push({ date: today, book: bibleState.currentBook, chapter: i });
            }
        }
        rangeStart = null;
    } else {
        if (isChecking) {
            appData[myName].bible[key] = today;
            appData[myName].bibleLog.push({ date: today, book: bibleState.currentBook, chapter: num });
            rangeStart = num; // 범위 시작점 설정
        } else {
            delete appData[myName].bible[key];
            appData[myName].bibleLog = appData[myName].bibleLog.filter(e => !(e.book === bibleState.currentBook && e.chapter === num));
            rangeStart = null;
        }
    }
    
    await saveData();
    UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
};

// 7. 기타 UI 조작 윈도우 함수들
window.goTab = (tab, el) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    refreshUI(tab);
};

window.showChapters = (bookName) => {
    bibleState.currentBook = bookName;
    document.getElementById('bible-book-title').innerText = bookName;
    document.getElementById('modal-bible-chapters').classList.remove('hidden');
    UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
};

window.closeChapterModal = () => {
    document.getElementById('modal-bible-chapters').classList.add('hidden');
    bibleState.currentBook = null;
    rangeStart = null;
    UI.renderBibleBooks(appData, myName, bibleState);
};

window.setTestament = (type) => {
    bibleState.currentTestament = type;
    document.querySelectorAll('.testament-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    UI.renderBibleBooks(appData, myName, bibleState);
};

function refreshUI(tab) {
    if (tab === 'resolution') {
        UI.renderResolutionList(appData, myName);
        UI.renderFamilyGoals(appData, myName);
    } else if (tab === 'bible') {
        if (!bibleState.currentTestament) bibleState.currentTestament = '구약';
        UI.renderBibleBooks(appData, myName, bibleState);
    } else if (tab === 'dashboard') {
        UI.renderDashboard(appData, myName);
    } else if (tab === 'chat') {
        UI.renderMessages(appData);
    }
}

// 8. 초기화 실행
startApp();

// 9. 로그인 그리드 렌더링 (최초 1회)
function renderLoginGrid() {
    const grid = document.getElementById('login-grid');
    grid.innerHTML = USER_SLOTS.map(slot => {
        const user = appData.auth[slot];
        return `
            <div class="login-card" onclick="window.loginAs('${slot}')">
                <div class="login-avatar">${user ? user.name[0] : '?'}</div>
                <div class="login-name">${user ? user.name : '미등록'}</div>
            </div>
        `;
    }).join('');
}

window.loginAs = (slot) => {
    if (!appData.auth[slot]) {
        const name = prompt("이 슬롯에 등록할 이름을 입력하세요:");
        if (!name) return;
        appData.auth[slot] = { name: name };
        appData[slot] = { resolution: [], history: {}, bible: {}, bibleLog: [], bibleRounds: {} };
        saveData();
    }
    localStorage.setItem('myId', slot);
    myName = slot;
    checkLoginStatus();
};
