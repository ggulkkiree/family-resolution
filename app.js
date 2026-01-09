import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0Vorv3SFatQuC7OCYHPA-Nok4DlqonrI",
    authDomain: "family-resolution.firebaseapp.com",
    projectId: "family-resolution",
    storageBucket: "family-resolution.firebasestorage.app",
    messagingSenderId: "711396068080",
    appId: "1:711396068080:web:861c41a8259f0b6dca9035",
    measurementId: "G-RH6E87B4H0"
};

const BIBLE_DATA = { "books": [ { "name": "창세기", "chapters": 50, "testament": "old" }, { "name": "출애굽기", "chapters": 40, "testament": "old" }, { "name": "레위기", "chapters": 27, "testament": "old" }, { "name": "민수기", "chapters": 36, "testament": "old" }, { "name": "신명기", "chapters": 34, "testament": "old" }, { "name": "여호수아", "chapters": 24, "testament": "old" }, { "name": "사사기", "chapters": 21, "testament": "old" }, { "name": "룻기", "chapters": 4, "testament": "old" }, { "name": "사무엘상", "chapters": 31, "testament": "old" }, { "name": "사무엘하", "chapters": 24, "testament": "old" }, { "name": "열왕기상", "chapters": 22, "testament": "old" }, { "name": "열왕기하", "chapters": 25, "testament": "old" }, { "name": "역대상", "chapters": 29, "testament": "old" }, { "name": "역대하", "chapters": 36, "testament": "old" }, { "name": "에스라", "chapters": 10, "testament": "old" }, { "name": "느헤미야", "chapters": 13, "testament": "old" }, { "name": "에스더", "chapters": 10, "testament": "old" }, { "name": "욥기", "chapters": 42, "testament": "old" }, { "name": "시편", "chapters": 150, "testament": "old" }, { "name": "잠언", "chapters": 31, "testament": "old" }, { "name": "전도서", "chapters": 12, "testament": "old" }, { "name": "아가", "chapters": 8, "testament": "old" }, { "name": "이사야", "chapters": 66, "testament": "old" }, { "name": "예레미야", "chapters": 52, "testament": "old" }, { "name": "예레미야애가", "chapters": 5, "testament": "old" }, { "name": "에스겔", "chapters": 48, "testament": "old" }, { "name": "다니엘", "chapters": 12, "testament": "old" }, { "name": "호세아", "chapters": 14, "testament": "old" }, { "name": "요엘", "chapters": 3, "testament": "old" }, { "name": "아모스", "chapters": 9, "testament": "old" }, { "name": "오바댜", "chapters": 1, "testament": "old" }, { "name": "요나", "chapters": 4, "testament": "old" }, { "name": "미가", "chapters": 7, "testament": "old" }, { "name": "나훔", "chapters": 3, "testament": "old" }, { "name": "하박국", "chapters": 3, "testament": "old" }, { "name": "스바냐", "chapters": 3, "testament": "old" }, { "name": "학개", "chapters": 2, "testament": "old" }, { "name": "스가랴", "chapters": 14, "testament": "old" }, { "name": "말라기", "chapters": 4, "testament": "old" }, { "name": "마태복음", "chapters": 28, "testament": "new" }, { "name": "마가복음", "chapters": 16, "testament": "new" }, { "name": "누가복음", "chapters": 24, "testament": "new" }, { "name": "요한복음", "chapters": 21, "testament": "new" }, { "name": "사도행전", "chapters": 28, "testament": "new" }, { "name": "로마서", "chapters": 16, "testament": "new" }, { "name": "고린도전서", "chapters": 16, "testament": "new" }, { "name": "고린도후서", "chapters": 13, "testament": "new" }, { "name": "갈라디아서", "chapters": 6, "testament": "new" }, { "name": "에베소서", "chapters": 6, "testament": "new" }, { "name": "빌립보서", "chapters": 4, "testament": "new" }, { "name": "골로새서", "chapters": 4, "testament": "new" }, { "name": "데살로니가전서", "chapters": 5, "testament": "new" }, { "name": "데살로니가후서", "chapters": 3, "testament": "new" }, { "name": "디모데전서", "chapters": 6, "testament": "new" }, { "name": "디모데후서", "chapters": 4, "testament": "new" }, { "name": "디도서", "chapters": 3, "testament": "new" }, { "name": "빌레몬서", "chapters": 1, "testament": "new" }, { "name": "히브리서", "chapters": 13, "testament": "new" }, { "name": "야고보서", "chapters": 5, "testament": "new" }, { "name": "베드로전서", "chapters": 5, "testament": "new" }, { "name": "베드로후서", "chapters": 3, "testament": "new" }, { "name": "요한1서", "chapters": 5, "testament": "new" }, { "name": "요한2서", "chapters": 1, "testament": "new" }, { "name": "요한3서", "chapters": 1, "testament": "new" }, { "name": "유다서", "chapters": 1, "testament": "new" }, { "name": "요한계시록", "chapters": 22, "testament": "new" } ] };
const USER_SLOTS = ["user_1", "user_2", "user_3", "user_4", "user_5", "user_6"];

let app, db, docRef;
let appData = {};
let bibleState = { currentTestament: null, currentBook: null };
let myName = localStorage.getItem('myId');
let rangeStart = null; 

async function startApp() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        docRef = doc(db, "appData", "FamilyGoals_2026_Official"); 

        onSnapshot(docRef, (snapshot) => {
            const splash = document.getElementById('splash-screen');
            if(splash) {
                splash.style.opacity = '0';
                setTimeout(()=> splash.style.display='none', 500);
            }

            if(snapshot.exists()) {
                appData = snapshot.data();
                
                if(!appData.auth) appData.auth = {};
                if(!appData.period) {
                    const y = new Date().getFullYear();
                    appData.period = { start: `${y}-01-01`, end: `${y}-12-31` };
                }
                
                USER_SLOTS.forEach(slot => {
                    if(!appData[slot]) appData[slot] = { resolution: [], bible: {}, history: {}, bibleRounds: {}, bibleLog: [] };
                    if(!appData[slot].bibleLog) appData[slot].bibleLog = [];
                    if(!appData[slot].resolution) appData[slot].resolution = [];
                });
                checkLoginStatus();
            } else {
                initNewData();
            }
        }, (error) => {
            console.error("DB Error:", error);
            const errMsg = document.getElementById('error-msg');
            if(errMsg) errMsg.innerText = "데이터 연결 실패! 인터넷을 확인해주세요.";
        });
    } catch (e) { alert("Config 오류"); }
}

function getTodayDate() {
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return kstDate.toISOString().split('T')[0];
}

// 토요일 시작 ~ 금요일 종료 주간 범위 계산 함수
function getWeeklyRange(){
    const now = new Date(); 
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const day = kstNow.getDay(); // 0(일) ~ 6(토)
    
    // 이번주 시작일(가장 최근 토요일) 찾기
    // 토(6) -> 0일전, 일(0) -> 1일전, ..., 금(5) -> 6일전
    const offset = (day + 1) % 7; 
    
    const s = new Date(kstNow); 
    s.setDate(kstNow.getDate() - offset);
    
    const e = new Date(s); 
    e.setDate(s.getDate() + 6);
    
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
}

window.editProfile = function() {
    if(!myName || !appData.auth[myName]) return;
    const curName = appData.auth[myName].name;
    const curPin = appData.auth[myName].pin;
    
    const inputPin = prompt(`정보를 수정하려면 현재 비밀번호(${curPin})를 입력하세요.`);
    if(inputPin !== curPin) { alert("비밀번호가 틀렸습니다."); return; }

    const newName = prompt("새로운 이름을 입력하세요:", curName);
    if(!newName) return;
    const newPin = prompt("새로운 비밀번호(PIN)를 입력하세요:", curPin);
    if(!newPin) return;

    appData.auth[myName].name = newName;
    appData.auth[myName].pin = newPin;
    saveData().then(() => alert("정보가 수정되었습니다."));
};

window.addItem = function() {
    const input = document.getElementById('input-resolution');
    const val = input.value.trim();
    if(!val) return;
    if(!myName || !appData[myName]) { alert("로딩중..."); return; }
    if(!appData[myName].resolution) appData[myName].resolution = [];
    appData[myName].resolution.push({ text: val, steps: ["완료"], done: [false], counts: [0] });
    input.value = "";
    saveData();
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

window.editVerse = function() {
    const currentT = appData.verse ? appData.verse.t : "";
    const currentR = appData.verse ? appData.verse.r : "";
    const newT = prompt("말씀 내용:", currentT);
    if(newT === null) return;
    const newR = prompt("말씀 출처:", currentR);
    if(newR === null) return;
    if(!appData.verse) appData.verse = {};
    appData.verse.t = newT;
    appData.verse.r = newR;
    saveData();
};

function checkLoginStatus() {
    if(myName && appData.auth[myName]) {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        updateMainUI();
    } else {
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
            btn.innerHTML = `+ New`;
            btn.onclick = () => tryRegister(slot);
        }
        grid.appendChild(btn);
    });
}

window.tryLogin = (s, p) => { if(prompt("비밀번호(PIN):")===p) { myName=s; localStorage.setItem('myId',s); checkLoginStatus(); } else alert("비밀번호 불일치"); };

window.tryRegister = (s) => { 
    const n=prompt("이름을 입력하세요:"); 
    if(!n)return; 
    const p=prompt("비밀번호(PIN)를 입력하세요:"); 
    if(!p)return; 
    
    appData.auth[s]={name:n,pin:p}; 
    if(!appData[s]) appData[s]={resolution:[],bible:{},history:{}}; 
    
    saveData().then(()=>{
        myName=s; 
        localStorage.setItem('myId',s); 
        checkLoginStatus();
        alert("등록 완료!");
    }); 
};

window.logoutAction = () => { if(confirm("로그아웃 하시겠습니까?")) { localStorage.removeItem('myId'); myName=null; checkLoginStatus(); } };

function updateMainUI() {
    document.getElementById('user-name').innerText = appData.auth[myName].name;
    if(appData.verse && appData.verse.t) {
        document.getElementById('verse-text').innerText = appData.verse.t;
        document.getElementById('verse-ref').innerText = appData.verse.r;
    } else {
        document.getElementById('verse-text').innerText = "환영합니다! ✏️버튼을 눌러 말씀을 입력해주세요.";
        document.getElementById('verse-ref').innerText = "Family Goals 2026";
    }
    renderResolutionList(); 
    renderFamilyGoals();
    renderMessages(); 
    renderDashboard();
    updateBibleStats(); 
}

function renderFamilyGoals() {
    const container = document.getElementById('family-goals-container');
    if(!container) return;
    container.innerHTML = "";

    USER_SLOTS.forEach((slot, idx) => {
        if(slot === myName) return; 
        if(!appData.auth[slot]) return; 

        const user = appData.auth[slot];
        const goals = appData[slot].resolution || [];
        const total = goals.length;

        const card = document.createElement('div');
        card.className = "family-card";
        
        let html = `
            <div class="family-header" onclick="window.toggleFamilyList('fam-list-${idx}')">
                <span class="family-name">${user.name}</span>
                <span class="family-summary">${total}개의 목표</span>
            </div>
            <ul id="fam-list-${idx}" class="family-goal-list">
        `;

        if(total === 0) {
            html += `<li class="family-goal-item" style="color:#94a3b8;">등록된 목표가 없습니다.</li>`;
        } else {
            goals.forEach(g => {
                html += `
                    <li class="family-goal-item">
                        <span class="fg-bullet" style="color:#cbd5e1;">•</span>
                        <span>${g.text}</span>
                    </li>
                `;
            });
        }
        html += `</ul>`;
        card.innerHTML = html;
        container.appendChild(card);
    });
}

window.toggleFamilyList = function(id) {
    const list = document.getElementById(id);
    if(list.classList.contains('show')) {
        list.classList.remove('show');
    } else {
        document.querySelectorAll('.family-goal-list').forEach(l => l.classList.remove('show'));
        list.classList.add('show');
    }
};

function renderDashboard() {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    document.getElementById('period-display').innerText = `${period.start} ~ ${period.end}`;
    const myHistory = appData[myName].history || {};
    const myBible = appData[myName].bible || {};
    const today = getTodayDate();

    const myGoals = appData[myName].resolution || [];
    let todayTotal = 0, todayDone = 0;
    const taskList = document.getElementById('today-task-list'); taskList.innerHTML = "";
    
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        todayTotal++; 
        if(isDoneToday) todayDone++;
        const div = document.createElement('div');
        div.className = "today-check-row";
        div.innerHTML = `<span style="font-size:0.9rem;">${g.text}</span><span style="font-size:1.2rem; color:${isDoneToday?'var(--success)':'#ddd'}">${isDoneToday?'●':'○'}</span>`;
        taskList.appendChild(div);
    });

    const statusPill = document.getElementById('today-status');
    statusPill.innerText = `${todayDone}/${todayTotal} 완료`;
    if(todayDone === todayTotal && todayTotal > 0) statusPill.classList.add('done'); else statusPill.classList.remove('done');

    let rate = 0;
    if(todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100);
    document.getElementById('dash-rate').innerText = rate + "%";
    setTimeout(() => { document.getElementById('donut-fill').style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);

    let streak = myHistory[today] ? 1 : 0;
    const fireIcon = document.getElementById('streak-icon');
    const streakLabel = document.getElementById('streak-label');
    fireIcon.className = "fas fa-fire streak-icon"; 
    
    if(rate >= 100 && todayTotal > 0) {
        fireIcon.className = "fas fa-crown streak-icon gold"; streakLabel.innerText = "완벽한 하루!";
    } else if(rate >= 50) {
        fireIcon.classList.add('active'); streakLabel.innerText = "연속 성공 중";
    } else {
        streakLabel.innerText = "50% 이상 도전!";
    }
    
    let realStreak = 0;
    const now = new Date();
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    for(let i=0; i<365; i++) {
        const d = new Date(kstNow); d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        if(myHistory[dStr] > 0) realStreak++; else if(i>0) break; 
    }
    document.getElementById('dash-streak').innerText = realStreak + "일";

    let lastBook = "없음", percent = 0;
    const readKeys = Object.keys(myBible).sort();
    if(readKeys.length > 0) {
        const lastKey = readKeys[readKeys.length-1];
        const [bName] = lastKey.split('-');
        lastBook = bName;
        const bookData = BIBLE_DATA.books.find(b=>b.name===bName);
        if(bookData) percent = Math.round((readKeys.filter(k=>k.startsWith(bName+'-')).length / bookData.chapters) * 100);
    }
    document.getElementById('current-book-name').innerText = lastBook;
    document.getElementById('bible-book-percent').innerText = percent + "%";
    setTimeout(() => { document.getElementById('bible-progress-bar').style.width = percent + "%"; }, 100);

    // --- 주간 그래프 그리기 (토요일 ~ 금요일) ---
    const weekGraph = document.getElementById('weekly-graph'); 
    weekGraph.innerHTML = "";
    
    const dayOfWeek = kstNow.getDay();
    const offset = (dayOfWeek + 1) % 7; 
    const saturdayStart = new Date(kstNow);
    saturdayStart.setDate(kstNow.getDate() - offset);

    const dayNames = ['일','월','화','수','목','금','토'];

    for(let i=0; i<7; i++) {
        const d = new Date(saturdayStart);
        d.setDate(saturdayStart.getDate() + i); 
        const dStr = d.toISOString().split('T')[0];
        
        const count = myHistory[dStr] || 0;
        const h = Math.min(100, count * 25); 
        const isToday = (dStr === today);
        const dayLabel = dayNames[d.getDay()]; 

        weekGraph.innerHTML += `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;">
                <div style="flex:1;display:flex;align-items:flex-end;width:100%;"><div class="week-bar ${h>0?'high':''}" style="width:60%;margin:0 auto;height:${h}%; ${isToday ? 'opacity:0.8;' : ''}"></div></div>
                <div class="week-day-label" style="${isToday ? 'font-weight:bold;color:var(--primary);' : ''}">${dayLabel}</div>
            </div>`;
    }
    
    renderRankings(period); 
    renderHallOfFame();
}

function renderRankings(p){
    const u=USER_SLOTS.filter(x=>appData.auth&&appData.auth[x]);
    const r=document.getElementById('rank-resolution');
    r.innerHTML="";
    
    // 결단서 랭킹
    u.map(x=>{
        const h=appData[x].history||{},s=Object.keys(h).filter(d=>d>=p.start&&d<=p.end).reduce((a,b)=>a+h[b],0);
        return{name:appData.auth[x].name,val:s}
    }).sort((a,b)=>b.val-a.val).forEach((x,i)=>r.innerHTML+=`<div class="rank-row"><span>${i+1}.${x.name}</span><span class="score">${x.val}점</span></div>`);
    
    // 성경 랭킹 (수정됨: bibleLog 대신 bible 직접 참조)
    const w = getWeeklyRange();
    
    document.querySelector('.ranking-box:nth-child(2) .ranking-title').innerText=`📖 성경 (이번주)`;
    const b=document.getElementById('rank-bible');
    b.innerHTML="";
    
    u.map(x=>{
        // 중요 수정: log 배열이 아니라, 실제로 체크된 bible 객체의 '날짜' 값들을 직접 카운트합니다.
        const bibleData = appData[x].bible || {};
        const c = Object.values(bibleData).filter(date => date >= w.start && date <= w.end).length;
        return{name:appData.auth[x].name,val:c}
    }).sort((a,b)=>b.val-a.val).forEach((x,i)=>b.innerHTML+=`<div class="rank-row"><span>${i+1}.${x.name}</span><span class="score">${x.val}장</span></div>`);
}

function renderHallOfFame(){const l=document.getElementById('hall-of-fame-list');l.innerHTML="";(appData.pastSeasons||[]).reverse().forEach(p=>l.innerHTML+=`<div class="fame-row"><div class="fame-season">${p.range}</div><div class="fame-winner">👑 ${p.winner} (${p.score})</div></div>`);if(l.innerHTML==="")l.innerHTML="<div style='text-align:center;color:#94a3b8;font-size:0.8rem;'>기록 없음</div>";}
window.toggleAccordion=function(id,h){const c=document.getElementById(id);c.classList.toggle('hidden');h.classList.toggle('open');};
window.manageSeason=function(){const c=appData.period;if(!confirm(`시즌(${c.start}~${c.end}) 마감?`)){const s=prompt("시작일",c.start),e=prompt("종료일",c.end);if(s&&e){appData.period={start:s,end:e};saveData();}return;}const u=USER_SLOTS.filter(x=>appData.auth&&appData.auth[x]),r=u.map(x=>{const h=appData[x].history||{},s=Object.keys(h).filter(d=>d>=c.start&&d<=c.end).reduce((a,b)=>a+h[b],0);return{name:appData.auth[x].name,val:s}}).sort((a,b)=>b.val-a.val);if(!appData.pastSeasons)appData.pastSeasons=[];if(r.length>0)appData.pastSeasons.push({range:`${c.start}~${c.end}`,winner:r[0].name,score:r[0].val});const ns=prompt("새시작",getTodayDate()),ne=prompt("새종료","2026-12-31");appData.period={start:ns,end:ne};saveData().then(()=>alert("시즌 마감됨!"));};

window.toggleStep=(i,s)=>{
    const item=appData[myName].resolution[i];
    const today = getTodayDate();
    
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

    if(!appData[myName].history) appData[myName].history={};
    
    let d=0;
    appData[myName].resolution.forEach(r => {
        r.done.forEach(x => {
            if(x === today) d++;
        });
    });
    appData[myName].history[today]=d;
    
    saveData();
};

window.deleteItem=(i)=>{if(confirm("삭제?")){appData[myName].resolution.splice(i,1);saveData();}};
window.editItem=(i)=>{const item=appData[myName].resolution[i],n=prompt("수정:",item.text);if(n){item.text=n;saveData();}};

function renderResolutionList(){
    const l=document.getElementById('list-resolution');
    l.innerHTML="";
    const today = getTodayDate();

    (appData[myName].resolution||[]).forEach((x,i)=>{
        const s=x.steps.map((st,si)=> {
            const isDoneToday = (x.done[si] === today);
            return `<span class="step-item ${isDoneToday?'done':''}" onclick="window.toggleStep(${i},${si})">${st}</span>`;
        }).join('');
        
        l.innerHTML+=`<li class="resolution-item"><div class="res-left"><div class="res-text" onclick="window.editItem(${i})">${x.text}</div><div class="steps">${s}</div></div><button class="del-icon-btn" onclick="window.deleteItem(${i})"><i class="fas fa-trash-alt"></i></button></li>`
    });
}

function renderMessages(){const l=document.getElementById('msg-list');l.innerHTML="";[...(appData.messages||[])].reverse().forEach(m=>l.innerHTML+=`<li><b>${m.sender}:</b> ${m.text}</li>`);}

window.showBibleBooks=(t)=>{
    bibleState.currentTestament=t;
    document.getElementById('bible-main-view').classList.add('hidden-view');
    document.getElementById('bible-books-view').classList.remove('hidden-view');
    const g=document.getElementById('bible-books-grid');
    g.innerHTML="";
    
    BIBLE_DATA.books.filter(b=>b.testament===t).forEach(b=>{
        const d=document.createElement('div');
        d.className="bible-btn";
        
        let c=0;
        const y=new Date().getFullYear().toString();
        for(let i=1;i<=b.chapters;i++){
            const k=`${b.name}-${i}`,dt=appData[myName].bible&&appData[myName].bible[k];
            if(dt&&dt.startsWith(y))c++;
        }
        if(c>=b.chapters) d.classList.add('completed');

        const round = (appData[myName].bibleRounds && appData[myName].bibleRounds[b.name]) || 0;
        let html = `<div>${b.name}</div>`;
        
        if(round > 0) {
            html += `<div class="round-badge" onclick="event.stopPropagation(); window.updateRoundCount('${b.name}')" style="font-size:0.75rem; color:#166534; font-weight:bold; margin-top:2px; background:#dcfce7; padding:2px 6px; border-radius:8px;">🔄 ${round+1}독 도전</div>`;
        } else {
            html += `<div style="font-size:0.7rem; color:#94a3b8;">${b.chapters}장</div>`;
        }
        
        d.innerHTML = html;
        d.onclick=()=>showChapters(b);
        g.appendChild(d);
    });
};

window.updateRoundCount = function(bookName) {
    const current = (appData[myName].bibleRounds && appData[myName].bibleRounds[bookName]) || 0;
    const input = prompt(`'${bookName}' 완독 횟수를 수정합니다.\n(현재 ${current}회 완료 상태)\n\n원하는 횟수(완료한 횟수)를 입력하세요.\n예: 1회독 완료 후 2회독 중이라면 '1' 입력`, current);
    
    if(input === null) return;
    const num = parseInt(input);
    if(isNaN(num) || num < 0) {
        alert("올바른 숫자를 입력해주세요.");
        return;
    }

    if(!appData[myName].bibleRounds) appData[myName].bibleRounds = {};
    
    if(num === 0) {
        delete appData[myName].bibleRounds[bookName];
    } else {
        appData[myName].bibleRounds[bookName] = num;
    }
    
    saveData().then(() => {
        alert("수정되었습니다.");
        showBibleBooks(bibleState.currentTestament);
    });
};

function showChapters(b){
    bibleState.currentBook=b.name;
    document.getElementById('bible-books-view').classList.add('hidden-view');
    document.getElementById('bible-chapters-view').classList.remove('hidden-view');
    document.getElementById('bible-book-title').innerText=b.name;
    
    const tools = document.querySelector('.chapter-tools');
    tools.innerHTML = `
        <button class="text-btn" onclick="window.toggleRangeMode()" id="btn-range" style="color:#4f46e5; margin-right:5px;">⚡️범위선택</button>
        <button class="text-btn" onclick="window.controlAll(true)">전체선택</button>
        <button class="text-btn" onclick="window.controlAll(false)" style="color:#64748b;">체크비움</button> 
    `;
    rangeStart = null; 
    renderChaptersGrid();
    
    const existingUndoBtn = document.getElementById('btn-undo-finish');
    if(existingUndoBtn) existingUndoBtn.remove(); 

    const existingResetBtn = document.getElementById('btn-reset-book');
    if(existingResetBtn) existingResetBtn.remove();

    const resetBtn = document.createElement('button');
    resetBtn.id = "btn-reset-book"; 
    resetBtn.className = "text-btn";
    resetBtn.style.cssText = "display:block; width:100%; color:white; background:#ef4444; margin-top:30px; margin-bottom:10px; font-weight:bold; font-size:0.9rem; padding:15px; border-radius:12px;";
    resetBtn.innerText = `🗑️ 이 책 기록 초기화 (0부터 다시)`;
    resetBtn.onclick = window.resetBookHistory;
    document.getElementById('bible-chapters-grid').after(resetBtn); 

    const round = (appData[myName].bibleRounds && appData[myName].bibleRounds[b]) || 0;
    if(round > 0) {
        const undoBtn = document.createElement('button');
        undoBtn.id = "btn-undo-finish";
        undoBtn.className = "text-btn";
        undoBtn.style.cssText = "display:block; width:100%; color:#ef4444; margin-bottom:10px; font-weight:bold; font-size:0.9rem; padding:10px; border:1px solid #fee2e2; border-radius:10px; background:#fef2f2;";
        undoBtn.innerText = `🚫 완독 기록 취소 (현재 ${round}회 → ${round-1}회)`;
        undoBtn.onclick = window.undoFinishBook;
        document.getElementById('btn-finish-book').before(undoBtn);
    }
}

window.resetBookHistory = function() {
    const b = bibleState.currentBook;
    if(!confirm(`⚠️ 정말로 '${b}'의 모든 기록을 삭제하시겠습니까?\n\n- 읽은 날짜, 횟수, 점수가 모두 사라집니다.\n- 되돌릴 수 없습니다.`)) return;
    
    if(appData[myName].bible) {
        Object.keys(appData[myName].bible).forEach(key => {
            if(key.startsWith(b + "-")) {
                delete appData[myName].bible[key];
            }
        });
    }

    if(appData[myName].bibleLog) {
        appData[myName].bibleLog = appData[myName].bibleLog.filter(entry => !entry.key.startsWith(b + "-"));
    }

    if(appData[myName].bibleRounds && appData[myName].bibleRounds[b]) {
        delete appData[myName].bibleRounds[b];
    }

    saveData().then(() => {
        alert(`${b} 기록이 초기화되었습니다.`);
        showChapters(b); 
        updateBibleStats();
    });
};

window.undoFinishBook = function() {
    const b = bibleState.currentBook;
    if(!confirm(`'${b}' 완독 기록을 1회 차감하시겠습니까?\n(읽음 횟수와 점수만 수정됩니다)`)) return;
    
    if(appData[myName].bibleRounds && appData[myName].bibleRounds[b] > 0) {
        appData[myName].bibleRounds[b]--;
        if(appData[myName].bibleRounds[b] === 0) delete appData[myName].bibleRounds[b];
        saveData().then(() => {
            alert("수정되었습니다.");
            showChapters(b); 
            updateBibleStats();
        });
    }
};

window.toggleRangeMode = function() {
    if(rangeStart === null) {
        rangeStart = -1; 
        alert("시작할 장을 누르고, 끝날 장을 누르면 사이가 모두 체크됩니다.");
        document.getElementById('btn-range').style.fontWeight = "bold";
        document.getElementById('btn-range').innerText = "⚡️선택중...";
    } else {
        rangeStart = null;
        document.getElementById('btn-range').style.fontWeight = "normal";
        document.getElementById('btn-range').innerText = "⚡️범위선택";
        renderChaptersGrid();
    }
};

function renderChaptersGrid(){const b=BIBLE_DATA.books.find(x=>x.name===bibleState.currentBook),g=document.getElementById('bible-chapters-grid'),y=new Date().getFullYear().toString();g.innerHTML="";let all=true;for(let i=1;i<=b.chapters;i++){const d=document.createElement('div');d.className="chapter-item";const k=`${b.name}-${i}`,dt=appData[myName].bible&&appData[myName].bible[k],r=dt&&dt.startsWith(y);if(r)d.classList.add('checked');else all=false;d.innerText=i;
    if(rangeStart && rangeStart > 0 && i === rangeStart) d.classList.add('range-start');
    d.onclick=()=>window.toggleChapter(i, k, !r); g.appendChild(d);}const btn=document.getElementById('btn-finish-book');if(all){btn.classList.remove('disabled');btn.innerText="완독하기 🎉";}else{btn.classList.add('disabled');btn.innerText="모두 읽어야 완독 가능";}
}

window.toggleChapter=(chapNum, k, c)=>{
    if(!appData[myName].bible)appData[myName].bible={};
    if(!appData[myName].bibleLog)appData[myName].bibleLog=[];
    const today = getTodayDate();
    if(rangeStart !== null) {
        if(rangeStart === -1) {
            rangeStart = chapNum;
            renderChaptersGrid();
        } else {
            const start = Math.min(rangeStart, chapNum);
            const end = Math.max(rangeStart, chapNum);
            const bName = bibleState.currentBook;
            for(let i=start; i<=end; i++) {
                const key = `${bName}-${i}`;
                if(!appData[myName].bible[key]) {
                    appData[myName].bible[key] = today;
                    appData[myName].bibleLog.push({ date: today, key: key });
                }
            }
            saveData().then(() => {
                rangeStart = null;
                document.getElementById('btn-range').style.fontWeight = "normal";
                document.getElementById('btn-range').innerText = "⚡️범위선택";
                renderChaptersGrid();
                updateBibleStats();
            });
        }
        return;
    }
    if(c) {
        appData[myName].bible[k] = today; 
        appData[myName].bibleLog.push({ date: today, key: k });
    } else {
        delete appData[myName].bible[k];
        const idx = appData[myName].bibleLog.findIndex(x => x.key === k && x.date === today);
        if(idx > -1) appData[myName].bibleLog.splice(idx, 1);
    }
    saveData().then(()=>{renderChaptersGrid(); updateBibleStats();});
};

window.controlAll=(on)=>{
    const b=BIBLE_DATA.books.find(x=>x.name===bibleState.currentBook);
    const today=getTodayDate();
    
    if(!on) {
        if(!confirm("⚠️ 경고 ⚠️\n체크를 비우면 '오늘 읽은 기록'도 함께 삭제됩니다.\n\n단순히 n회독을 위해 비우려는 거라면,\n이 버튼 말고 '완독하기' 버튼을 누르거나\n그냥 다시 '전체선택'을 누르세요.\n\n정말 기록을 지우시겠습니까?")) return;
    }

    if(!appData[myName].bible)appData[myName].bible={};
    if(!appData[myName].bibleLog)appData[myName].bibleLog=[];
    
    for(let i=1;i<=b.chapters;i++){
        const k=`${b.name}-${i}`;
        if(on){
            if(!appData[myName].bible[k]){
                appData[myName].bible[k]=today;
                appData[myName].bibleLog.push({date:today,key:k});
            }
        }else{
            if(appData[myName].bible[k]){
                delete appData[myName].bible[k];
                const idx=appData[myName].bibleLog.findIndex(x=>x.key===k&&x.date===today);
                if(idx>-1)appData[myName].bibleLog.splice(idx,1);
            }
        }
    }
    saveData().then(()=>{renderChaptersGrid(); updateBibleStats();});
};

window.finishBookAndReset=()=>{if(document.getElementById('btn-finish-book').classList.contains('disabled'))return;if(confirm("완독 처리 하시겠습니까?\n체크박스는 초기화되지만, 읽은 기록은 유지됩니다.")){const b=bibleState.currentBook;if(!appData[myName].bibleRounds)appData[myName].bibleRounds={};appData[myName].bibleRounds[b]=(appData[myName].bibleRounds[b]||0)+1;const bookData=BIBLE_DATA.books.find(x=>x.name===b);for(let i=1;i<=bookData.chapters;i++){delete appData[myName].bible[`${b}-${i}`];}saveData().then(()=>{renderChaptersGrid(); updateBibleStats();});}};
window.backToBooks=()=>{document.getElementById('bible-chapters-view').classList.add('hidden-view');document.getElementById('bible-books-view').classList.remove('hidden-view');};
window.showBibleMain=()=>{document.getElementById('bible-books-view').classList.add('hidden-view');document.getElementById('bible-main-view').classList.remove('hidden-view');};
window.goTab=(t,b)=>{document.querySelectorAll('.nav-item').forEach(e=>e.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.page').forEach(e=>e.classList.add('hidden'));document.getElementById('page-'+t).classList.remove('hidden');if(t==='stats')renderDashboard();if(t==='bible')updateBibleStats();};

async function saveData(){try{await setDoc(docRef,appData,{merge:true});updateMainUI();}catch(e){console.error(e);}}
function initNewData(){const y=new Date().getFullYear();appData={auth:{},messages:[],period:{start:`${y}-01-01`,end:`${y}-12-31`}};saveData();}
function updateBibleStats() {const today = getTodayDate();const yearStr = today.split('-')[0];const log = appData[myName].bibleLog || [];let todayCnt = 0;let yearCnt = 0;log.forEach(entry => {if(entry.date === today) todayCnt++;if(entry.date.startsWith(yearStr)) yearCnt++;});document.getElementById('bible-today-count').innerText = `+${todayCnt}장`;document.getElementById('bible-year-count').innerText = `${yearCnt}장`;}

startApp();
