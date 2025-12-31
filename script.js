/* =================================================================
   [1] 모듈 불러오기
   ================================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =================================================================
   [2] 데이터 설정
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

let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let currentViewYear = new Date().getFullYear();
let myName = localStorage.getItem('myId'); 
let lastAlarmMinute = "";
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

/* =================================================================
   [3] 기능 함수들
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
}

function loginSuccess(slotId) {
    myName = slotId;
    localStorage.setItem('myId', slotId);
    document.getElementById('loginScreen').classList.add('hidden');
    updateUI();
}

window.logoutAction = function() {
    if(confirm("로그아웃 하시겠습니까?")) {
        localStorage.removeItem('myId');
        document.getElementById('loginScreen').classList.remove('hidden');
        myName = null;
        renderLoginScreen();
    }
}

window.saveAlarmTime = function() {
    const timeInput = document.getElementById('alarm-time-input').value;
    if(!timeInput) return alert("시간을 선택해주세요.");
    appData.alarmTime = timeInput;
    saveToServer().then(() => alert(`⏰ 가족 약속 시간이 [${timeInput}]로 설정되었습니다.`));
}

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

window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}
window.changeYear = function(delta) {
    currentViewYear += delta;
    refreshYearDisplay();
    updateUI(); 
}

window.toggleAccordion = function(id) {
    const content = document.getElementById(id);
    const arrow = content.previousElementSibling.querySelector('.arrow-icon');
    
    if(content.classList.contains('active')) {
        content.classList.remove('active');
        if(arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('active');
        if(arrow) arrow.style.transform = 'rotate(180deg)';
    }
}

window.goTab = function(t, element) {
    document.querySelectorAll('.tab').forEach(e => e.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.page').forEach(e => e.classList.remove('active'));
    document.getElementById(t).classList.add('active');
    
    if(t==='stats') {
        renderStatsPage(); 
    }
    if(t==='bible') updateUI();
}

function renderStatsPage() {
    const statsDiv = document.getElementById('stats');
    
    if(document.getElementById('accordion-res')) {
        renderAllRankings();
        renderCalendar();
        renderHabitAnalysis();
        return;
    }

    statsDiv.innerHTML = `
        <div class="accordion">
            <div class="accordion-header" onclick="window.toggleAccordion('accordion-res')">
                <span>🔥 결단서 랭킹 (시즌 설정)</span> <span class="arrow-icon" style="transform:rotate(180deg)">▼</span>
            </div>
            <div id="accordion-res" class="accordion-content active">
                <div class="period-box" style="margin-bottom:15px;">
                    <div style="font-weight:bold; color:var(--stats); font-size:13px;">📅 시즌 기간 설정</div>
                    <div style="display:flex; gap:5px; justify-content:center; margin-top:5px;">
                        <input type="date" id="startDateInput" style="width:40%;"> ~ <input type="date" id="endDateInput" style="width:40%;">
                    </div>
                    <button onclick="window.savePeriod()" style="margin-top:5px; padding:6px 15px; border:none; background:var(--stats); color:white; border-radius:8px; font-size:12px;">적용</button>
                    <div style="font-size:11px; color:#666; margin-top:5px;" id="rankPeriodLabel"></div>
                </div>
                <div id="resolutionRankList"></div>
            </div>
        </div>

        <div class="accordion">
            <div class="accordion-header" onclick="window.toggleAccordion('accordion-bible')">
                <span>📖 성경 다독왕</span> <span class="arrow-icon">▼</span>
            </div>
            <div id="accordion-bible" class="accordion-content">
                <div style="font-size:12px; color:#666; text-align:center; margin-bottom:10px;" id="bibleYearLabel"></div>
                <div id="bibleRankList"></div>
            </div>
        </div>

        <div class="accordion">
            <div class="accordion-header" onclick="window.toggleAccordion('accordion-cal')">
                <span>📅 월간 기록 (히트맵)</span> <span class="arrow-icon">▼</span>
            </div>
            <div id="accordion-cal" class="accordion-content">
                <div id="calendar-container"></div>
            </div>
        </div>

        <div class="accordion">
            <div class="accordion-header" onclick="window.toggleAccordion('accordion-habit')">
                <span>📊 습관 상세 분석</span> <span class="arrow-icon">▼</span>
            </div>
            <div id="accordion-habit" class="accordion-content">
                <div id="habitStatsList"></div>
            </div>
        </div>
    `;
    
    updateUI(); 
}

window.addItem = function(cat) {
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
}
window.deleteResolution = function(i) {
    if(confirm("삭제하시겠습니까?")) {
        appData[myName].resolution.splice(i, 1);
        updateDailyHistory(myName);
        renderMyList(); saveToServer();
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
        } else { item.steps = newSteps; }
        renderMyList(); saveToServer();
    }
}
window.toggleResolution = function(i, si) {
    const item = appData[myName].resolution[i];
    const isNowDone = !item.done[si];
    item.done[si] = isNowDone;
    if(!item.counts) item.counts = new Array(item.steps.length).fill(0);
    if(isNowDone) item.counts[si]++; else item.counts[si] = Math.max(0, item.counts[si] - 1);
    if(item.done.every(Boolean) && isNowDone) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    updateDailyHistory(myName);
    const stepsDiv = document.querySelectorAll('#list-resolution li')[i].querySelector('.steps');
    const stepDiv = stepsDiv.children[si];
    if(isNowDone) stepDiv.classList.add('done'); else stepDiv.classList.remove('done');
    saveToServer();
}

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
    renderBibleChapters(); updateMyStats(); saveToServer();
}
window.toggleChapter = function(key, isChecked) {
    if(!appData[myName].bible) appData[myName].bible = {};
    if(isChecked) appData[myName].bible[key] = getTodayStr();
    else delete appData[myName].bible[key];
    updateMyStats(); saveToServer();
}
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
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        saveToServer(); renderBibleChapters(); updateMyStats();
    }
}

window.savePeriod = function() {
    const s = document.getElementById('startDateInput').value;
    const e = document.getElementById('endDateInput').value;
    if(!s || !e) return alert("시작일과 종료일을 모두 입력해주세요.");
    appData.period = { start: s, end: e };
    renderAllRankings();
    saveToServer().then(() => alert("📅 시즌 기간 설정 완료!"));
}

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
}
window.deleteMsg = function(idx) {
    if(confirm("메시지 삭제?")) {
        appData.messages.splice(idx, 1);
        renderMessages(); saveToServer();
    }
}
window.changeCalMonth = function(delta) {
    calMonth += delta;
    if(calMonth > 11) { calMonth = 0; calYear++; }
    else if(calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
}

window.showDateDetail = function(dateStr) {
    const historyVal = (appData[myName].history && appData[myName].history[dateStr]) || 0;
    
    let totalItems = 0;
    (appData[myName].resolution || []).forEach(item => totalItems += item.steps.length);
    if(totalItems === 0) totalItems = 1;

    const percent = Math.round((historyVal / totalItems) * 100);
    const detailBox = document.getElementById('calDetailBox');
    
    detailBox.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">${dateStr} 기록</div>
        <div style="font-size:16px; color:var(--primary); font-weight:800;">
            ${totalItems}개 중 ${historyVal}개 성공 (${percent}%)
        </div>
        ${historyVal === totalItems && totalItems > 0 ? '<div style="color:#FF9800; margin-top:5px;">🏆 퍼펙트! 참 잘했어요</div>' : ''}
    `;
    detailBox.classList.add('show');
}

/* =================================================================
   [4] 렌더링 함수들
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
    USER_SLOTS.forEach(sid => appData[sid] = { resolution: [], bible: {}, history: {}, bibleRounds: {} });
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
        // [안전장치] 내 데이터가 없으면 로그인 화면으로 보냄
        if (!appData[myName]) {
            console.error("데이터 로드 실패: 재로그인 필요");
            return;
        }

        const myInfo = appData.auth[myName];
        document.getElementById('userNameDisplay').textContent = myInfo ? myInfo.name : "사용자";
        if(document.activeElement.tagName !== 'INPUT') {
            renderMyList();
            renderMessages();
        }
        renderBibleUI();
        updateMyStats(); 
        if(appData.alarmTime) {
            const alarmInput = document.getElementById('alarm-time-input');
            if(alarmInput) alarmInput.value = appData.alarmTime;
        }
        
        // [중요] 통계 탭이 열려있으면 아코디언 UI를 강제로 그림
        const statsTab = document.getElementById('stats');
        if(statsTab && statsTab.classList.contains('active')) {
            renderStatsPage(); // 여기서 내용이 그려짐
        }
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

function calculateTotalBibleRead(slotId) {
    const memberData = appData[slotId] || {};
    const bible = memberData.bible || {};
    const bibleRounds = memberData.bibleRounds || {};
    
    let total = 0;
    for(const [key, dateStr] of Object.entries(bible)) {
        if(isInViewYear(dateStr)) total++;
    }
    BIBLE_DATA.books.forEach(book => {
        const rounds = bibleRounds[book.name] || 0;
        total += (rounds * book.chapters);
    });
    return total;
}

function renderAllRankings() {
    const resList = document.getElementById('resolutionRankList');
    if(!resList) return;
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
    if(!bibleList) return;
    bibleList.innerHTML = "";
    
    if(document.getElementById('bibleYearLabel')) {
        document.getElementById('bibleYearLabel').textContent = `2025년 전체 누적`;
    }
    const bibleRank = activeUsers.map(sid => {
        const name = appData.auth[sid].name;
        const totalVal = calculateTotalBibleRead(sid);
        return { name: name, val: totalVal };
    }).sort((a,b) => b.val - a.val);
    bibleRank.forEach((d, i) => {
        const div = document.createElement('div');
        div.className = "rank-card";
        div.innerHTML = `<div class="rank-num">${i+1}</div><div class="rank-name">${d.name}</div><div class="rank-score">${d.val} <span class="rank-unit">장</span></div>`;
        bibleList.appendChild(div);
    });
}

function renderHabitAnalysis() {
    const container = document.getElementById('habitStatsList');
    if(!container) return;
    // [안전장치] 데이터 확인
    if(!myName || !appData[myName] || !appData[myName].resolution) {
        container.innerHTML = "<div style='text-align:center;color:#999;'>데이터 없음</div>";
        return;
    }
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
    container.innerHTML = "";
    flatList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'habit-bar-item';
        const percent = (item.count / maxVal) * 100;
        row.innerHTML = `<div class="habit-bar-name">${item.name}</div><div class="habit-bar-graph"><div class="habit-bar-fill" style="width:${percent}%"></div></div><div class="habit-bar-count">${item.count}</div>`;
        container.appendChild(row);
    });
}

function renderCalendar() {
    if(!myName) return;
    const container = document.getElementById('calendar-container');
    if(!container) return;

    container.innerHTML = `
        <div class="cal-header">
            <button class="cal-nav-btn" onclick="window.changeCalMonth(-1)">◀</button>
            <span>${calYear}년 ${calMonth + 1}월</span>
            <button class="cal-nav-btn" onclick="window.changeCalMonth(1)">▶</button>
        </div>
        <div class="cal-grid" id="calGrid"></div>
        <div class="cal-detail-box" id="calDetailBox"></div>
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

setInterval(() => {
    if(!appData.alarmTime) return;
    const now = new Date();
    const currentHM = now.toTimeString().slice(0, 5);
    if(currentHM === appData.alarmTime && lastAlarmMinute !== currentHM) {
        lastAlarmMinute = currentHM;
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
        audio.play().catch(e => console.log("브라우저 정책상 소리 재생 차단됨"));
        alert(`🔔 딩동댕! [${appData.alarmTime}] 입니다.\n우리 가족 약속 시간이에요! ❤️`);
    }
}, 1000);

try {
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    const verse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
    if(document.getElementById('verseText')) {
        document.getElementById('verseText').textContent = verse.t;
        document.getElementById('verseRef').textContent = verse.r;
    }
    refreshYearDisplay();
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    docRef = doc(db, "appData", "familyDataV28_Secure");
    const statusDiv = document.getElementById('serverStatus');
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // [중요] Matryoshka Fix (데이터 구조 자동 감지)
            if (data.appData) {
                appData = data.appData; 
            } else {
                appData = data; 
            }

            let needSave = false;
            if(!appData.period) { appData.period = {start:"", end:""}; needSave = true; }
            if(!appData.messages) { appData.messages = []; needSave = true; }
            if(!appData.auth) { appData.auth = {}; needSave = true; }
            USER_SLOTS.forEach(sid => {
                if(!appData[sid]) { appData[sid] = { resolution: [], bible: {}, history: {}, bibleRounds: {} }; needSave = true; }
            });
            if (data.lastDate !== new Date().toDateString()) { resetDailyCheckboxes(); }
            else { if(needSave) saveToServer(); renderLoginScreen(); if(myName) updateUI(); }
            if(statusDiv) statusDiv.textContent = "🟢 실시간 연동됨";
        } else { initData(); }
    }, (error) => { alert("서버 연결 오류:\n" + error.message); if(statusDiv) statusDiv.textContent = "🔴 연결 실패 (" + error.code + ")"; });
} catch (e) { alert("코드 실행 오류:\n" + e.message); }
/* =================================================================
   [보충] 누락된 렌더링 및 로직 함수들 (이 부분을 꼭 추가하세요!)
   ================================================================= */

// 1. 나의 결단 목록 그리기
function renderMyList() {
    const list = document.getElementById('list-resolution');
    if(!list) return;
    list.innerHTML = "";
    
    if(!appData[myName].resolution) appData[myName].resolution = [];
    
    appData[myName].resolution.forEach((item, i) => {
        const li = document.createElement('li');
        
        // 단계별 체크박스 생성
        let stepsHtml = '';
        item.steps.forEach((step, si) => {
            const isDone = item.done[si] ? 'done' : '';
            stepsHtml += `
                <div class="step-item ${isDone}" onclick="window.toggleResolution(${i}, ${si})">
                    <div class="chk-box"></div>
                    <span class="step-label">${step}</span>
                </div>
            `;
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

// 2. 가족 한마디(메시지) 그리기
function renderMessages() {
    const msgList = document.getElementById('msg-list');
    if(!msgList) return;
    msgList.innerHTML = "";
    
    if(!appData.messages) appData.messages = [];
    const reversed = [...appData.messages].reverse(); // 최신순 정렬

    reversed.forEach((msg, idx) => {
        // 원본 배열에서의 인덱스 계산 (삭제를 위해)
        const originalIdx = appData.messages.length - 1 - idx;
        const li = document.createElement('li');
        const isMe = msg.id === myName;
        
        li.className = isMe ? "my-msg" : "other-msg";
        const dateStr = msg.ts ? new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
        
        li.innerHTML = `
            <div class="msg-bubble">
                <div class="msg-sender">${msg.sender}</div>
                <div class="msg-text">${msg.text}</div>
                <div class="msg-info">
                    ${dateStr} 
                    ${isMe ? `<span class="msg-del" onclick="window.deleteMsg(${originalIdx})">x</span>` : ""}
                </div>
            </div>
        `;
        msgList.appendChild(li);
    });
}

// 3. 성경 탭 UI 그리기 (메인/목록/챕터 전환)
function renderBibleUI() {
    // 현재 상태에 따라 보이는 화면 결정
    const mainView = document.getElementById('bible-main-view');
    const booksView = document.getElementById('bible-books-view');
    const chaptersView = document.getElementById('bible-chapters-view');
    
    if(!mainView) return; // HTML 요소가 없으면 중단

    // 기본적으로 모두 숨기고 필요한 것만 보임 (CSS 클래스 활용)
    // *이 함수는 탭 전환 시 호출되어 상태를 초기화하거나 갱신하는 역할*
    if(bibleState.currentBook) {
        // 책을 보고 있던 상태라면
        mainView.classList.add('hidden-view');
        booksView.classList.add('hidden-view');
        chaptersView.classList.remove('hidden-view');
        renderBibleChapters();
    } else if(bibleState.currentTestament) {
        // 목록을 보고 있던 상태라면
        mainView.classList.add('hidden-view');
        booksView.classList.remove('hidden-view');
        chaptersView.classList.add('hidden-view');
        renderBibleBooks();
    } else {
        // 메인 화면
        mainView.classList.remove('hidden-view');
        booksView.classList.add('hidden-view');
        chaptersView.classList.add('hidden-view');
    }
}

// 4. 성경 책 목록 그리기 (구약/신약)
function renderBibleBooks() {
    const container = document.getElementById('bible-books-grid');
    if(!container) return;
    container.innerHTML = "";
    
    const targetBooks = BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament);
    
    targetBooks.forEach(book => {
        const btn = document.createElement('div');
        btn.className = 'bible-btn';
        
        // 완독 횟수 뱃지
        const rounds = (appData[myName].bibleRounds && appData[myName].bibleRounds[book.name]) || 0;
        const badge = rounds > 0 ? `<span class="round-badge">+${rounds}</span>` : "";
        
        // 진행률 계산
        let readCount = 0;
        for(let i=1; i<=book.chapters; i++) {
            if(appData[myName].bible && appData[myName].bible[`${book.name}-${i}`]) readCount++;
        }
        const isDone = readCount >= book.chapters;
        if(isDone) btn.classList.add('completed-book'); // CSS 필요 시

        btn.innerHTML = `${book.name} ${badge}`;
        btn.onclick = () => window.showChapters(book.name);
        container.appendChild(btn);
    });
}

// 5. 성경 장(Chapter) 그리기
function renderBibleChapters() {
    const container = document.getElementById('bible-chapters-grid');
    if(!container) return;
    container.innerHTML = "";
    
    const book = BIBLE_DATA.books.find(b => b.name === bibleState.currentBook);
    if(!book) return;

    for(let i=1; i<=book.chapters; i++) {
        const key = `${book.name}-${i}`;
        const isRead = (appData[myName].bible && appData[myName].bible[key]);
        const isThisYear = isInViewYear(isRead);
        
        const label = document.createElement('label');
        label.className = 'chapter-item';
        
        // 체크박스
        const chk = document.createElement('input');
        chk.type = "checkbox";
        chk.checked = isThisYear;
        chk.onchange = (e) => window.toggleChapter(key, e.target.checked);
        
        const span = document.createElement('span');
        span.textContent = `${i}장`;
        
        label.appendChild(chk);
        label.appendChild(span);
        container.appendChild(label);
    }
}

// 6. 일일 기록 업데이트 (통계용)
function updateDailyHistory(slotId) {
    const today = getTodayStr();
    if(!appData[slotId].history) appData[slotId].history = {};
    
    let totalDone = 0;
    const list = appData[slotId].resolution || [];
    
    list.forEach(item => {
        // 오늘 완료한 체크박스 수 계산 (counts 배열 활용)
        // 주의: 여기서는 단순화를 위해 '현재 체크된 상태'를 오늘 한 것으로 간주하거나
        // counts 로직이 있다면 그것을 활용. 
        // *기존 로직 유지*: toggleResolution에서 counts를 올리고 있음.
        // 하지만 히트맵에는 '오늘 완료한 총 갯수'가 필요함.
        
        // 여기서는 간단히 '현재 완료된 항목 수'의 합계를 저장하거나,
        // 더 정확히는 toggleResolution에서 이미 history를 +1 / -1 하고 있으므로
        // 이 함수는 '동기화' 목적으로만 사용.
        
        // 현재 상태 기반 재계산 로직:
        item.done.forEach(d => { if(d) totalDone++; });
    });
    
    // 단순하게 현재 체크된 갯수로 오늘 기록을 덮어쓰기 (가장 오류가 적음)
    appData[slotId].history[today] = totalDone;
}

// 7. 내 통계 요약 업데이트 (화면 상단 등)
function updateMyStats() {
    // 1. 읽은 성경 장 수 계산
    let bibleCount = 0;
    if(appData[myName].bible) {
        Object.values(appData[myName].bible).forEach(dateStr => {
            if(isInViewYear(dateStr)) bibleCount++;
        });
    }
    
    // 2. 완독 권수 계산
    let booksDone = 0;
    if(appData[myName].bibleRounds) {
        Object.values(appData[myName].bibleRounds).forEach(r => booksDone += r);
    }

    // UI에 반영 (HTML에 해당 ID가 있다고 가정)
    const bibleStatElem = document.getElementById('myBibleStat'); 
    if(bibleStatElem) {
        bibleStatElem.textContent = `올해 ${bibleCount}장 읽음 (완독 ${booksDone}권)`;
    }
}
