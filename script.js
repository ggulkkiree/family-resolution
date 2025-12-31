/* =================================================================
   [1] 중요: 외부 기능 불러오기 (무조건 맨 위에 있어야 함)
   ================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =================================================================
   [2] 데이터 및 설정
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

const firebaseConfig = {
  apiKey: "AIzaSyD0Vorv3SFatQuC7OCYHPA-Nok4DlqonrI",
  authDomain: "family-resolution.firebaseapp.com",
  projectId: "family-resolution",
  storageBucket: "family-resolution.firebasestorage.app",
  messagingSenderId: "711396068080",
  appId: "1:711396068080:web:861c41a8259f0b6dca9035",
  measurementId: "G-RH6E87B4H0"
};

// 앱 초기화 및 변수 선언
let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let currentViewYear = new Date().getFullYear();
let myName = localStorage.getItem('myId'); 

/* =================================================================
   [3] 기능 함수들 (HTML에서 버튼 누를 때 실행되는 친구들)
   ================================================================= */
// 로그인
window.tryLogin = function(slotId) {
    const authData = (appData.auth && appData.auth[slotId]) ? appData.auth[slotId] : null;

    if (!authData) {
        // 신규 등록
        const newName = prompt("사용할 닉네임을 입력하세요:");
        if(!newName) return;
        const newPin = prompt("비밀번호(PIN) 4자리를 설정하세요:");
        if(!newPin || newPin.length < 1) return;
        
        if(!appData.auth) appData.auth = {};
        appData.auth[slotId] = { name: newName, pin: newPin };
        appData[slotId] = { resolution: [], bible: {}, history: {} }; // 데이터 초기화
        
        saveToServer().then(() => {
            loginSuccess(slotId);
        });
    } else {
        // 기존 로그인
        const inputPin = prompt(`'${authData.name}'님의 비밀번호를 입력하세요:`);
        if(inputPin === authData.pin) {
            loginSuccess(slotId);
        } else {
            alert("비밀번호가 틀렸습니다!");
        }
    }
}

function loginSuccess(slotId) {
    myName = slotId;
    localStorage.setItem('myId', slotId);
    document.getElementById('loginScreen').classList.add('hidden');
    updateUI();
}

// 로그아웃
window.logoutAction = function() {
    if(confirm("로그아웃 하시겠습니까?")) {
        localStorage.removeItem('myId');
        document.getElementById('loginScreen').classList.remove('hidden');
        myName = null;
        renderLoginScreen();
    }
}

// 설정 (닉네임, 비번 변경)
window.updateNickname = function() {
    const val = document.getElementById('edit-nickname').value;
    if(!val) return;
    if(confirm(`닉네임을 '${val}'(으)로 변경하시겠습니까?`)) {
        appData.auth[myName].name = val;
        saveToServer();
        alert("변경되었습니다.");
        updateUI();
    }
}
window.updatePin = function() {
    const val = document.getElementById('edit-pin').value;
    if(!val || val.length !== 4) return alert("4자리 숫자로 입력해주세요.");
    if(confirm("비밀번호를 변경하시겠습니까?")) {
        appData.auth[myName].pin = val;
        saveToServer();
        alert("변경되었습니다.");
    }
}

// 테마 변경
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// 연도 변경
window.changeYear = function(delta) {
    currentViewYear += delta;
    refreshYearDisplay();
    updateUI(); 
}

// 탭 이동
window.goTab = function(t, element) {
    document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(t).classList.add('active');
    if(t==='stats'||t==='bible') updateUI();
}

// 결단서 추가
window.addItem = function(cat) {
    if(!myName) return;
    const input = document.getElementById(`input-resolution`);
    const v = input.value.trim();
    if (!v) return;
    const p = v.split('/');
    if(!appData[myName].resolution) appData[myName].resolution = [];
    const steps = p[1]?p.slice(1).map(s=>s.trim()):["완료"];
    appData[myName].resolution.push({ 
        text: p[0].trim(), 
        steps: steps, 
        done: Array(steps.length).fill(false),
        counts: Array(steps.length).fill(0) 
    });
    input.value = "";
    renderMyList(); 
    saveToServer();
}
window.deleteResolution = function(i) {
    if(confirm("삭제하시겠습니까?")) {
        appData[myName].resolution.splice(i, 1);
        updateDailyHistory(myName);
        renderMyList(); 
        saveToServer();
    }
}
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
        } else {
            item.steps = newSteps;
        }
        renderMyList(); 
        saveToServer();
    }
}
window.toggleResolution = function(i, si) {
    const item = appData[myName].resolution[i];
    const isNowDone = !item.done[si];
    item.done[si] = isNowDone;
    
    if(!item.counts) item.counts = new Array(item.steps.length).fill(0);
    if(isNowDone) item.counts[si]++;
    else item.counts[si] = Math.max(0, item.counts[si] - 1);

    if(item.done.every(Boolean) && isNowDone) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    updateDailyHistory(myName);
    
    const stepsDiv = document.querySelectorAll('#list-resolution li')[i].querySelector('.steps');
    const stepDiv = stepsDiv.children[si];
    if(isNowDone) stepDiv.classList.add('done'); else stepDiv.classList.remove('done');
    
    saveToServer();
}

// 성경 기능
window.showBibleBooks = function(testament) {
    bibleState.currentTestament = testament;
    document.getElementById('bible-main-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    document.getElementById('bible-testament-title').textContent = testament === 'old' ? '구약 성경' : '신약 성경';
    renderBibleBooks();
}
window.showBibleMain = function() {
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-main-view').classList.remove('hidden-view');
}
window.showChapters = function(bookName) {
    bibleState.currentBook = bookName;
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-chapters-view').classList.remove('hidden-view');
    document.getElementById('bible-book-title').textContent = bookName;
    renderBibleChapters();
}
window.backToBooks = function() {
    document.getElementById('bible-chapters-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    renderBibleBooks(); 
}
window.controlAllChapters = function(selectAll) {
    const book = BIBLE_DATA.books.find(b => b.name === bibleState.currentBook);
    if(!book) return;
    if(!appData[myName].bible) appData[myName].bible = {};
    const today = getTodayStr();
    for(let i=1; i<=book.chapters; i++) {
        const key = `${book.name}-${i}`;
        if(selectAll) { if(!appData[myName].bible[key]) appData[myName].bible[key] = today; }
        else { if(isInViewYear(appData[myName].bible[key])) delete appData[myName].bible[key]; }
    }
    if(selectAll) confetti({ particleCount: 80, spread: 60, colors: ['#00796b', '#FFEB3B'] });
    renderBibleChapters(); 
    updateMyStats();
    saveToServer();
}
window.toggleChapter = function(key, isChecked) {
    if(!appData[myName].bible) appData[myName].bible = {};
    if(isChecked) appData[myName].bible[key] = getTodayStr();
    else delete appData[myName].bible[key];
    updateMyStats(); 
    saveToServer();
}

window.savePeriod = function() {
    const s = document.getElementById('startDateInput').value;
    const e = document.getElementById('endDateInput').value;
    if(!s || !e) return alert("시작일과 종료일을 모두 입력해주세요.");
    appData.period = { start: s, end: e };
    renderAllRankings();
    saveToServer().then(() => alert("📅 시즌 기간 설정 완료!"));
}

// 소통 기능
window.sendMsg = function() {
    const input = document.getElementById('input-msg');
    const text = input.value.trim();
    if(!text) return;
    if(!appData.messages) appData.messages = [];
    const senderName = appData.auth[myName].name;
    appData.messages.push({ sender: senderName, id: myName, text: text, ts: new Date().toISOString() });
    if(appData.messages.length > 50) appData.messages.shift();
    input.value = "";
    renderMessages(); 
    saveToServer();
}
window.deleteMsg = function(idx) {
    if(confirm("메시지 삭제?")) {
        appData.messages.splice(idx, 1);
        renderMessages();
        saveToServer();
    }
}

/* =================================================================
   [4] 내부 로직 및 렌더링 함수들
   ================================================================= */
function getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekRangeStrings() {
    const now = new Date();
    const day = now.getDay(); 
    const diffToSat = (day + 1) % 7; 
    const start = new Date(now);
    start.setDate(now.getDate() - diffToSat);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${da}`;
    };
    return { startStr: fmt(start), endStr: fmt(end) };
}

function refreshYearDisplay() {
    document.getElementById('displayYear').textContent = currentViewYear;
    document.getElementById('yearTotalLabel').textContent = `${currentViewYear}년 누적`;
}

function renderLoginScreen() {
    const loginGrid = document.getElementById('loginGrid');
    loginGrid.innerHTML = "";
    
    USER_SLOTS.forEach((slotId, idx) => {
        const btn = document.createElement('div');
        const authData = (appData.auth && appData.auth[slotId]);
        
        if(authData) {
            btn.className = 'login-btn taken';
            btn.innerHTML = `<span style="font-size:20px;">🔒</span> <span>${authData.name}</span>`;
        } else {
            btn.className = 'login-btn';
            btn.innerHTML = `<span style="opacity:0.5;">+</span> <span class="sub-label">빈 자리<br>(번호 ${idx+1})</span>`;
        }
        
        btn.onclick = () => window.tryLogin(slotId);
        loginGrid.appendChild(btn);
    });
}

async function initData() {
    appData = { period: {start:"", end:""}, messages: [], auth: {} };
    USER_SLOTS.forEach(sid => appData[sid] = { resolution: [], bible: {}, history: {} });
    await saveToServer();
    renderLoginScreen();
}

async function saveToServer() {
    const statusDiv = document.getElementById('serverStatus');
    statusDiv.textContent = "🟡 저장 중...";
    try {
        await setDoc(docRef, { appData: appData, lastDate: new Date().toDateString() });
        statusDiv.textContent = "🟢 저장 완료";
    } catch(e) {
        console.error(e);
        statusDiv.textContent = "🔴 저장 실패 (네트워크 확인)";
    }
}

async function resetDailyCheckboxes() {
    for (let m in appData) {
        if(appData[m] && appData[m].resolution) {
            appData[m].resolution.forEach(item => item.done.fill(false));
        }
    }
    await saveToServer();
    if(myName) updateUI();
}

function updateUI() {
    if (myName) {
        const myInfo = appData.auth[myName];
        document.getElementById('userNameDisplay').textContent = myInfo ? myInfo.name : "사용자";
        
        if(document.activeElement.tagName !== 'INPUT') {
                renderMyList();
                renderMessages();
        }
        renderBibleUI();
        updateMyStats(); 
    }
    renderAllRankings();
    renderHabitAnalysis();
    const p = appData.period || {};
    if(p.start && p.end) {
        document.getElementById('startDateInput').value = p.start;
        document.getElementById('endDateInput').value = p.end;
        document.getElementById('rankPeriodLabel').textContent = `(${p.start} ~ ${p.end})`;
    } else {
        document.getElementById('rankPeriodLabel').textContent = "(기간 미설정)";
    }
}

function isInViewYear(dateStr) {
    if(!dateStr) return false;
    const parts = dateStr.split('-');
    if(parts.length < 1) return false;
    return parseInt(parts[0]) === currentViewYear;
}

function calculateStreak(history) {
    if(!history) return 0;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if(i === 0) {
            if(history[dateStr] > 0) streak++;
            continue;
        }
        if(history[dateStr] > 0) streak++; else break;
    }
    return streak;
}

function renderAllRankings() {
    const resList = document.getElementById('resolutionRankList');
    resList.innerHTML = "";
    
    const p = appData.period || {};
    const hasPeriod = (p.start && p.end);
    
    const activeUsers = USER_SLOTS.filter(sid => appData.auth && appData.auth[sid]);
    
    const resRank = activeUsers.map(sid => {
        let score = 0;
        const memberData = appData[sid] || {};
        const history = memberData.history || {};
        const streak = calculateStreak(history);
        const name = appData.auth[sid].name;

        if (hasPeriod) {
            for(const [dateStr, val] of Object.entries(history)) {
                if (dateStr >= p.start && dateStr <= p.end) score += val;
            }
        }
        return { name: name, val: score, streak: streak };
    }).sort((a,b) => b.val - a.val);
    
    resRank.forEach((d, i) => {
        let streakHtml = "";
        if(d.streak > 1) streakHtml = `<div class="streak-badge">🔥 ${d.streak}일</div>`;
        const div = document.createElement('div');
        div.className = "rank-card";
        div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-name">${d.name} ${streakHtml}</div><div class="rank-score">${d.val} <span class="rank-unit">점</span></div>`;
        resList.appendChild(div);
    });

    const bibleList = document.getElementById('bibleRankList');
    bibleList.innerHTML = "";
    const { startStr, endStr } = getWeekRangeStrings();
    const partsS = startStr.split('-');
    const partsE = endStr.split('-');
    if(partsS.length === 3) {
        document.getElementById('bibleYearLabel').textContent = `이번 주 (${parseInt(partsS[1])}.${parseInt(partsS[2])}~${parseInt(partsE[1])}.${parseInt(partsE[2])})`;
    }
    const bibleRank = activeUsers.map(sid => {
        let count = 0;
        const memberData = appData[sid] || {};
        const bible = memberData.bible || {};
        const name = appData.auth[sid].name;
        for(const [key, dateStr] of Object.entries(bible)) {
            if(dateStr >= startStr && dateStr <= endStr) count++; 
        }
        return { name: name, val: count };
    }).sort((a,b) => b.val - a.val);
    bibleRank.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = "rank-card";
        div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-name">${d.name}</div><div class="rank-score">${d.val} <span class="rank-unit">장</span></div>`;
        bibleList.appendChild(div);
    });
}

function renderHabitAnalysis() {
    if(!myName || !appData[myName] || !appData[myName].resolution) return;
    const list = appData[myName].resolution;
    if(list.length === 0) return;
    const flatList = [];
    list.forEach(item => {
        item.steps.forEach((stepName, idx) => {
            const count = (item.counts && item.counts[idx]) ? item.counts[idx] : 0;
            let name = item.text;
            if(item.steps.length > 1) name += ` (${stepName})`;
            flatList.push({ name, count });
        });
    });
    flatList.sort((a,b) => b.count - a.count);
    const maxVal = flatList.length > 0 ? Math.max(flatList[0].count, 1) : 1;
    const container = document.getElementById('habitStatsList');
    container.innerHTML = "";
    flatList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'habit-bar-item';
        const percent = (item.count / maxVal) * 100;
        row.innerHTML = `<div class="habit-bar-name">${item.name}</div><div class="habit-bar-graph"><div class="habit-bar-fill" style="width:${percent}%"></div></div><div class="habit-bar-count">${item.count}</div>`;
        container.appendChild(row);
    });
}

function renderMyList() {
    const listEl = document.getElementById(`list-resolution`);
    listEl.innerHTML = "";
    if(!appData[myName] || !appData[myName].resolution) return;
    (appData[myName].resolution || []).forEach((item, idx) => {
        const li = document.createElement('li');
        const btnContainer = document.createElement('div');
        btnContainer.className = 'action-btns';
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn'; editBtn.textContent = '✎'; editBtn.onclick = () => window.editResolution(idx);
        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn'; delBtn.textContent = '×'; delBtn.onclick = () => window.deleteResolution(idx);
        btnContainer.appendChild(editBtn); btnContainer.appendChild(delBtn);
        const topDiv = document.createElement('div');
        topDiv.className = 'li-top';
        const span = document.createElement('span');
        span.className = 'li-text'; span.textContent = item.text;
        topDiv.appendChild(span); topDiv.appendChild(btnContainer);
        const stepsDiv = document.createElement('div');
        stepsDiv.className = 'steps';
        item.steps.forEach((s, si) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `step ${item.done[si] ? 'done' : ''}`;
            stepDiv.textContent = s;
            stepDiv.onclick = () => window.toggleResolution(idx, si);
            stepsDiv.appendChild(stepDiv);
        });
        li.appendChild(topDiv); li.appendChild(stepsDiv);
        listEl.appendChild(li);
    });
}
function updateDailyHistory(m) {
    const d = getTodayStr();
    if(!appData[m]) return;
    let s = (appData[m].resolution||[]).reduce((acc, cur) => acc + cur.done.filter(Boolean).length, 0);
    if (!appData[m].history) appData[m].history = {};
    appData[m].history[d] = s;
}

function renderBibleUI() {
    if(!document.getElementById('bible-books-view').classList.contains('hidden-view')) renderBibleBooks();
    if(!document.getElementById('bible-chapters-view').classList.contains('hidden-view')) renderBibleChapters();
}
function renderBibleBooks() {
    const container = document.getElementById('book-grid-container');
    container.innerHTML = '';
    const myBible = (appData[myName] && appData[myName].bible) ? appData[myName].bible : {};
    BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament).forEach(book => {
        const btn = document.createElement('div');
        btn.className = 'book-btn'; btn.textContent = book.name;
        let readCount = 0;
        for(let i=1; i<=book.chapters; i++) { if(isInViewYear(myBible[`${book.name}-${i}`])) readCount++; }
        if(readCount === book.chapters) { btn.classList.add('completed'); btn.textContent = `✔️ ${book.name}`; }
        else if (readCount > 0) { btn.classList.add('in-progress'); }
        btn.onclick = () => window.showChapters(book.name);
        container.appendChild(btn);
    });
}
function renderBibleChapters() {
    const container = document.getElementById('chapter-grid-container');
    container.innerHTML = '';
    const book = BIBLE_DATA.books.find(b => b.name === bibleState.currentBook);
    if(!book) return;
    const myBible = (appData[myName] && appData[myName].bible) ? appData[myName].bible : {};
    for(let i=1; i<=book.chapters; i++) {
        const chapterKey = `${book.name}-${i}`;
        const div = document.createElement('div'); div.className = 'chapter-item';
        const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `ch-${chapterKey}`;
        if(isInViewYear(myBible[chapterKey])) checkbox.checked = true;
        checkbox.onchange = (e) => window.toggleChapter(chapterKey, e.target.checked);
        const label = document.createElement('label'); label.htmlFor = `ch-${chapterKey}`; label.textContent = i;
        div.appendChild(checkbox); div.appendChild(label);
        container.appendChild(div);
    }
}
function updateMyStats() {
    if(!appData[myName]) return;
    const bible = appData[myName].bible || {};
    let weeklyCount = 0;
    let yearlyCount = 0;
    const { startStr, endStr } = getWeekRangeStrings();
    for (const [key, dateStr] of Object.entries(bible)) {
        if (isInViewYear(dateStr)) yearlyCount++;
        if (dateStr >= startStr && dateStr <= endStr) weeklyCount++;
    }
    document.getElementById('myWeeklyBible').textContent = weeklyCount;
    document.getElementById('myYearlyBible').textContent = yearlyCount;
}
function renderMessages() {
    const chatList = document.getElementById('chatList');
    if(!chatList) return; 
    const wasScrolledToBottom = chatList.scrollHeight - chatList.scrollTop <= chatList.clientHeight + 50;
    chatList.innerHTML = "";
    const msgs = appData.messages || [];
    msgs.forEach((msg, idx) => {
        const isMine = (msg.id === myName) || (msg.sender === appData.auth[myName].name);
        const div = document.createElement('div');
        div.className = `msg-card ${isMine ? 'mine' : ''}`;
        let dateStr = "";
        try { dateStr = new Date(msg.ts).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e) {}
        div.innerHTML = `<div class="msg-sender">${msg.sender}</div><div>${msg.text}</div><div class="msg-time">${dateStr}</div>`;
        if(isMine) {
            const delBtn = document.createElement('div');
            delBtn.className = 'msg-delete'; delBtn.textContent = '×';
            delBtn.onclick = () => window.deleteMsg(idx);
            div.appendChild(delBtn);
        }
        chatList.appendChild(div);
    });
    if (wasScrolledToBottom) chatList.scrollTop = chatList.scrollHeight;
}

/* =================================================================
   [5] 앱 실행 시작 (초기화)
   ================================================================= */
try {
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    
    const verse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
    if(document.getElementById('verseText')) {
        document.getElementById('verseText').textContent = verse.t;
        document.getElementById('verseRef').textContent = verse.r;
    }
    refreshYearDisplay();

    // Firebase 앱 시작
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    docRef = doc(db, "appData", "familyDataV28_Secure");
    
    // 데이터 실시간 수신 대기
    const statusDiv = document.getElementById('serverStatus');
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            appData = data.appData || {};
            let needSave = false;
            
            if(!appData.period) { appData.period = {start:"", end:""}; needSave = true; }
            if(!appData.messages) { appData.messages = []; needSave = true; }
            if(!appData.auth) { appData.auth = {}; needSave = true; }
            USER_SLOTS.forEach(sid => {
                if(!appData[sid]) { appData[sid] = { resolution: [], bible: {}, history: {} }; needSave = true; }
            });

            if (data.lastDate !== new Date().toDateString()) {
                resetDailyCheckboxes();
            } else {
                if(needSave) saveToServer();
                renderLoginScreen();
                if(myName) updateUI();
            }
            if(statusDiv) statusDiv.textContent = "🟢 실시간 연동됨";
        } else {
            initData();
        }
    }, (error) => {
        console.error("Firebase 접속 오류:", error);
        if(statusDiv) statusDiv.textContent = "🔴 연결 실패 (인터넷 확인)";
    });

} catch (e) {
    console.error("스크립트 실행 중 치명적 오류:", e);
    alert("앱 실행 중 오류가 발생했습니다. 새로고침 해주세요.");
}
