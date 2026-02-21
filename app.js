// 🧠 Main Controller (사령관) - Undo Finish Feature

import { docRef } from './js/config.js';
import { onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { BIBLE_DATA, USER_SLOTS } from './js/data.js';

// [중요] v=undo_finish 로 버전을 바꿔서 브라우저가 새 UI(취소버튼)를 가져오게 합니다.
import * as UI from './js/ui.js?v=undo_finish';

let appData = {};
let myName = localStorage.getItem('myId');
let isDataLoaded = false;
let bibleState = { currentTestament: null, currentBook: null };
let rangeStart = null;

function startApp() {
    onSnapshot(docRef, (snapshot) => {
        const splash = document.getElementById('splash-screen');
        if(snapshot.exists()) {
            appData = snapshot.data();
            isDataLoaded = true;
            if(splash) { splash.style.opacity = '0'; setTimeout(()=> splash.style.display='none', 500); }
            if(!appData.auth) appData.auth = {};
            if(!appData.period) {
                const y = new Date().getFullYear();
                appData.period = { start: `${y}-01-01`, end: `${y}-12-31` };
            }
            checkLoginStatus();
        } else {
            console.warn("데이터 로드 실패");
        }
    });
}

async function saveData() {
    if(!isDataLoaded) return;
    try { await setDoc(docRef, appData, { merge: true }); updateMainUI(); } 
    catch(e) { console.error("저장 실패:", e); }
}

function updateMainUI() {
    if(!myName || !appData.auth[myName]) return;
    
    try {
        const nameEl = document.getElementById('user-name');
        if(nameEl) nameEl.innerText = appData.auth[myName].name;
        
        if(appData.verse && appData.verse.t) {
            const vt = document.getElementById('verse-text');
            const vr = document.getElementById('verse-ref');
            if(vt) vt.innerText = appData.verse.t;
            if(vr) vr.innerText = appData.verse.r;
        }
        
        UI.renderResolutionList(appData, myName);
        UI.renderFamilyGoals(appData, myName);
        UI.renderMessages(appData);
        UI.renderDashboard(appData, myName);
        
        if(bibleState.currentBook) UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
        if(bibleState.currentTestament) UI.renderBibleBooks(appData, myName, bibleState);
    } catch (err) {
        console.error("UI Update Error:", err);
    }
}

function checkLoginStatus() {
    if(!isDataLoaded) return;
    if(myName && appData.auth[myName]) {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        updateMainUI();
    } else {
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
        const grid = document.getElementById('login-grid');
        if(grid) {
            grid.innerHTML = "";
            USER_SLOTS.forEach(slot => {
                const btn = document.createElement('div');
                const user = appData.auth[slot];
                if(user) {
                    btn.className = "login-btn taken";
                    btn.innerHTML = `🔒 ${user.name}`;
                    btn.onclick = () => window.tryLogin(slot, user.pin);
                } else {
                    btn.className = "login-btn";
                    btn.innerHTML = `+ New`;
                    btn.onclick = () => window.tryRegister(slot);
                }
                grid.appendChild(btn);
            });
        }
    }
}

window.goTab = (t, el) => {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    if(el) el.classList.add('active');
    document.querySelectorAll('.page').forEach(e => e.classList.add('hidden'));
    const target = document.getElementById('page-' + t);
    if(target) target.classList.remove('hidden');
    updateMainUI();
};

window.toggleAccordion = (id, icon) => {
    const content = document.getElementById(id);
    if(content) content.classList.toggle('hidden');
    if(icon) icon.classList.toggle('open');
};

window.toggleFamilyList = (id) => {
    const list = document.getElementById(id);
    if(list) list.classList.toggle('hidden');
};

window.addItem = function() {
    const input = document.getElementById('input-resolution');
    const val = input.value.trim();
    if(!val) return;
    if(!appData[myName].resolution) appData[myName].resolution = [];
    appData[myName].resolution.push({ text: val, steps: ["완료"], done: [false], counts: [0] });
    input.value = "";
    saveData();
};

window.toggleStep = function(i, s) {
    const item = appData[myName].resolution[i];
    const today = UI.getTodayDate();
    const isAlreadyDone = (item.done[s] === today);
    if(!item.counts) item.counts = Array(item.steps.length).fill(0);
    if(isAlreadyDone) {
        item.done[s] = "";
        item.counts[s] = Math.max(0, item.counts[s]-1);
    } else {
        item.done[s] = today;
        item.counts[s]++;
        if(window.confetti) confetti({particleCount:50,spread:60,origin:{y:0.6}});
    }
    if(!appData[myName].history) appData[myName].history = {};
    let d = 0;
    appData[myName].resolution.forEach(r => { r.done.forEach(x => { if(x === today) d++; }); });
    appData[myName].history[today] = d;
    saveData();
};

window.deleteItem = (i) => { if(confirm("정말 삭제하시겠습니까?")) { appData[myName].resolution.splice(i,1); saveData(); }};
window.editItem = (i) => { const n = prompt("목표 수정:", appData[myName].resolution[i].text); if(n) { appData[myName].resolution[i].text = n; saveData(); }};
window.sendMsg = () => {
    const input = document.getElementById('input-msg');
    const txt = input.value.trim();
    if(!txt) return;
    if(!appData.messages) appData.messages = [];
    appData.messages.push({ sender: appData.auth[myName].name, text: txt });
    if(appData.messages.length > 50) appData.messages.shift();
    input.value = "";
    saveData();
};
window.editVerse = () => {
    const t = prompt("말씀:", appData.verse ? appData.verse.t : ""); if(t===null)return;
    const r = prompt("출처:", appData.verse ? appData.verse.r : ""); if(r===null)return;
    appData.verse = { t: t, r: r }; saveData();
};
window.editProfile = () => {
    const cur = appData.auth[myName].pin;
    if(prompt(`현재 비밀번호(${cur}) 입력:`) !== cur) return alert("비밀번호가 틀렸습니다.");
    const n = prompt("새 이름:", appData.auth[myName].name); if(!n)return;
    const p = prompt("새 비밀번호:", cur); if(!p)return;
    appData.auth[myName].name = n; appData.auth[myName].pin = p;
    saveData().then(()=>alert("수정되었습니다."));
};
window.logoutAction = () => { if(confirm("로그아웃 하시겠습니까?")) { localStorage.removeItem('myId'); location.reload(); }};
window.tryLogin = (s, p) => { if(prompt("비밀번호(PIN):")===p) { myName=s; localStorage.setItem('myId',s); checkLoginStatus(); } else alert("비밀번호가 틀렸습니다."); };
window.tryRegister = (s) => {
    const n = prompt("이름:"); if(!n)return; const p = prompt("비밀번호(PIN):"); if(!p)return;
    appData.auth[s] = {name:n, pin:p};
    if(!appData[s]) appData[s] = {resolution:[], bible:{}, history:{}};
    saveData().then(() => { myName=s; localStorage.setItem('myId',s); checkLoginStatus(); });
};

window.showBibleBooks = (t) => {
    bibleState.currentTestament = t;
    document.getElementById('bible-main-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    UI.renderBibleBooks(appData, myName, bibleState);
};
window.showChapters = (bn) => {
    bibleState.currentBook = bn;
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-chapters-view').classList.remove('hidden-view');
    document.getElementById('bible-book-title').innerText = bn;
    const tools = document.querySelector('.chapter-tools');
    if(tools) tools.innerHTML = `<button class="text-btn" onclick="window.toggleRangeMode()" id="btn-range" style="font-weight:600; color:var(--primary); margin-right:10px;">⚡️범위선택</button><button class="text-btn" onclick="window.controlAll(true)">전체</button><button class="text-btn" onclick="window.controlAll(false)" style="color:#94a3b8;">해제</button>`;
    rangeStart = null;
    UI.renderChaptersGrid(appData, myName, bibleState, rangeStart);
};
window.toggleRangeMode = () => {
    const btn = document.getElementById('btn-range');
    if(rangeStart === null) { rangeStart = -1; alert("시작 장을 누르고, 끝 장을 누르세요."); if(btn) { btn.style.fontWeight="800"; btn.innerText="선택중..."; } }
    else { rangeStart = null; if(btn) { btn.style.fontWeight="600"; btn.innerText="⚡️범위선택"; } UI.renderChaptersGrid(appData, myName, bibleState, rangeStart); }
};
window.toggleChapter = (chap, k, check) => {
    const today = UI.getTodayDate();
    if(!appData[myName].bible) appData[myName].bible={};
    if(!appData[myName].bibleLog) appData[myName].bibleLog=[];
    
    if(rangeStart !== null) {
        if(rangeStart === -1) { rangeStart = chap; UI.renderChaptersGrid(appData, myName, bibleState, rangeStart); }
        else {
            const s = Math.min(rangeStart, chap), e = Math.max(rangeStart, chap);
            for(let i=s; i<=e; i++) {
                const key = `${bibleState.currentBook}-${i}`;
                if(!appData[myName].bible[key]) { appData[myName].bible[key]=today; appData[myName].bibleLog.push({date:today, key:key}); }
            }
            saveData().then(()=>{ rangeStart=null; UI.renderChaptersGrid(appData, myName, bibleState, rangeStart); });
        }
        return;
    }
    if(check) { appData[myName].bible[k]=today; appData[myName].bibleLog.push({date:today, key:k}); }
    else { appData[myName].bible[k]=null; const idx=appData[myName].bibleLog.findIndex(x=>x.key===k && x.date===today); if(idx>-1)appData[myName].bibleLog.splice(idx,1); }
    saveData();
};
window.controlAll = (on) => {
    if(!on && !confirm("이 책의 체크를 모두 해제하시겠습니까?")) return;
    const b = BIBLE_DATA.books.find(x => x.name === bibleState.currentBook);
    const today = UI.getTodayDate();
    if(!appData[myName].bible) appData[myName].bible={};
    if(!appData[myName].bibleLog) appData[myName].bibleLog=[];
    for(let i=1; i<=b.chapters; i++) {
        const k=`${b.name}-${i}`;
        if(on) { if(!appData[myName].bible[k]) { appData[myName].bible[k]=today; appData[myName].bibleLog.push({date:today, key:k}); } }
        else { if(appData[myName].bible[k]) { appData[myName].bible[k]=null; const idx=appData[myName].bibleLog.findIndex(x=>x.key===k && x.date===today); if(idx>-1)appData[myName].bibleLog.splice(idx,1); } }
    }
    saveData();
};

window.finishBookAndReset = () => {
    if(document.getElementById('btn-finish-book').classList.contains('disabled')) return;
    if(confirm("완독 처리 하시겠습니까?\n(체크는 초기화되고 1독이 추가됩니다)")) {
        const b = bibleState.currentBook;
        if(!appData[myName].bibleRounds) appData[myName].bibleRounds={};
        appData[myName].bibleRounds[b] = (appData[myName].bibleRounds[b]||0)+1;
        const bookData = BIBLE_DATA.books.find(x => x.name === b);
        for(let i=1; i<=bookData.chapters; i++) appData[myName].bible[`${b}-${i}`]=null;
        saveData().then(()=>alert("축하합니다! 완독 완료! 🎉"));
    }
};

// [추가] 완독 취소 기능 구현
window.undoFinishBook = () => {
    const b = bibleState.currentBook;
    const currentRound = (appData[myName].bibleRounds && appData[myName].bibleRounds[b]) || 0;
    
    // 만약 완독한 적이 없다면(0독) 실행 안 함
    if(currentRound <= 0) return;
    
    if(confirm(`[${b}] 완독을 취소하시겠습니까?\n(독수가 1 줄어들고, 모든 장에 체크 표시가 복구됩니다.)`)) {
        // 1. 독수 1 깎기
        appData[myName].bibleRounds[b]--;
        // 0독이 되면 데이터 깔끔하게 삭제
        if(appData[myName].bibleRounds[b] <= 0) {
            delete appData[myName].bibleRounds[b];
        }
        
        // 2. 화면 체크 박스 복구
        const bookData = BIBLE_DATA.books.find(x => x.name === b);
        const today = UI.getTodayDate(); // 체크 박스 불 들어오게 하려면 날짜 데이터 필요
        
        if(!appData[myName].bible) appData[myName].bible = {};
        
        for(let i=1; i<=bookData.chapters; i++) {
            // bibleLog(역사 기록부)는 이미 이전 기록이 있으니 안 건드리고, 화면에 보여주는 용도인 bible만 살림
            appData[myName].bible[`${b}-${i}`] = today; 
        }
        
        saveData().then(()=>alert("완독 처리가 취소되었습니다. ↩️"));
    }
};

window.manageSeason = () => {
    const currentPeriod = appData.period;
    if(!confirm(`현재 시즌(${currentPeriod.start} ~ ${currentPeriod.end})을 마감하시겠습니까?\n\n- 결단서 1등이 명예의 전당에 기록됩니다.\n- 모든 가족의 결단서 점수가 0점으로 새출발합니다.\n(성경 읽기 기록은 유지됩니다)`)) return;

    const users = USER_SLOTS.filter(slot => appData.auth[slot]);
    const rankings = users.map(slot => {
        const history = appData[slot].history || {};
        const score = Object.keys(history).filter(d => d >= currentPeriod.start && d <= currentPeriod.end).reduce((sum, d) => sum + (history[d] || 0), 0);
        return { name: appData.auth[slot].name, val: score };
    });
    rankings.sort((a, b) => b.val - a.val);

    if(!appData.pastSeasons) appData.pastSeasons = [];
    if(rankings.length > 0) {
        appData.pastSeasons.push({ range: `${currentPeriod.start} ~ ${currentPeriod.end}`, winner: rankings[0].name, score: rankings[0].val });
    }

    const today = UI.getTodayDate();
    appData.period = { start: today, end: "2026-12-31" };

    saveData().then(() => {
        alert(`🏆 시즌 마감 완료!\n\n우승자: ${rankings[0] ? rankings[0].name : '없음'}\n\n이제 새로운 시즌이 시작되어 점수가 0점부터 다시 카운트됩니다.`);
        location.reload(); 
    });
};

window.backToBooks=()=>{ document.getElementById('bible-chapters-view').classList.add('hidden-view'); document.getElementById('bible-books-view').classList.remove('hidden-view'); };
window.showBibleMain=()=>{ document.getElementById('bible-books-view').classList.add('hidden-view'); document.getElementById('bible-main-view').classList.remove('hidden-view'); };

startApp();
