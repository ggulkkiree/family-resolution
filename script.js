/* =================================================================
   [0] 긴급 스타일 주입 (스크롤 해결사)
   ================================================================= */
(function fixStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        html, body { overflow: hidden; height: 100%; margin: 0; padding: 0; }
        #app-container { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .page-content, #page-resolution, #page-bible, #page-stats {
            flex: 1; overflow-y: auto !important; padding-bottom: 100px; -webkit-overflow-scrolling: touch;
        }
        .resolution-item { margin-bottom: 15px; }
        #page-stats { min-height: 100%; display: block !important; }
    `;
    document.head.appendChild(style);
})();

/* =================================================================
   [1] 모듈 불러오기 & 설정
   ================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// [중요] 고객님 프로젝트 정보에 맞춘 설정 (비공개 키 아님, 공개용 설정)
const firebaseConfig = {
  apiKey: "AIzaSyD0Vorv3SFatQuC7OCYHPA-Nok4DlqonrI", // 기존에 작동하던 공개 키
  authDomain: "family-resolution.firebaseapp.com",
  projectId: "family-resolution", // 방금 확인한 프로젝트 ID
  storageBucket: "family-resolution.firebasestorage.app",
  messagingSenderId: "711396068080",
  appId: "1:711396068080:web:861c41a8259f0b6dca9035",
  measurementId: "G-RH6E87B4H0"
};

/* =================================================================
   [2] 데이터 & 전역 변수
   ================================================================= */
const BIBLE_DATA = {
    "books": [
        { "name": "창세기", "chapters": 50, "testament": "old" }, { "name": "출애굽기", "chapters": 40, "testament": "old" },
        { "name": "레위기", "chapters": 27, "testament": "old" }, { "name": "민수기", "chapters": 36, "testament": "old" },
        { "name": "신명기", "chapters": 34, "testament": "old" }, { "name": "여호수아", "chapters": 24, "testament": "old" },
        { "name": "사사기", "chapters": 21, "testament": "old" }, { "name": "룻기", "chapters": 4, "testament": "old" },
        { "name": "사무엘상", "chapters": 31, "testament": "old" }, { "name": "사무엘하", "chapters": 24, "testament": "old" },
        { "name": "열왕기상", "chapters": 22, "testament": "old" }, { "name": "열왕기하", "chapters": 25, "testament": "old" },
        { "name": "역대상", "chapters": 29, "testament": "old" }, { "name": "역대하", "chapters": 36, "testament": "old" },
        { "name": "에스라", "chapters": 10, "testament": "old" }, { "name": "느헤미야", "chapters": 13, "testament": "old" },
        { "name": "에스더", "chapters": 10, "testament": "old" }, { "name": "욥기", "chapters": 42, "testament": "old" },
        { "name": "시편", "chapters": 150, "testament": "old" }, { "name": "잠언", "chapters": 31, "testament": "old" },
        { "name": "전도서", "chapters": 12, "testament": "old" }, { "name": "아가", "chapters": 8, "testament": "old" },
        { "name": "이사야", "chapters": 66, "testament": "old" }, { "name": "예레미야", "chapters": 52, "testament": "old" },
        { "name": "예레미야애가", "chapters": 5, "testament": "old" }, { "name": "에스겔", "chapters": 48, "testament": "old" },
        { "name": "다니엘", "chapters": 12, "testament": "old" }, { "name": "호세아", "chapters": 14, "testament": "old" },
        { "name": "요엘", "chapters": 3, "testament": "old" }, { "name": "아모스", "chapters": 9, "testament": "old" },
        { "name": "오바댜", "chapters": 1, "testament": "old" }, { "name": "요나", "chapters": 4, "testament": "old" },
        { "name": "미가", "chapters": 7, "testament": "old" }, { "name": "나훔", "chapters": 3, "testament": "old" },
        { "name": "하박국", "chapters": 3, "testament": "old" }, { "name": "스바냐", "chapters": 3, "testament": "old" },
        { "name": "학개", "chapters": 2, "testament": "old" }, { "name": "스가랴", "chapters": 14, "testament": "old" },
        { "name": "말라기", "chapters": 4, "testament": "old" }, { "name": "마태복음", "chapters": 28, "testament": "new" },
        { "name": "마가복음", "chapters": 16, "testament": "new" }, { "name": "누가복음", "chapters": 24, "testament": "new" },
        { "name": "요한복음", "chapters": 21, "testament": "new" }, { "name": "사도행전", "chapters": 28, "testament": "new" },
        { "name": "로마서", "chapters": 16, "testament": "new" }, { "name": "고린도전서", "chapters": 16, "testament": "new" },
        { "name": "고린도후서", "chapters": 13, "testament": "new" }, { "name": "갈라디아서", "chapters": 6, "testament": "new" },
        { "name": "에베소서", "chapters": 6, "testament": "new" }, { "name": "빌립보서", "chapters": 4, "testament": "new" },
        { "name": "골로새서", "chapters": 4, "testament": "new" }, { "name": "데살로니가전서", "chapters": 5, "testament": "new" },
        { "name": "데살로니가후서", "chapters": 3, "testament": "new" }, { "name": "디모데전서", "chapters": 6, "testament": "new" },
        { "name": "디모데후서", "chapters": 4, "testament": "new" }, { "name": "디도서", "chapters": 3, "testament": "new" },
        { "name": "빌레몬서", "chapters": 1, "testament": "new" }, { "name": "히브리서", "chapters": 13, "testament": "new" },
        { "name": "야고보서", "chapters": 5, "testament": "new" }, { "name": "베드로전서", "chapters": 5, "testament": "new" },
        { "name": "베드로후서", "chapters": 3, "testament": "new" }, { "name": "요한1서", "chapters": 5, "testament": "new" },
        { "name": "요한2서", "chapters": 1, "testament": "new" }, { "name": "요한3서", "chapters": 1, "testament": "new" },
        { "name": "유다서", "chapters": 1, "testament": "new" }, { "name": "요한계시록", "chapters": 22, "testament": "new" }
    ]
};

const DAILY_VERSES = [
    { t: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", r: "빌립보서 4:13" },
    { t: "여호와는 나의 목자시니 내게 부족함이 없으리로다", r: "시편 23:1" },
    { t: "두려워하지 말라 내가 너와 함께 함이라", r: "이사야 41:10" },
    { t: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라", r: "살전 5:16-18" },
    { t: "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라", r: "잠언 16:3" }
];

const USER_SLOTS = ["user_1", "user_2", "user_3", "user_4", "user_5", "user_6"];

let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let currentViewYear = new Date().getFullYear();
let myName = localStorage.getItem('myId');
let lastAlarmMinute = "";
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

/* =================================================================
   [3] 기능 함수들 (로직)
   ================================================================= */
window.tryLogin = function(slotId) {
    const authData = (appData.auth && appData.auth[slotId]) ? appData.auth[slotId] : null;
    if (!authData) {
        const newName = prompt("사용할 닉네임을 입력하세요:");
        if(!newName) return;
        const newPin = prompt("비밀번호(PIN) 4자리를 설정하세요:");
        if(!newPin || newPin.length < 1) return;
        if(!appData.auth) appData.auth = {};
        appData.auth[slotId] = { name: newName, pin: newPin };
        appData[slotId] = { resolution: [], bible: {}, history: {}, bibleRounds: {} }; 
        saveToServer().then(() => loginSuccess(slotId));
    } else {
        const inputPin = prompt(`'${authData.name}'님의 비밀번호를 입력하세요:`);
        if(inputPin === authData.pin) loginSuccess(slotId);
        else alert("비밀번호가 틀렸습니다!");
    }
};

function loginSuccess(slotId) {
    myName = slotId;
    localStorage.setItem('myId', slotId);
    const loginModal = document.getElementById('login-modal');
    const appContainer = document.getElementById('app-container');
    if(loginModal) loginModal.classList.add('hidden');
    if(appContainer) appContainer.classList.remove('hidden');
    updateUI();
}

window.logoutAction = function() {
    if(confirm("로그아웃 하시겠습니까?")) {
        localStorage.removeItem('myId');
        myName = null;
        const loginModal = document.getElementById('login-modal');
        const appContainer = document.getElementById('app-container');
        if(appContainer) appContainer.classList.add('hidden');
        if(loginModal) loginModal.classList.remove('hidden');
        renderLoginScreen();
    }
};

window.goTab = function(tabName, element) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    if(element) element.classList.add('active');
    
    // 강제 숨김 처리
    const pages = ['resolution', 'bible', 'stats'];
    pages.forEach(page => {
        const el = document.getElementById('page-' + page);
        if(el) { el.classList.add('hidden'); el.style.display = 'none'; }
    });

    // 강제 보임 처리
    const target = document.getElementById('page-' + tabName);
    if(target) { target.classList.remove('hidden'); target.style.display = 'block'; }
    
    if(tabName === 'stats') renderStatsPage();
    if(tabName === 'bible') updateUI();
};

window.saveAlarmTime = function() {
    const timeInput = document.getElementById('alarm-time-input').value;
    if(!timeInput) return alert("시간을 선택해주세요.");
    appData.alarmTime = timeInput;
    saveToServer().then(() => alert(`⏰ 가족 약속 시간이 [${timeInput}]로 설정되었습니다.`));
};

window.addItem = function() {
    if(!myName) return;
    const input = document.getElementById(`input-resolution`);
    const v = input.value.trim();
    if (!v) return;
    const p = v.split('/');
    if(!appData[myName].resolution) appData[myName].resolution = [];
    const steps = p[1]?p.slice(1).map(s=>s.trim()):["완료"];
    appData[myName].resolution.push({ 
        text: p[0].trim(), steps: steps, done: Array(steps.length).fill(false), counts: Array(steps.length).fill(0) 
    });
    input.value = "";
    renderMyList(); saveToServer();
};

window.deleteResolution = function(i) {
    if(confirm("삭제하시겠습니까?")) {
        appData[myName].resolution.splice(i, 1);
        updateDailyHistory(myName);
        renderMyList(); saveToServer();
    }
};

window.editResolution = function(i) {
    const item = appData[myName].resolution[i];
    let currentText = item.text;
    if(item.steps.length > 1 || item.steps[0] !== "완료") currentText += " / " + item.steps.join(" / ");
    const newText = prompt("내용 수정:", currentText);
    if(newText && newText.trim()) {
        const p = newText.split('/');
        const newSteps = p.length > 1 ? p.slice(1).map(s=>s.trim()) : ["완료"];
        item.text = p[0].trim();
        if(item.steps.length !== newSteps.length) {
            item.steps = newSteps;
            item.done = Array(newSteps.length).fill(false);
            item.counts = Array(newSteps.length).fill(0); 
        } else { item.steps = newSteps; }
        renderMyList(); saveToServer();
    }
};

window.toggleResolution = function(i, si) {
    const item = appData[myName].resolution[i];
    const isNowDone = !item.done[si];
    item.done[si] = isNowDone;
    if(!item.counts) item.counts = new Array(item.steps.length).fill(0);
    if(isNowDone) item.counts[si]++; else item.counts[si] = Math.max(0, item.counts[si] - 1);
    
    if(item.done.every(Boolean) && isNowDone && window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    
    updateDailyHistory(myName);
    renderMyList(); saveToServer();
};

window.showBibleBooks = function(testament) {
    bibleState.currentTestament = testament;
    renderBibleUI();
};
window.showBibleMain = function() {
    bibleState.currentTestament = null;
    bibleState.currentBook = null;
    renderBibleUI();
};
window.showChapters = function(bookName) {
    bibleState.currentBook = bookName;
    renderBibleUI();
};
window.backToBooks = function() {
    bibleState.currentBook = null;
    renderBibleUI();
};
window.toggleChapter = function(key, isChecked) {
    if(!appData[myName].bible) appData[myName].bible = {};
    if(isChecked) appData[myName].bible[key] = getTodayStr();
    else delete appData[myName].bible[key];
    updateMyStats(); saveToServer();
};
window.finishBookAndReset = function() {
    const bookName = bibleState.currentBook;
    const book = BIBLE_DATA.books.find(b => b.name === bookName);
    if(!book) return;
    if(confirm(`🎉 축하합니다!\n'${bookName}'을(를) 정말 완독 처리하시겠습니까?\n\n- 체크박스가 모두 초기화됩니다.\n- 완독 횟수(배지)가 1 증가합니다.`)) {
        if(!appData[myName].bibleRounds) appData[myName].bibleRounds = {};
        const currentRound = appData[myName].bibleRounds[bookName] || 0;
        appData[myName].bibleRounds[bookName] = currentRound + 1;
        for(let i=1; i<=book.chapters; i++) {
            const key = `${bookName}-${i}`;
            delete appData[myName].bible[key];
        }
        if(window.confetti) confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        saveToServer(); renderBibleChapters(); updateMyStats();
    }
};

window.sendMsg = function() {
    const input = document.getElementById('input-msg');
    const text = input.value.trim();
    if(!text) return;
    if(!appData.messages) appData.messages = [];
    const senderName = appData.auth[myName].name;
    appData.messages.push({ sender: senderName, id: myName, text: text, ts: new Date().toISOString() });
    if(appData.messages.length > 50) appData.messages.shift();
    input.value = "";
    renderMessages(); saveToServer();
};
window.deleteMsg = function(idx) {
    if(confirm("메시지 삭제?")) {
        appData.messages.splice(idx, 1);
        renderMessages(); saveToServer();
    }
};

window.changeCalMonth = function(delta) {
    calMonth += delta;
    if(calMonth > 11) { calMonth = 0; calYear++; }
    else if(calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
};

window.showDateDetail = function(dateStr) {
    const historyVal = (appData[myName].history && appData[myName].history[dateStr]) || 0;
    let totalItems = 0;
    (appData[myName].resolution || []).forEach(item => totalItems += item.steps.length);
    if(totalItems === 0) totalItems = 1;
    const percent = Math.round((historyVal / totalItems) * 100);
    alert(`${dateStr} 기록\n\n${totalItems}개 중 ${historyVal}개 성공 (${percent}%)`);
};

/* =================================================================
   [4] 렌더링 함수들
   ================================================================= */
function updateUI() {
    if (myName && appData[myName]) {
        const myInfo = appData.auth[myName];
        const nameDisplay = document.getElementById('user-name'); 
        if(nameDisplay) nameDisplay.textContent = myInfo ? myInfo.name : "사용자";
        renderMyList();
        renderMessages();
        renderBibleUI();
        updateMyStats(); 
        if(appData.alarmTime) {
            const alarmInput = document.getElementById('alarm-time-input');
            if(alarmInput) alarmInput.value = appData.alarmTime;
        }
    }
}

function renderMyList() {
    const list = document.getElementById('list-resolution');
    if(!list) return;
    list.innerHTML = "";
    if(!appData[myName].resolution) appData[myName].resolution = [];
    appData[myName].resolution.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = "resolution-item"; 
        let stepsHtml = '';
        item.steps.forEach((step, si) => {
            const isDone = item.done[si] ? 'done' : '';
            stepsHtml += `<div class="step-item ${isDone}" onclick="window.toggleResolution(${i}, ${si})"><span class="step-label">${step}</span></div>`;
        });
        li.innerHTML = `
            <div class="res-content">
                <div class="res-text" onclick="window.editResolution(${i})">${item.text}</div>
                <div class="steps">${stepsHtml}</div>
            </div>
            <button class="del-btn" onclick="window.deleteResolution(${i})">🗑</button>
        `;
        list.appendChild(li);
    });
}

function renderMessages() {
    const msgList = document.getElementById('msg-list');
    if(!msgList) return;
    msgList.innerHTML = "";
    if(!appData.messages) appData.messages = [];
    const reversed = [...appData.messages].reverse(); 
    reversed.forEach((msg, idx) => {
        const originalIdx = appData.messages.length - 1 - idx;
        const li = document.createElement('li');
        const isMe = msg.id === myName;
        li.className = isMe ? "my-msg" : "other-msg";
        const dateStr = msg.ts ? new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
        li.innerHTML = `
            <div class="msg-bubble">
                <div class="msg-sender">${msg.sender}</div>
                <div class="msg-text">${msg.text}</div>
                <div class="msg-info">${dateStr} ${isMe ? `<span class="msg-del" onclick="window.deleteMsg(${originalIdx})">x</span>` : ""}</div>
            </div>`;
        msgList.appendChild(li);
    });
}

function renderBibleUI() {
    const mainView = document.getElementById('bible-main-view');
    const booksView = document.getElementById('bible-books-view');
    const chaptersView = document.getElementById('bible-chapters-view');
    if(!mainView) return; 

    if(bibleState.currentBook) {
        mainView.classList.add('hidden-view');
        booksView.classList.add('hidden-view');
        chaptersView.classList.remove('hidden-view');
        renderBibleChapters();
    } else if(bibleState.currentTestament) {
        mainView.classList.add('hidden-view');
        booksView.classList.remove('hidden-view');
        chaptersView.classList.add('hidden-view');
        renderBibleBooks();
    } else {
        mainView.classList.remove('hidden-view');
        booksView.classList.add('hidden-view');
        chaptersView.classList.add('hidden-view');
    }
}

function renderBibleBooks() {
    const container = document.getElementById('bible-books-grid');
    if(!container) return;
    container.innerHTML = "";
    document.getElementById('bible-testament-title').textContent = bibleState.currentTestament === 'old' ? '📜 구약 성경' : '✝️ 신약 성경';
    const targetBooks = BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament);
    targetBooks.forEach(book => {
        const btn = document.createElement('div');
        btn.className = 'bible-btn';
        const rounds = (appData[myName].bibleRounds && appData[myName].bibleRounds[book.name]) || 0;
        const badge = rounds > 0 ? `<span class="round-badge">+${rounds}</span>` : "";
        let readCount = 0;
        for(let i=1; i<=book.chapters; i++) {
            if(appData[myName].bible && appData[myName].bible[`${book.name}-${i}`]) readCount++;
        }
        if(readCount >= book.chapters) btn.classList.add('completed-book'); 
        btn.innerHTML = `${book.name} ${badge}`;
        btn.onclick = () => window.showChapters(book.name);
        container.appendChild(btn);
    });
}

function renderBibleChapters() {
    const container = document.getElementById('bible-chapters-grid');
    if(!container) return;
    container.innerHTML = "";
    const book = BIBLE_DATA.books.find(b => b.name === bibleState.currentBook);
    if(!book) return;
    document.getElementById('bible-book-title').textContent = book.name;
    for(let i=1; i<=book.chapters; i++) {
        const key = `${book.name}-${i}`;
        const isRead = (appData[myName].bible && appData[myName].bible[key]);
        const isThisYear = isInViewYear(isRead);
        const label = document.createElement('label');
        label.className = 'chapter-item';
        const chk = document.createElement('input');
        chk.type = "checkbox"; chk.checked = isThisYear;
        chk.onchange = (e) => window.toggleChapter(key, e.target.checked);
        const span = document.createElement('span');
        span.textContent = `${i}장`;
        label.appendChild(chk); label.appendChild(span);
        container.appendChild(label);
    }
}

function renderStatsPage() {
    const statsDiv = document.getElementById('page-stats'); 
    if (!statsDiv) return;
    
    // 내용 무조건 갱신
    statsDiv.innerHTML = `
        <div class="card" style="margin-bottom:20px;">
            <h3>📅 월간 히트맵</h3>
            <div id="calendar-container"></div>
        </div>
        <div class="card" style="margin-bottom:20px;">
            <h3>🔥 결단서 랭킹</h3>
            <div id="resolutionRankList"></div>
        </div>
        <div class="card">
            <h3>📖 성경 다독왕</h3>
            <div id="bibleRankList"></div>
        </div>
    `;
    renderCalendar();
    renderAllRankings();
}

function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if(!container) return;
    container.innerHTML = `
        <div class="cal-header">
            <button onclick="window.changeCalMonth(-1)">◀</button>
            <span>${calYear}년 ${calMonth + 1}월</span>
            <button onclick="window.changeCalMonth(1)">▶</button>
        </div>
        <div class="cal-grid" id="calGrid"></div>
    `;
    const calGrid = document.getElementById('calGrid');
    const days = ['일','월','화','수','목','금','토'];
    days.forEach(d => {
        const div = document.createElement('div');
        div.className = 'cal-day-label'; div.textContent = d;
        calGrid.appendChild(div);
    });
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const lastDate = new Date(calYear, calMonth + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) calGrid.appendChild(document.createElement('div'));
    
    const myHistory = (appData[myName] && appData[myName].history) ? appData[myName].history : {};
    const myBible = (appData[myName] && appData[myName].bible) ? appData[myName].bible : {};
    const todayStr = getTodayStr();
    let totalItems = 0;
    (appData[myName].resolution || []).forEach(item => totalItems += item.steps.length);
    if(totalItems === 0) totalItems = 1;
    
    for(let d=1; d<=lastDate; d++) {
        const dateObj = new Date(calYear, calMonth, d);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth()+1).padStart(2,'0');
        const da = String(dateObj.getDate()).padStart(2,'0');
        const dateStr = `${y}-${m}-${da}`;
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if(dateStr === todayStr) cell.classList.add('today');
        cell.onclick = () => window.showDateDetail(dateStr);
        cell.innerHTML = `<span>${d}</span>`;
        const doneCount = myHistory[dateStr] || 0;
        if(doneCount > 0) {
            const alpha = Math.min(1.0, Math.max(0.2, doneCount / totalItems));
            cell.style.backgroundColor = `rgba(76, 175, 80, ${alpha})`;
            cell.style.color = alpha > 0.6 ? 'white' : 'inherit';
        }
        let readBible = false;
        for(const val of Object.values(myBible)) { if(val === dateStr) { readBible = true; break; } }
        if(readBible) {
            const dot = document.createElement('div');
            dot.className = 'dot-bible';
            cell.appendChild(dot);
        }
        calGrid.appendChild(cell);
    }
}

function renderAllRankings() {
    const resList = document.getElementById('resolutionRankList');
    const bibleList = document.getElementById('bibleRankList');
    if(!resList || !bibleList) return;
    
    const activeUsers = USER_SLOTS.filter(sid => appData.auth && appData.auth[sid]);
    
    const resRank = activeUsers.map(sid => {
        const memberData = appData[sid] || {};
        const history = memberData.history || {};
        const streak = calculateStreak(history);
        let score = 0;
        Object.values(history).forEach(v => score += v);
        return { name: appData.auth[sid].name, val: score, streak: streak };
    }).sort((a,b) => b.val - a.val);
    
    resList.innerHTML = "";
    resRank.forEach((d, i) => {
        const streakHtml = d.streak > 1 ? `<span style="font-size:0.8rem; color:red;">🔥${d.streak}일</span>` : "";
        resList.innerHTML += `<div class="rank-card"><div class="rank-num">${i+1}</div><div class="rank-name">${d.name} ${streakHtml}</div><div class="rank-score">${d.val}</div></div>`;
    });

    const bibleRank = activeUsers.map(sid => {
        return { name: appData.auth[sid].name, val: calculateTotalBibleRead(sid) };
    }).sort((a,b) => b.val - a.val);
    
    bibleList.innerHTML = "";
    bibleRank.forEach((d, i) => {
        bibleList.innerHTML += `<div class="rank-card"><div class="rank-num">${i+1}</div><div class="rank-name">${d.name}</div><div class="rank-score">${d.val}장</div></div>`;
    });
}

function updateMyStats() {
    let bibleCount = 0;
    if(appData[myName].bible) {
        Object.values(appData[myName].bible).forEach(dateStr => { if(isInViewYear(dateStr)) bibleCount++; });
    }
    let booksDone = 0;
    if(appData[myName].bibleRounds) { Object.values(appData[myName].bibleRounds).forEach(r => booksDone += r); }
    const statElem = document.getElementById('myBibleStat'); 
    if(statElem) statElem.textContent = `올해 ${bibleCount}장 읽음 (완독 ${booksDone}권)`;
}

/* =================================================================
   [5] 보조 함수들
   ================================================================= */
function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function isInViewYear(dateStr) {
    if(!dateStr) return false;
    return parseInt(dateStr.split('-')[0]) === currentViewYear;
}
function calculateStreak(history) {
    if(!history) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if(i === 0) { if(history[dateStr] > 0) streak++; continue; }
        if(history[dateStr] > 0) streak++; else break;
    }
    return streak;
}
function calculateTotalBibleRead(slotId) {
    const memberData = appData[slotId] || {};
    const bible = memberData.bible || {};
    const bibleRounds = memberData.bibleRounds || {};
    let total = 0;
    for(const [key, dateStr] of Object.entries(bible)) { if(isInViewYear(dateStr)) total++; }
    BIBLE_DATA.books.forEach(book => { total += ((bibleRounds[book.name] || 0) * book.chapters); });
    return total;
}
function updateDailyHistory(slotId) {
    const today = getTodayStr();
    if(!appData[slotId].history) appData[slotId].history = {};
    let totalDone = 0;
    (appData[slotId].resolution || []).forEach(item => { item.done.forEach(d => { if(d) totalDone++; }); });
    appData[slotId].history[today] = totalDone;
}

function renderLoginScreen() {
    const loginGrid = document.getElementById('login-grid'); 
    if(!loginGrid) return;
    loginGrid.innerHTML = "";
    USER_SLOTS.forEach((slotId, idx) => {
        const btn = document.createElement('div');
        const authData = (appData.auth && appData.auth[slotId]);
        if(authData) {
            btn.className = 'login-btn taken';
            btn.innerHTML = `<span style="font-size:20px;">🔒</span> <span>${authData.name}</span>`;
        } else {
            btn.className = 'login-btn';
            btn.innerHTML = `<span style="opacity:0.5;">+</span> <span class="sub-label">빈 자리<br>${idx+1}</span>`;
        }
        btn.onclick = () => window.tryLogin(slotId);
        loginGrid.appendChild(btn);
    });
}
async function initData() {
    appData = { period: {start:"", end:""}, messages: [], auth: {} };
    USER_SLOTS.forEach(sid => appData[sid] = { resolution: [], bible: {}, history: {}, bibleRounds: {} });
    await saveToServer();
    renderLoginScreen();
}
async function saveToServer() {
    const statusDiv = document.getElementById('serverStatus');
    if(statusDiv) statusDiv.textContent = "🟡 저장 중...";
    try {
        await setDoc(docRef, { appData: appData, lastDate: new Date().toDateString() });
        if(statusDiv) statusDiv.textContent = "🟢 저장 완료";
    } catch(e) {
        console.error(e);
        if(statusDiv) statusDiv.textContent = "🔴 저장 실패 (네트워크 확인)";
    }
}
async function resetDailyCheckboxes() {
    for (let m in appData) {
        if(appData[m] && appData[m].resolution) { appData[m].resolution.forEach(item => item.done.fill(false)); }
    }
    await saveToServer();
    if(myName) updateUI();
}

/* =================================================================
   [6] 실행 및 초기화 (메인)
   ================================================================= */
try {
    // 1. 말씀 표시 (가능한 모든 ID 체크)
    const verse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
    ['verse-text', 'verseText', 'daily-verse'].forEach(id => {
        const el = document.getElementById(id); if(el) el.textContent = verse.t;
    });
    ['verse-ref', 'verseRef', 'daily-ref'].forEach(id => {
        const el = document.getElementById(id); if(el) el.textContent = verse.r;
    });

    // 2. Firebase 초기화 및 연결
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // ★★★ 가장 중요한 부분: 사물함 이름(ID) 복구 ★★★
    // 원래 데이터가 들어있는 가장 기본적인 이름 'familyData'로 변경했습니다.
    docRef = doc(db, "appData", "familyData");

    const statusDiv = document.getElementById('serverStatus');
    onSnapshot(docRef, (docSnap) => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
             splash.style.opacity = '0';
             setTimeout(() => splash.style.display = 'none', 500);
        }

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.appData) appData = data.appData; else appData = data;

            let needSave = false;
            if(!appData.messages) { appData.messages = []; needSave = true; }
            if(!appData.auth) { appData.auth = {}; needSave = true; }
            USER_SLOTS.forEach(sid => {
                if(!appData[sid]) { appData[sid] = { resolution: [], bible: {}, history: {}, bibleRounds: {} }; needSave = true; }
            });

            if (data.lastDate !== new Date().toDateString()) { resetDailyCheckboxes(); }
            else { if(needSave) saveToServer(); renderLoginScreen(); if(myName) updateUI(); }
            
            if(statusDiv) statusDiv.textContent = "🟢 실시간 연동됨";
            
            const loginModal = document.getElementById('login-modal');
            const appContainer = document.getElementById('app-container');

            if(myName) {
                if(loginModal) loginModal.classList.add('hidden');
                if(appContainer) appContainer.classList.remove('hidden');
                updateUI();
            } else {
                if(appContainer) appContainer.classList.add('hidden');
                if(loginModal) loginModal.classList.remove('hidden');
                renderLoginScreen();
            }
        } else { 
            // 데이터가 없으면 초기화 (만약 이것도 뜨면 이름이 familyData가 아님)
            initData(); 
        }
    }, (error) => { alert("서버 연결 오류:\n" + error.message); if(statusDiv) statusDiv.textContent = "🔴 연결 실패"; });
    
    setInterval(() => {
        if(!appData.alarmTime) return;
        const now = new Date();
        const currentHM = now.toTimeString().slice(0, 5);
        if(currentHM === appData.alarmTime && lastAlarmMinute !== currentHM) {
            lastAlarmMinute = currentHM;
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
            audio.play().catch(e => console.log("자동 재생 정책으로 소리 차단됨"));
            alert(`🔔 딩동댕! [${appData.alarmTime}] 입니다.\n우리 가족 약속 시간이에요! ❤️`);
        }
    }, 1000);

} catch (e) { 
    alert("코드 실행 오류:\n" + e.message); 
    console.error(e);
}
