/* =================================================================
   [1] 모듈 불러오기
   ================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const USER_SLOTS = ["user_1", "user_2", "user_3", "user_4", "user_5", "user_6"];

let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let myName = localStorage.getItem('myId');
let currentViewYear = new Date().getFullYear();

// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// 2번 Config 내용을 아래 const firebaseConfig = { ... } 안에 덮어씌우세요!
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
   [3] 메인 실행 함수 (앱 시작)
   ================================================================= */
async function startApp() {
    try {
        // Firebase 시작
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        // ★★★ 1번: 고객님의 보물상자 이름 ★★★
        docRef = doc(db, "appData", "familyDataV28_Secure");

        // 데이터 실시간 감지
        onSnapshot(docRef, (snapshot) => {
            // 스플래시 화면 제거
            const splash = document.getElementById('splash-screen');
            if(splash) {
                splash.style.opacity = '0';
                setTimeout(()=> splash.style.display='none', 500);
            }

            if(snapshot.exists()) {
                const data = snapshot.data();
                // 데이터 구조 호환성 처리
                appData = data.appData ? data.appData : data;
                
                // 데이터가 비어있을 경우 초기화
                if(!appData.auth) appData.auth = {};
                USER_SLOTS.forEach(slot => {
                    if(!appData[slot]) appData[slot] = { resolution: [], bible: {}, history: {} };
                });

                // 화면 갱신
                checkLoginStatus();
            } else {
                // 데이터가 아예 없으면 초기화
                initNewData();
            }
        });

        // 오늘의 말씀 표시
        const verse = [
            { t: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", r: "빌4:13" },
            { t: "여호와는 나의 목자시니 내게 부족함이 없으리로다", r: "시23:1" },
            { t: "두려워하지 말라 내가 너와 함께 함이라", r: "사41:10" }
        ];
        const v = verse[Math.floor(Math.random()*verse.length)];
        document.getElementById('verse-text').innerText = v.t;
        document.getElementById('verse-ref').innerText = v.r;

    } catch (e) {
        alert("설정 오류! Config를 확인해주세요.\n" + e.message);
    }
}

/* =================================================================
   [4] 로그인 & 화면 전환
   ================================================================= */
function checkLoginStatus() {
    if(myName && appData.auth[myName]) {
        // 로그인 성공 상태
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        updateMainUI();
    } else {
        // 로그아웃 상태
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
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
            btn.innerHTML = `+ 빈 자리 ${idx+1}`;
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
    } else {
        alert("비밀번호가 틀려요!");
    }
};

window.tryRegister = function(slot) {
    const name = prompt("이름(닉네임)을 입력하세요:");
    if(!name) return;
    const pin = prompt("비밀번호 4자리를 설정하세요:");
    if(!pin) return;
    
    appData.auth[slot] = { name: name, pin: pin };
    // 빈 데이터 초기화
    if(!appData[slot]) appData[slot] = { resolution: [], bible: {}, history: {} };
    
    saveData().then(() => {
        myName = slot;
        localStorage.setItem('myId', slot);
        checkLoginStatus();
    });
};

window.logoutAction = function() {
    if(confirm("로그아웃 할까요?")) {
        localStorage.removeItem('myId');
        myName = null;
        checkLoginStatus();
    }
};

/* =================================================================
   [5] 메인 UI 렌더링
   ================================================================= */
function updateMainUI() {
    // 1. 이름 표시
    document.getElementById('user-name').innerText = appData.auth[myName].name;
    
    // 2. 리스트 렌더링
    renderResolutionList();
    
    // 3. 메시지 렌더링
    renderMessages();
    
    // 4. 통계 미리 계산
    updateStats();
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

        li.innerHTML = `
            <div class="res-text" onclick="window.editItem(${idx})">${item.text}</div>
            <div class="steps">${stepsHtml}</div>
            <div style="text-align:right; margin-top:5px;">
                <button onclick="window.deleteItem(${idx})" style="background:#ff5252; padding:5px 10px; font-size:0.8em;">삭제</button>
            </div>
        `;
        list.appendChild(li);
    });
}

/* =================================================================
   [6] 액션 함수들 (추가, 삭제, 체크)
   ================================================================= */
window.addItem = function() {
    const input = document.getElementById('input-resolution');
    const val = input.value.trim();
    if(!val) return;
    
    // "매일 성경 / 읽기 / 묵상" 형식 지원
    const parts = val.split('/');
    const title = parts[0].trim();
    const steps = parts.length > 1 ? parts.slice(1).map(s=>s.trim()) : ["완료"];
    
    if(!appData[myName].resolution) appData[myName].resolution = [];
    
    appData[myName].resolution.push({
        text: title,
        steps: steps,
        done: Array(steps.length).fill(false),
        counts: Array(steps.length).fill(0)
    });
    
    input.value = "";
    saveData();
};

window.toggleStep = function(itemIdx, stepIdx) {
    const item = appData[myName].resolution[itemIdx];
    const oldState = item.done[stepIdx];
    item.done[stepIdx] = !oldState;
    
    // 카운트 증가
    if(!item.counts) item.counts = Array(item.steps.length).fill(0);
    if(item.done[stepIdx]) item.counts[stepIdx]++;
    
    // 축하 효과
    if(item.done[stepIdx] && window.confetti) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    
    // 일일 기록 업데이트
    const today = new Date().toISOString().split('T')[0];
    if(!appData[myName].history) appData[myName].history = {};
    
    // 전체 완료 개수 계산
    let todayCount = 0;
    appData[myName].resolution.forEach(r => {
        r.done.forEach(d => { if(d) todayCount++; });
    });
    appData[myName].history[today] = todayCount;

    saveData();
};

window.deleteItem = function(idx) {
    if(confirm("정말 삭제할까요?")) {
        appData[myName].resolution.splice(idx, 1);
        saveData();
    }
};

window.editItem = function(idx) {
    const item = appData[myName].resolution[idx];
    const newText = prompt("수정할 내용:", item.text);
    if(newText) {
        item.text = newText;
        saveData();
    }
};

/* =================================================================
   [7] 탭 및 기타 기능
   ================================================================= */
window.goTab = function(tabId, btn) {
    // 버튼 활성화
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    // 페이지 전환
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + tabId).classList.remove('hidden');

    if(tabId === 'stats') renderStats();
};

window.sendMsg = function() {
    const input = document.getElementById('input-msg');
    const txt = input.value.trim();
    if(!txt) return;
    
    if(!appData.messages) appData.messages = [];
    appData.messages.push({
        sender: appData.auth[myName].name,
        text: txt,
        time: new Date().toISOString()
    });
    
    if(appData.messages.length > 50) appData.messages.shift(); // 50개 유지
    input.value = "";
    saveData();
};

function renderMessages() {
    const list = document.getElementById('msg-list');
    list.innerHTML = "";
    const msgs = [...(appData.messages || [])].reverse();
    
    msgs.forEach(m => {
        const li = document.createElement('li');
        const isMe = m.sender === appData.auth[myName].name;
        li.className = isMe ? "my-msg" : "other-msg";
        li.innerHTML = `
            <div class="msg-bubble">
                <div style="font-size:0.8em; color:#888;">${m.sender}</div>
                <div>${m.text}</div>
            </div>
        `;
        list.appendChild(li);
    });
}

// 데이터 저장 함수
async function saveData() {
    try {
        await setDoc(docRef, { appData: appData }, { merge: true });
        // UI 즉시 반영 (로컬)
        updateMainUI();
    } catch(e) {
        console.error("저장 실패:", e);
        alert("저장 실패! 인터넷 연결을 확인하세요.");
    }
}

function initNewData() {
    appData = { auth: {}, messages: [] };
    saveData();
}

/* 성경 및 통계 관련 간단 처리 (분량상 핵심만) */
window.showBibleBooks = function(type) {
    bibleState.currentTestament = type;
    document.getElementById('bible-main-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    
    const grid = document.getElementById('bible-books-grid');
    grid.innerHTML = "";
    document.getElementById('bible-testament-title').innerText = (type==='old'?"구약":"신약");
    
    BIBLE_DATA.books.filter(b=>b.testament===type).forEach(book => {
        const btn = document.createElement('div');
        btn.className = "bible-btn";
        btn.innerText = book.name;
        btn.onclick = () => showChapters(book);
        grid.appendChild(btn);
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
        
        label.innerHTML = `
            <input type="checkbox" ${isRead ? "checked" : ""} onchange="window.toggleChapter('${key}', this.checked)">
            <span>${i}</span>
        `;
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

function renderStats() {
    const div = document.getElementById('stats-content');
    div.innerHTML = "<h3>🏆 우리 가족 랭킹</h3>";
    
    // 간단 랭킹
    const users = USER_SLOTS.filter(u => appData.auth[u]);
    users.sort((a,b) => {
        const scoreA = Object.values(appData[a].history||{}).reduce((sum,v)=>sum+v, 0);
        const scoreB = Object.values(appData[b].history||{}).reduce((sum,v)=>sum+v, 0);
        return scoreB - scoreA;
    });
    
    users.forEach((u, i) => {
        const score = Object.values(appData[u].history||{}).reduce((sum,v)=>sum+v, 0);
        div.innerHTML += `<div class="rank-card"><span>${i+1}위 ${appData.auth[u].name}</span> <span>${score}점</span></div>`;
    });
}

function updateStats() {
    // 통계 미리 계산용 (필요시 구현)
}

// 앱 실행
startApp();
