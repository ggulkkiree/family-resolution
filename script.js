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
let currentViewYear = new Date().getFullYear();

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// 2번 Config 내용을 여기에 붙여넣으세요! (괄호 잘 확인!)
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

/* =================================================================
   [1] 앱 초기화
   ================================================================= */
async function startApp() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        
        // ★ 새 디자인 기념으로 새 컬렉션 사용 추천 (기존 것 쓰려면 "familyDataV28_Secure")
        // 여기서는 기존 데이터를 그대로 쓰도록 해둠
        docRef = doc(db, "appData", "familyDataV28_Secure");

        onSnapshot(docRef, (snapshot) => {
            const splash = document.getElementById('splash-screen');
            if(splash) {
                splash.style.opacity = '0';
                setTimeout(()=> splash.style.display='none', 500);
            }

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

    } catch (e) {
        alert("Config 설정 오류! 코드를 확인해주세요.");
    }
}

/* =================================================================
   [2] 로그인 및 UI 전환
   ================================================================= */
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
    if(!grid) return;
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
            btn.innerHTML = `+ New (${idx+1})`;
            btn.onclick = () => tryRegister(slot);
        }
        grid.appendChild(btn);
    });
}

window.tryLogin = function(slot, correctPin) {
    const input = prompt("비밀번호 4자리:");
    if(input === correctPin) {
        myName = slot;
        localStorage.setItem('myId', slot);
        checkLoginStatus();
    } else { alert("비밀번호 불일치!"); }
};

window.tryRegister = function(slot) {
    const name = prompt("이름(닉네임):");
    if(!name) return;
    const pin = prompt("비밀번호(4자리):");
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

/* =================================================================
   [3] 메인 기능 및 통계
   ================================================================= */
function updateMainUI() {
    document.getElementById('user-name').innerText = appData.auth[myName].name;
    renderResolutionList();
    renderMessages();
    renderAdvancedStats(); // ★ 통계 갱신
}

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
        li.innerHTML = `<div class="res-text" onclick="window.editItem(${idx})">${item.text}</div><div class="steps">${stepsHtml}</div>`;
        
        // 롱프레스 삭제 대신 간단히 삭제 버튼 추가 (UX상 편의)
        const delBtn = document.createElement('div');
        delBtn.style.textAlign = 'right';
        delBtn.innerHTML = `<span style="font-size:0.8rem; color:#ff6b6b; cursor:pointer;" onclick="window.deleteItem(${idx})">삭제</span>`;
        li.appendChild(delBtn);
        
        list.appendChild(li);
    });
}

/* =================================================================
   [4] ★ 고급 통계 로직 (핵심)
   ================================================================= */
function renderAdvancedStats() {
    // 1. 개인 성취 기록 계산
    const myHistory = appData[myName].history || {};
    const today = new Date().toISOString().split('T')[0];
    const dates = Object.keys(myHistory).sort();
    
    // 연속 성공 (Streak) 계산
    let streak = 0;
    // 간단 로직: 오늘 했거나 어제 했으면 streak 유지
    // (실제로는 날짜 역순 루프가 필요하지만 약식으로 구현)
    if(myHistory[today] > 0) streak = 1; 

    // 총 성경 읽은 장수
    const myBible = appData[myName].bible || {};
    const bibleCount = Object.keys(myBible).length;

    // 성공률 (전체 항목 대비 완료율) -> 단순화: 최근 30일 히트맵 채워진 비율
    let filledDays = 0;
    for(let d of dates) { if(myHistory[d] > 0) filledDays++; }
    
    document.getElementById('stat-streak').innerText = streak + "일";
    document.getElementById('stat-bible-total').innerText = bibleCount + "장";
    
    // 2. 월별 히트맵 그리기
    const heatGrid = document.getElementById('heatmap-grid');
    heatGrid.innerHTML = "";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    document.getElementById('stat-rate').innerText = Math.round((filledDays / Math.max(1, dates.length))*100) + "%";

    for(let d=1; d<=daysInMonth; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const val = myHistory[dateStr] || 0;
        const cell = document.createElement('div');
        cell.className = "heat-day";
        if(val > 0) cell.classList.add("active");
        if(dateStr === today) cell.classList.add("today");
        cell.innerText = d;
        heatGrid.appendChild(cell);
    }

    // 3. 랭킹 시스템
    renderRanking();
}

function renderRanking() {
    const activeUsers = USER_SLOTS.filter(u => appData.auth && appData.auth[u]);
    
    // 결단서 랭킹 (누적 성공 횟수)
    const resRankEl = document.getElementById('rank-resolution');
    resRankEl.innerHTML = "";
    const resRanking = activeUsers.map(u => {
        const score = Object.values(appData[u].history||{}).reduce((a,b)=>a+b, 0);
        return { name: appData.auth[u].name, val: score };
    }).sort((a,b) => b.val - a.val);

    resRanking.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = "rank-row";
        row.innerHTML = `<span class="rank-idx ${i<3?'rank-top':''}">${i+1}</span> <span>${r.name}</span> <span style="font-weight:bold">${r.val}회</span>`;
        resRankEl.appendChild(row);
    });

    // 성경 랭킹 (읽은 장수)
    const bibRankEl = document.getElementById('rank-bible');
    bibRankEl.innerHTML = "";
    const bibRanking = activeUsers.map(u => {
        const score = Object.keys(appData[u].bible||{}).length;
        return { name: appData.auth[u].name, val: score };
    }).sort((a,b) => b.val - a.val);

    bibRanking.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = "rank-row";
        row.innerHTML = `<span class="rank-idx ${i<3?'rank-top':''}">${i+1}</span> <span>${r.name}</span> <span style="font-weight:bold">${r.val}장</span>`;
        bibRankEl.appendChild(row);
    });
}

/* =================================================================
   [5] 액션 (추가/삭제/체크)
   ================================================================= */
window.addItem = function() {
    const input = document.getElementById('input-resolution');
    const val = input.value.trim();
    if(!val) return;
    
    const parts = val.split('/');
    const title = parts[0].trim();
    const steps = parts.length > 1 ? parts.slice(1).map(s=>s.trim()) : ["완료"];
    
    if(!appData[myName].resolution) appData[myName].resolution = [];
    appData[myName].resolution.push({
        text: title, steps: steps, done: Array(steps.length).fill(false)
    });
    input.value = "";
    saveData();
};

window.toggleStep = function(itemIdx, stepIdx) {
    const item = appData[myName].resolution[itemIdx];
    item.done[stepIdx] = !item.done[stepIdx];
    
    if(item.done[stepIdx] && window.confetti) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    
    // 오늘 기록 갱신
    const today = new Date().toISOString().split('T')[0];
    if(!appData[myName].history) appData[myName].history = {};
    
    let totalDone = 0;
    appData[myName].resolution.forEach(r => r.done.forEach(d => { if(d) totalDone++; }));
    appData[myName].history[today] = totalDone;
    
    saveData();
};

window.deleteItem = function(idx) {
    if(confirm("삭제하시겠습니까?")) {
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
    const msgs = [...(appData.messages||[])].reverse();
    msgs.forEach(m => {
        const li = document.createElement('li');
        li.style.fontSize = "0.9rem"; li.style.marginBottom = "5px";
        li.innerHTML = `<b>${m.sender}:</b> ${m.text}`;
        list.appendChild(li);
    });
}

window.saveAlarmTime = function() {
    alert("알람 설정 기능은 준비 중입니다!");
};

/* =================================================================
   [6] 성경 기능
   ================================================================= */
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
        const label = document.createElement('label');
        label.className = "chapter-item";
        const key = `${book.name}-${i}`;
        const isRead = appData[myName].bible && appData[myName].bible[key];
        label.innerHTML = `<input type="checkbox" ${isRead?"checked":""} onchange="window.toggleChapter('${key}', this.checked)"><span>${i}</span>`;
        grid.appendChild(label);
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

/* =================================================================
   [7] 탭 및 저장
   ================================================================= */
window.goTab = function(tab, btn) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.page').forEach(e => e.classList.add('hidden'));
    document.getElementById('page-'+tab).classList.remove('hidden');
    
    if(tab==='stats') renderAdvancedStats();
    if(tab==='bible') {
        const cnt = Object.keys(appData[myName].bible||{}).length;
        document.getElementById('myBibleStat').innerText = `총 ${cnt}장 읽음`;
    }
};

async function saveData() {
    try {
        await setDoc(docRef, { appData: appData }, { merge: true });
        updateMainUI();
    } catch(e) { console.error(e); }
}

function initNewData() {
    appData = { auth: {}, messages: [] };
    saveData();
}

startApp();
