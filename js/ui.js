// 🧠 UI Renderer (성경 장 색상 완벽 표시 버전)

import { BIBLE_DATA } from './data.js';

export function getTodayDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9 * 60 * 60 * 1000));
    const y = kstNow.getFullYear();
    const m = String(kstNow.getMonth() + 1).padStart(2, '0');
    const d = String(kstNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function renderResolutionList(appData, myName) {
    const listEl = document.getElementById('list-resolution');
    if (!listEl) return;
    listEl.innerHTML = '';
    const userData = appData[myName] || {};
    const myGoals = userData.resolution || [];
    const today = getTodayDate();
    if (myGoals.length === 0) { listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#8D6E63; font-size:0.95rem;">아직 등록된 목표가 없어요!<br>위에서 새 목표를 추가해 보세요 ✨</div>'; return; }
    myGoals.forEach((goal, gIndex) => {
        const li = document.createElement('li'); li.className = 'resolution-item';
        const infoDiv = document.createElement('div'); infoDiv.style.flex = "1";
        const titleDiv = document.createElement('div'); titleDiv.className = 'res-text'; titleDiv.innerText = goal.text || (typeof goal === 'string' ? goal : '나의 목표');
        infoDiv.appendChild(titleDiv);
        if (goal.steps && Array.isArray(goal.steps)) {
            const stepsDiv = document.createElement('div');
            goal.steps.forEach((step, sIndex) => {
                const span = document.createElement('span');
                const isDone = goal.done && goal.done[sIndex] === today;
                span.className = isDone ? 'step-item done' : 'step-item';
                span.innerText = step;
                span.onclick = (e) => { e.currentTarget.classList.toggle('done'); if (typeof window.toggleStep === 'function') window.toggleStep(gIndex, sIndex); };
                stepsDiv.appendChild(span);
            });
            infoDiv.appendChild(stepsDiv);
        }
        const delBtn = document.createElement('button'); delBtn.className = 'del-btn'; delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.onclick = () => { if (confirm('이 목표를 삭제할까요?')) { if (window.deleteItem) window.deleteItem(gIndex); } };
        li.appendChild(infoDiv); li.appendChild(delBtn); listEl.appendChild(li);
    });
}

export function renderFamilyGoals(appData, myName) {
    const container = document.getElementById('family-goals-container');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(appData).forEach(userName => {
        if (['period', 'messages', 'verse', 'hallOfFame', 'auth'].includes(userName) || userName === myName) return;
        const userData = appData[userName]; const goals = userData.resolution || [];
        if (goals.length === 0) return;
        const displayName = (appData.auth && appData.auth[userName]) ? appData.auth[userName].name : userName;
        const card = document.createElement('div'); card.className = 'family-card';
        card.innerHTML = `<div style="font-weight:800; margin-bottom:10px; color:#6366f1;">👤 ${displayName}</div><ul style="list-style:none; padding:0; margin:0;">${goals.map(g => `<li style="font-size:0.95rem; margin-bottom:5px; color:#475569;">• ${g.text || g}</li>`).join('')}</ul>`;
        container.appendChild(card);
    });
}

export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display'); if (pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    const userData = appData[myName] || {}; const myHistory = userData.history || {}; const myBibleLog = userData.bibleLog || []; const myGoals = userData.resolution || [];
    const today = getTodayDate(); let todayTotal = 0, todayDone = 0;
    myGoals.forEach(g => {
        todayTotal++; let isDoneToday = false;
        if (g.done) { if (Array.isArray(g.done)) isDoneToday = g.done.includes(today); else if (typeof g.done === 'string') isDoneToday = (g.done === today); }
        if (isDoneToday) todayDone++;
    });
    renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal);
    let rate = 0; if (todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100); if (new Date().getDay() === 0) rate = 100;
    const dRate = document.getElementById('dash-rate'); const dFill = document.getElementById('donut-fill');
    if (dRate) dRate.innerText = rate + "%"; if (dFill) setTimeout(() => { dFill.style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);
    calculateStreak(myHistory, rate, todayTotal); updateBibleStats(myBibleLog); renderWeeklyGraph(myHistory, today); renderRankings(appData, period);
}

function calculateStreak(myHistory, rate, todayTotal) {
    const fireIcon = document.getElementById('streak-icon'); const streakText = document.getElementById('dash-streak');
    if (!fireIcon || !streakText) return;
    if (rate >= 100 && todayTotal > 0) fireIcon.className = "fas fa-crown streak-icon gold";
    else if (rate >= 50) fireIcon.className = "fas fa-fire streak-icon active";
    else fireIcon.className = "fas fa-fire streak-icon";
    let realStreak = 0; const now = new Date(); const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000); const kstNow = new Date(utc + (9 * 60 * 60 * 1000));
    for (let i = 0; i < 365; i++) {
        const d = new Date(kstNow); d.setDate(d.getDate() - i);
        const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${dd}`;
        if (myHistory[dStr] > 0 || d.getDay() === 0) realStreak++; else if (i > 0) break;
    }
    streakText.innerText = `${realStreak}일`;
}

export function renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal) {
    const statusText = document.getElementById('today-status-text'); const taskList = document.getElementById('today-task-list');
    if (!statusText || !taskList) return;
    statusText.innerText = `${todayDone} / ${todayTotal} 완료`; taskList.innerHTML = '';
    if (myGoals.length === 0) { taskList.innerHTML = '<div style="color:#94a3b8; font-size:0.9rem; text-align:center;">오늘 달성할 목표가 없습니다.</div>'; return; }
    myGoals.forEach((goal, idx) => {
        const isDone = goal.done && (Array.isArray(goal.done) ? goal.done.includes(today) : goal.done === today);
        const taskDiv = document.createElement('div'); taskDiv.className = isDone ? 'task-card active' : 'task-card';
        taskDiv.innerHTML = `<div class="task-text">${goal.text || goal}</div><div class="task-icon-box"><i class="fas fa-check"></i></div>`;
        taskDiv.onclick = () => { if (typeof window.toggleTodayTask === 'function') window.toggleTodayTask(idx, today); };
        taskList.appendChild(taskDiv);
    });
}

export function updateBibleStats(myBibleLog) {
    const todayCountEl = document.getElementById('bible-today-count'); const yearCountEl = document.getElementById('bible-year-count');
    if (!todayCountEl || !yearCountEl) return;
    const today = getTodayDate();
    const todayCount = myBibleLog.filter(log => log.date === today).length;
    todayCountEl.innerText = `${todayCount}장`; yearCountEl.innerText = `${myBibleLog.length}장`;
}

export function renderRankings(appData, period) {
    const rankRes = document.getElementById('rank-resolution'); const rankBible = document.getElementById('rank-bible');
    if (!rankRes || !rankBible) return; rankRes.innerHTML = ''; rankBible.innerHTML = '';
    let resScores = []; let bibleScores = [];
    const now = new Date(); const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(now.setDate(diff)); monday.setHours(0, 0, 0, 0);
    const seasonStartDateStr = (period && period.start) ? period.start : "2026-01-01"; const seasonStart = new Date(seasonStartDateStr); seasonStart.setHours(0, 0, 0, 0);
    Object.keys(appData).forEach(userName => {
        if (['period', 'messages', 'verse', 'hallOfFame', 'auth'].includes(userName)) return;
        const userData = appData[userName]; const displayName = (appData.auth && appData.auth[userName]) ? appData.auth[userName].name : userName;
        let resScore = 0; if (userData.history) { Object.entries(userData.history).forEach(([dateStr, val]) => { const recordDate = new Date(dateStr); if (recordDate >= seasonStart) resScore += Number(val); }); }
        resScores.push({ name: displayName, score: resScore });
        let bibleScore = 0; if (userData.bibleLog) { userData.bibleLog.forEach(log => { const logDate = new Date(log.date); if (logDate >= monday) bibleScore++; }); }
        bibleScores.push({ name: displayName, score: bibleScore });
    });
    const drawList = (container, sortedData, unit) => {
        sortedData.sort((a, b) => b.score - a.score).slice(0, 3).forEach((data, idx) => {
            if (data.score === 0) return;
            const row = document.createElement('div'); row.className = idx === 0 ? 'rank-row top-rank' : 'rank-row';
            const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉');
            row.innerHTML = `<span>${medal} ${data.name}</span> <span style="font-weight:700;">${data.score}${unit}</span>`;
            container.appendChild(row);
        });
        if (container.innerHTML === '') container.innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; text-align:center;">기록 없음</div>';
    };
    drawList(rankRes, resScores, '번'); drawList(rankBible, bibleScores, '장');
}

export function renderWeeklyGraph(myHistory, today) {
    const graphContainer = document.getElementById('weekly-graph'); if (!graphContainer) return; graphContainer.innerHTML = '';
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dd}`; const isActive = myHistory[dateStr] > 0 || d.getDay() === 0;
        const col = document.createElement('div'); col.className = 'graph-col';
        col.innerHTML = `<div class="bar-area"><div class="week-bar ${isActive ? 'high' : ''}" style="height: ${isActive ? '80%' : '20%'}"></div></div><div class="day-label ${i === 0 ? 'active' : ''}">${dayNames[d.getDay()]}</div>`;
        graphContainer.appendChild(col);
    }
}

export function renderMessages(appData) {
    const msgList = document.getElementById('msg-list'); if (!msgList) return; msgList.innerHTML = ''; const messages = appData.messages || [];
    if (messages.length === 0) { msgList.innerHTML = '<li style="text-align:center; color:#94a3b8; font-size:0.9rem; padding:10px 0;">첫 응원 메시지를 남겨보세요! 💌</li>'; return; }
    messages.forEach(msg => { const li = document.createElement('li'); li.style.marginBottom = "8px"; li.innerHTML = `<span style="font-weight:800; color:#6366f1; margin-right:6px;">${msg.sender}</span> <span>${msg.text}</span>`; msgList.appendChild(li); });
    msgList.parentElement.scrollTop = msgList.parentElement.scrollHeight;
}

// ==========================================
// 📖 4. 성경 탭 - 클릭 시 색상이 칠해지도록 완벽 보완!
// ==========================================
export function renderBibleBooks(appData, myName, bibleState) {
    const grid = document.getElementById('bible-books-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const books = BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament);

    books.forEach(book => {
        const btn = document.createElement('button');
        btn.className = 'bible-book-btn';
        btn.innerHTML = `
            <div class="book-nm" style="font-weight:700;">${book.name}</div>
            <div class="book-info" style="font-size:0.8rem; opacity:0.7;">${book.chapters}장</div>
        `;
        btn.onclick = () => window.showChapters(book.name);
        grid.appendChild(btn);
    });
}

export function renderChaptersGrid(appData, myName, bibleState, rangeStart) {
    const grid = document.getElementById('bible-chapters-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const bookName = bibleState.currentBook;
    const bookObj = BIBLE_DATA.books.find(b => b.name === bookName);
    if (!bookObj) return;

    const myBible = (appData[myName] && appData[myName].bible) || {};

    for (let i = 1; i <= bookObj.chapters; i++) {
        const key = `${bookName}-${i}`;
        const isDone = !!myBible[key];
        
        const cell = document.createElement('div');
        cell.innerText = i;
        cell.className = 'chapter-cell';

        // 💡 CSS 파일 설정과 무관하게, 코드가 직접 예쁜 보라색 버튼으로 만들어 줍니다!
        if (isDone) {
            cell.style.backgroundColor = '#6366f1'; // 예쁜 남색/보라색
            cell.style.color = '#ffffff';
            cell.style.fontWeight = 'bold';
            cell.style.borderRadius = '8px'; // 동글동글하게
        } else {
            cell.style.backgroundColor = 'transparent';
            cell.style.color = '#334155';
            cell.style.fontWeight = 'normal';
        }

        // 범위 선택 시작점 시각 효과
        if (rangeStart !== null && rangeStart !== -1 && i === rangeStart) {
            cell.style.backgroundColor = '#fca5a5'; // 살짝 붉은색
            cell.style.color = 'white';
            cell.style.borderRadius = '8px';
        }

        cell.style.cursor = 'pointer';
        cell.style.padding = '10px 0'; // 터치하기 편하게 
        cell.style.textAlign = 'center';

        cell.onclick = () => window.toggleChapter(i, key, !isDone);
        grid.appendChild(cell);
    }
}
