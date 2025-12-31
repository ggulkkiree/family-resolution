import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* === 데이터 상수 === */
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
const USER_SLOTS = ["user_1", "user_2", "user_3", "user_4", "user_5", "user_6"];

let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let myName = localStorage.getItem('myId');

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// 2번 Config 붙여넣기 필수!
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
const firebaseConfig = {
    apiKey: "AIzaSyD0Vorv3SFatQuC7OCYHPA-Nok4DlqonrI",
  authDomain: "family-resolution.firebaseapp.com",
  projectId: "family-resolution",
  storageBucket: "family-resolution.firebasestorage.app",
  messagingSenderId: "711396068080",
  appId: "1:711396068080:web:861c41a8259f0b6dca9035",
  measurementId: "G-RH6E87B4H0"
};

async function startApp() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        docRef = doc(db, "appData", "familyDataV28_Secure"); // 기존 데이터 유지

        onSnapshot(docRef, (snapshot) => {
            document.getElementById('splash-screen').style.opacity = '0';
            setTimeout(()=> document.getElementById('splash-screen').style.display='none', 500);

            if(snapshot.exists()) {
                const data = snapshot.data();
                appData = data.appData ? data.appData : data;
                if(!appData.auth) appData.auth = {};
                USER_SLOTS.forEach(slot => {
                    if(!appData[slot]) appData[slot] = { resolution: [], bible: {}, history: {} };
                });
                checkLoginStatus();
            } else {
                initNewData();
            }
        });

        // 오늘의 말씀
        const verses = [
            { t: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", r: "빌립보서 4:13" },
            { t: "여호와는 나의 목자시니 내게 부족함이 없으리로다", r: "시편 23:1" },
            { t: "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라", r: "잠언 16:3" }
        ];
        const v = verses[Math.floor(Math.random()*verses.length)];
        document.getElementById('verse-text').innerText = v.t;
        document.getElementById('verse-ref').innerText = v.r;
    } catch (e) { alert("Config 오류! 코드를 확인하세요."); }
}

function checkLoginStatus() {
    const modal = document.getElementById('login-modal');
    const container = document.getElementById('app-container');
    
    if(myName && appData.auth[myName]) {
        if(modal) modal.classList.add('hidden');
        if(container) container.classList.remove('hidden');
        updateMainUI();
    } else {
        if(container) container.classList.add('hidden');
        if(modal) modal.classList.remove('hidden');
        renderLoginButtons();
    }
}

function renderLoginButtons() {
    const grid = document.getElementById('login-grid');
    grid.innerHTML = "";
    USER_SLOTS.forEach((slot, idx) => {
        const btn = document.createElement('div');
        const user = appData.auth[slot];
        if(user) {
            btn.className = "login-btn taken";
            btn.innerHTML = `🔒 ${user.name}`;
            btn.onclick = () => tryLogin(slot, user.pin);
        } else {
            btn.className = "login-btn";
            btn.innerHTML = `+ New`;
            btn.onclick = () => tryRegister(slot);
        }
        grid.appendChild(btn);
    });
}

window.tryLogin = function(slot, correctPin) {
    const input = prompt("PIN 번호:");
    if(input === correctPin) {
        myName = slot;
        localStorage.setItem('myId', slot);
        checkLoginStatus();
    } else { alert("비밀번호 불일치"); }
};

window.tryRegister = function(slot) {
    const name = prompt("이름:");
    if(!name) return;
    const pin = prompt("비밀번호:");
    if(!pin) return;
    
    appData.auth[slot] = { name: name, pin: pin };
    if(!appData[slot]) appData[slot] = { resolution: [], bible: {}, history: {} };
    saveData().then(() => {
        myName = slot;
        localStorage.setItem('myId', slot);
        checkLoginStatus();
    });
};

window.logoutAction = function() {
    if(confirm("로그아웃 하시겠습니까?")) {
        localStorage.removeItem('myId');
        myName = null;
        checkLoginStatus();
    }
};

function updateMainUI() {
    document.getElementById('user-name').innerText = appData.auth[myName].name;
    renderResolutionList();
    renderMessages();
    renderAdvancedStats();
}

// [수정] 슬림 리스트 렌더링
function renderResolutionList() {
    const list = document.getElementById('list-resolution');
    list.innerHTML = "";
    const myItems = appData[myName].resolution || [];
    
    myItems.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = "resolution-item";
        
        let stepsHtml = "";
        item.steps.forEach((stepName, sIdx) => {
            const isDone = item.done[sIdx] ? "done" : "";
            stepsHtml += `<span class="step-item ${isDone}" onclick="window.toggleStep(${idx}, ${sIdx})">${stepName}</span>`;
        });

        // 텍스트, 스텝, 그리고 우측에 쓰레기통 아이콘
        li.innerHTML = `
            <div class="res-left">
                <div class="res-text" onclick="window.editItem(${idx})">${item.text}</div>
                <div class="steps">${stepsHtml}</div>
            </div>
            <button class="del-icon-btn" onclick="window.deleteItem(${idx})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        list.appendChild(li);
    });
}

function renderAdvancedStats() {
    const myHistory = appData[myName].history || {};
    const dates = Object.keys(myHistory);
    
    // Streak
    let streak = 0; // 간단 구현
    const today = new Date().toISOString().split('T')[0];
    if(myHistory[today]) streak = 1;

    // Stats
    const bibleCount = Object.keys(appData[myName].bible || {}).length;
    let successCount = 0;
    dates.forEach(d => { if(myHistory[d] > 0) successCount++; });
    const rate = Math.min(100, Math.round(successCount / Math.max(1, new Date().getDate()) * 100)); // 이번달 기준 대략 계산

    document.getElementById('stat-rate').innerText = rate + "%";
    document.getElementById('stat-streak').innerText = streak;
    document.getElementById('stat-bible-total').innerText = bibleCount;

    // Heatmap
    const heatGrid = document.getElementById('heatmap-grid');
    heatGrid.innerHTML = "";
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    for(let d=1; d<=daysInMonth; d++) {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const val = myHistory[dateStr] || 0;
        const cell = document.createElement('div');
        cell.className = "heat-day";
        if(val > 0) cell.classList.add("active");
        if(dateStr === today) cell.classList.add("today");
        cell.innerText = d;
        heatGrid.appendChild(cell);
    }

    // Ranking
    const activeUsers = USER_SLOTS.filter(u => appData.auth && appData.auth[u]);
    
    const resRankEl = document.getElementById('rank-resolution');
    resRankEl.innerHTML = "";
    activeUsers.map(u => ({ 
        name: appData.auth[u].name, 
        val: Object.values(appData[u].history||{}).reduce((a,b)=>a+b, 0) 
    })).sort((a,b)=>b.val-a.val).forEach((r,i) => {
        resRankEl.innerHTML += `<div class="rank-row"><span class="${i<3?'rank-top':''}">${i+1}. ${r.name}</span><span>${r.val}회</span></div>`;
    });

    const bibRankEl = document.getElementById('rank-bible');
    bibRankEl.innerHTML = "";
    activeUsers.map(u => ({
        name: appData.auth[u].name,
        val: Object.keys(appData[u].bible||{}).length
    })).sort((a,b)=>b.val-a.val).forEach((r,i) => {
        bibRankEl.innerHTML += `<div class="rank-row"><span class="${i<3?'rank-top':''}">${i+1}. ${r.name}</span><span>${r.val}장</span></div>`;
    });
}

window.addItem = function() {
    const input = document.getElementById('input-resolution');
    const val = input.value.trim();
    if(!val) return;
    const parts = val.split('/');
    const title = parts[0].trim();
    const steps = parts.length > 1 ? parts.slice(1).map(s=>s.trim()) : ["완료"];
    
    if(!appData[myName].resolution) appData[myName].resolution = [];
    appData[myName].resolution.push({ text: title, steps: steps, done: Array(steps.length).fill(false) });
    input.value = "";
    saveData();
};

window.toggleStep = function(itemIdx, stepIdx) {
    const item = appData[myName].resolution[itemIdx];
    item.done[stepIdx] = !item.done[stepIdx];
    if(item.done[stepIdx] && window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    
    const today = new Date().toISOString().split('T')[0];
    if(!appData[myName].history) appData[myName].history = {};
    let totalDone = 0;
    appData[myName].resolution.forEach(r => r.done.forEach(d => { if(d) totalDone++; }));
    appData[myName].history[today] = totalDone;
    
    saveData();
};

window.deleteItem = function(idx) {
    if(confirm("이 목표를 삭제할까요?")) {
        appData[myName].resolution.splice(idx, 1);
        saveData();
    }
};

window.editItem = function(idx) {
    const item = appData[myName].resolution[idx];
    const newText = prompt("목표 수정:", item.text);
    if(newText) { item.text = newText; saveData(); }
};

window.sendMsg = function() {
    const input = document.getElementById('input-msg');
    const txt = input.value.trim();
    if(!txt) return;
    if(!appData.messages) appData.messages = [];
    appData.messages.push({ sender: appData.auth[myName].name, text: txt });
    if(appData.messages.length > 50) appData.messages.shift();
    input.value = "";
    saveData();
};

function renderMessages() {
    const list = document.getElementById('msg-list');
    list.innerHTML = "";
    [...(appData.messages||[])].reverse().forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${m.sender}:</b> ${m.text}`;
        list.appendChild(li);
    });
}

window.showBibleBooks = function(type) {
    bibleState.currentTestament = type;
    document.getElementById('bible-main-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    
    const grid = document.getElementById('bible-books-grid');
    grid.innerHTML = "";
    document.getElementById('bible-testament-title').innerText = type==='old'?"구약":"신약";
    
    BIBLE_DATA.books.filter(b=>b.testament===type).forEach(book => {
        const div = document.createElement('div');
        div.className = "bible-btn";
        const readCount = Object.keys(appData[myName].bible||{}).filter(k=>k.startsWith(book.name+'-')).length;
        if(readCount >= book.chapters) div.classList.add('completed');
        div.innerText = book.name;
        div.onclick = () => showChapters(book);
        grid.appendChild(div);
    });
};

function showChapters(book) {
    bibleState.currentBook = book.name;
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-chapters-view').classList.remove('hidden-view');
    document.getElementById('bible-book-title').innerText = book.name;
    
    const grid = document.getElementById('bible-chapters-grid');
    grid.innerHTML = "";
    for(let i=1; i<=book.chapters; i++) {
        const div = document.createElement('div'); // label -> div 변경 (스타일링 용이)
        div.className = "chapter-item";
        const key = `${book.name}-${i}`;
        const isRead = appData[myName].bible && appData[myName].bible[key];
        if(isRead) div.classList.add('checked');
        
        div.innerText = i;
        div.onclick = () => {
            const newVal = !isRead;
            if(newVal) div.classList.add('checked'); else div.classList.remove('checked');
            window.toggleChapter(key, newVal);
        };
        grid.appendChild(div);
    }
}

window.toggleChapter = function(key, checked) {
    if(!appData[myName].bible) appData[myName].bible = {};
    if(checked) appData[myName].bible[key] = new Date().toISOString().split('T')[0];
    else delete appData[myName].bible[key];
    saveData();
};

window.showBibleMain = function() {
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-main-view').classList.remove('hidden-view');
};
window.backToBooks = function() {
    document.getElementById('bible-chapters-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
};

window.goTab = function(tab, btn) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.page').forEach(e => e.classList.add('hidden'));
    document.getElementById('page-'+tab).classList.remove('hidden');
    
    if(tab==='stats') renderAdvancedStats();
    if(tab==='bible') {
        const cnt = Object.keys(appData[myName].bible||{}).length;
        document.getElementById('myBibleStat').innerText = `Total: ${cnt}`;
    }
};

window.saveAlarmTime = function() { alert("알람 기능 준비중 🔔"); };

async function saveData() {
    try { await setDoc(docRef, { appData: appData }, { merge: true }); updateMainUI(); }
    catch(e) { console.error(e); }
}

function initNewData() { appData = { auth: {}, messages: [] }; saveData(); }

startApp();
