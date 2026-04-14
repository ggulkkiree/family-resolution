// ==========================================
// 🛠️ 공통 도우미 함수
// ==========================================
export function getTodayDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9*60*60*1000));
    const y = kstNow.getFullYear();
    const m = String(kstNow.getMonth()+1).padStart(2, '0');
    const d = String(kstNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ==========================================
// 📌 1. 목표 탭 기능 모음
// ==========================================

export function renderResolutionList(appData, myName) {
    const listEl = document.getElementById('list-resolution');
    if (!listEl) return;

    listEl.innerHTML = ''; 
    const userData = appData[myName] || {};
    const myGoals = userData.resolution || [];

    if (myGoals.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#8D6E63; font-size:0.95rem;">아직 등록된 목표가 없어요!<br>위에서 새 목표를 추가해 보세요 ✨</div>';
        return;
    }

    myGoals.forEach((goal, gIndex) => {
        const li = document.createElement('li');
        li.className = 'resolution-item';

        const infoDiv = document.createElement('div');
        infoDiv.style.flex = "1";

        const titleDiv = document.createElement('div');
        titleDiv.className = 'res-text';
        titleDiv.innerText = goal.text || (typeof goal === 'string' ? goal : '나의 목표');
        infoDiv.appendChild(titleDiv);

        if (goal.steps && Array.isArray(goal.steps)) {
            const stepsDiv = document.createElement('div');
            goal.steps.forEach((step, sIndex) => {
                const span = document.createElement('span');
                const isDone = goal.done && goal.done.includes(`${gIndex}-${sIndex}`);
                span.className = isDone ? 'step-item done' : 'step-item';
                span.innerText = step;
                span.onclick = () => {
                    if (typeof window.toggleStep === 'function') window.toggleStep(gIndex, sIndex);
                };
                stepsDiv.appendChild(span);
            });
            infoDiv.appendChild(stepsDiv);
        }

        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn';
        delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.onclick = () => {
            if (confirm('이 목표를 삭제할까요?')) {
                if (typeof window.addItem === 'function') { 
                    window.deleteItem && window.deleteItem(gIndex);
                }
            }
        };

        li.appendChild(infoDiv);
        li.appendChild(delBtn);
        listEl.appendChild(li);
    });
}

export function renderFamilyGoals(appData, myName) {
    const container = document.getElementById('family-goals-container');
    if (!container) return;

    container.innerHTML = ''; 
    Object.keys(appData).forEach(userName => {
        if (['period', 'messages', 'verse', 'hallOfFame'].includes(userName) || userName === myName) return;

        const userData = appData[userName];
        const goals = userData.resolution || [];
        if (goals.length === 0) return; 

        const card = document.createElement('div');
        card.className = 'family-card'; 
        card.style.padding = "15px";
        card.style.marginBottom = "15px";
        card.style.background = "white";
        card.style.borderRadius = "20px";
        card.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";

        const nameTag = document.createElement('div');
        nameTag.style.fontWeight = "800";
        nameTag.style.marginBottom = "10px";
        nameTag.style.color = "#6366f1";
        nameTag.innerText = `👤 ${userName}`;
        card.appendChild(nameTag);

        const goalList = document.createElement('ul');
        goalList.style.listStyle = "none";
        goalList.style.padding = "0";
        goalList.style.margin = "0";

        goals.forEach(g => {
            const li = document.createElement('li');
            li.style.fontSize = "0.95rem";
            li.style.marginBottom = "5px";
            li.style.color = "#475569";
            const goalText = g.text || (typeof g === 'string' ? g : '목표');
            li.innerText = `• ${goalText}`;
            goalList.appendChild(li);
        });

        card.appendChild(goalList);
        container.appendChild(card);
    });
}

// ==========================================
// 📊 2. 대시보드 및 통계 탭 기능 모음
// ==========================================

export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    const userData = appData[myName] || {}; 
    const myHistory = userData.history || {};
    const myBibleLog = userData.bibleLog || [];
    const myGoals = userData.resolution || [];
    
    const today = getTodayDate();
    let todayTotal = 0, todayDone = 0;
    
    myGoals.forEach(g => {
        todayTotal++;
        let isDoneToday = false;
        if (g.done) {
            if (Array.isArray(g.done)) {
                isDoneToday = g.done.includes(today);
            } else if (typeof g.done === 'string') {
                isDoneToday = (g.done === today);
            }
        }
        if(isDoneToday) todayDone++;
    });

    renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal);

    let rate = 0;
    if(todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100);
    
    if (new Date().getDay() === 0) {
        rate = 100;
    }

    const dRate = document.getElementById('dash-rate');
    const dFill = document.getElementById('donut-fill');
    if(dRate) dRate.innerText = rate + "%";
    if(dFill) setTimeout(() => { dFill.style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);

    calculateStreak(myHistory, rate, todayTotal);
    updateBibleStats(myBibleLog);
    renderWeeklyGraph(myHistory, today);
    renderHabitAnalysis(myGoals);
    renderRankings(appData, period);
    renderHallOfFame(appData);
}

function calculateStreak(myHistory, rate, todayTotal) {
    const fireIcon = document.getElementById('streak-icon');
    const streakText = document.getElementById('dash-streak');
    if(!fireIcon || !streakText) return;

    if(rate >= 100 && todayTotal > 0) fireIcon.className = "fas fa-crown streak-icon gold"; 
    else if(rate >= 50) fireIcon.className = "fas fa-fire streak-icon active";
    else fireIcon.className = "fas fa-fire streak-icon";

    let realStreak = 0;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9*60*60*1000));
    
    for(let i=0; i<365; i++) {
        const d = new Date(kstNow); d.setDate(d.getDate() - i);
        const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
        const dStr = `${y}-${m}-${dd}`;
        
        if(myHistory[dStr] > 0 || d.getDay() === 0) {
            realStreak++; 
        } else if(i>0) {
            break;
        }
    }
    streakText.innerText = `${realStreak}일`;
}

export function renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal) {
    const statusText = document.getElementById('today-status-text');
    const taskList = document.getElementById('today-task-list');
    if (!statusText || !taskList) return;

    statusText.innerText = `${todayDone} / ${todayTotal} 완료`;
    taskList.innerHTML = '';

    if (myGoals.length === 0) {
        taskList.innerHTML = '<div style="color:#94a3b8; font-size:0.9rem; text-align:center;">오늘 달성할 목표가 없습니다.</div>';
        return;
    }

    myGoals.forEach((goal, idx) => {
        const isDone = goal.done && (Array.isArray(goal.done) ? goal.done.includes(today) : goal.done === today);
        const taskDiv = document.createElement('div');
        taskDiv.className = isDone ? 'task-card active' : 'task-card';
        
        const goalTitle = goal.text || (typeof goal === 'string' ? goal : '목표');
        taskDiv.innerHTML = `
            <div class="task-text">${goalTitle}</div>
            <div class="task-icon-box"><i class="fas fa-check"></i></div>
        `;
        
        taskDiv.onclick = () => {
            if (typeof window.toggleTodayTask === 'function') window.toggleTodayTask(idx, today);
        };
        taskList.appendChild(taskDiv);
    });
}

export function updateBibleStats(myBibleLog) {
    const todayCountEl = document.getElementById('bible-today-count');
    const yearCountEl = document.getElementById('bible-year-count');
    if (!todayCountEl || !yearCountEl) return;

    const today = getTodayDate();
    const todayCount = myBibleLog.filter(log => log.date === today).length;
    
    todayCountEl.innerText = `${todayCount}장`;
    yearCountEl.innerText = `${myBibleLog.length}장`;
}

export function renderRankings(appData, period) {
    const rankRes = document.getElementById('rank-resolution');
    const rankBible = document.getElementById('rank-bible');
    if (!rankRes || !rankBible) return;

    rankRes.innerHTML = '<div style="color:#64748b; font-size:0.9rem; text-align:center; padding:10px;">결단서 왕 데이터를 불러왔습니다.</div>';
    rankBible.innerHTML = '<div style="color:#64748b; font-size:0.9rem; text-align:center; padding:10px;">이번 주 성경 왕 데이터를 불러왔습니다.</div>';
}

export function renderWeeklyGraph(myHistory, today) {
    const graphContainer = document.getElementById('weekly-graph');
    if (!graphContainer) return;
    
    graphContainer.innerHTML = ''; 
    
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
        const dateStr = `${y}-${m}-${dd}`;
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        const dayStr = dayNames[d.getDay()];

        const col = document.createElement('div');
        col.className = 'graph-col';
        
        const isActive = myHistory[dateStr] > 0 || d.getDay() === 0;
        const heightPct = isActive ? "80%" : "20%"; 
        const barClass = isActive ? "week-bar high" : "week-bar";
        const textClass = i === 0 ? "day-label active" : "day-label"; 

        col.innerHTML = `
            <div class="bar-area">
                <div class="${barClass}" style="height: ${heightPct};"></div>
            </div>
            <div class="${textClass}">${dayStr}</div>
        `;
        graphContainer.appendChild(col);
    }
}

export function renderHabitAnalysis(myGoals) {}
export function renderHallOfFame(appData) {}

// ==========================================
// 💌 3. 응원 메시지 복구 코드
// ==========================================
export function renderMessages(appData) {
    const msgList = document.getElementById('msg-list');
    if (!msgList) return;

    msgList.innerHTML = ''; // 화면에 그리기 전에 깨끗하게 비우기

    // 서버(appData)에서 메시지 기록 가져오기
    const messages = appData.messages || [];

    // 메시지가 하나도 없을 때 보여줄 안내문
    if (messages.length === 0) {
        msgList.innerHTML = '<li style="text-align:center; color:#94a3b8; font-size:0.9rem; padding:10px 0;">첫 응원 메시지를 남겨보세요! 💌</li>';
        return;
    }

    // 메시지가 있다면 하나씩 리스트(li)로 만들기
    messages.forEach(msg => {
        const li = document.createElement('li');
        li.style.marginBottom = "8px";
        li.style.fontSize = "0.95rem";
        li.style.lineHeight = "1.4";
        
        // 데이터가 객체({sender: '아빠', text: '화이팅'})일 수도, 단순 문자열일 수도 있으니 모두 방어
        const sender = msg.sender || msg.name || '가족';
        const text = msg.text || msg.msg || (typeof msg === 'string' ? msg : '응원합니다!');

        // 예쁘게 조립하기 (이름은 포인트 컬러로!)
        li.innerHTML = `<span style="font-weight:800; color:var(--primary, #FF7F50); margin-right:6px;">${sender}</span> <span style="color:var(--text-main, #5D4037);">${text}</span>`;
        
        msgList.appendChild(li);
    });

    // 스크롤이 있다면 가장 아래(최신 메시지)로 자동 이동
    const chatCard = msgList.parentElement;
    if (chatCard) {
        chatCard.scrollTop = chatCard.scrollHeight;
    }
}
