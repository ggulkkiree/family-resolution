// 🎨 UI (화면 그리기) - Bible Stat Fix Ver.

import { BIBLE_DATA, USER_SLOTS } from './data.js';

export function getTodayDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstDiff = 9 * 60 * 60 * 1000;
    const kstDate = new Date(utc + kstDiff);
    const y = kstDate.getFullYear();
    const m = String(kstDate.getMonth() + 1).padStart(2, '0');
    const dd = String(kstDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

export function getWeeklyRange(){
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstDiff = 9 * 60 * 60 * 1000;
    const kstNow = new Date(utc + kstDiff);
    const day = kstNow.getDay();
    const offset = (day + 1) % 7; 
    const s = new Date(kstNow); s.setDate(kstNow.getDate() - offset);
    const e = new Date(s); e.setDate(s.getDate() + 6);
    const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };
    return { start: fmt(s), end: fmt(e) };
}

export function renderRankings(appData, p){
    const u = USER_SLOTS.filter(x => appData.auth && appData.auth[x]);
    const r = document.getElementById('rank-resolution');
    
    const sortedRes = u.map(x => {
        const h = appData[x].history || {};
        const s = Object.keys(h).filter(d => d >= p.start && d <= p.end).reduce((a, b) => a + h[b], 0);
        return { name: appData.auth[x].name, val: s };
    }).sort((a, b) => b.val - a.val);

    if(r) {
        if(sortedRes.length === 0) r.innerHTML = `<div style="text-align:center; padding:10px; color:#ccc; font-size:0.8rem;">아직 기록이 없습니다.</div>`;
        else {
            r.innerHTML = sortedRes.map((x, i) => {
                let rankBadge = `<span class="rank-num">${i+1}</span>`;
                if(i === 0) rankBadge = `🥇`; if(i === 1) rankBadge = `🥈`; if(i === 2) rankBadge = `🥉`;
                const highlightClass = i === 0 ? 'top-rank' : '';
                return `<div class="rank-row ${highlightClass}"><div class="rank-left">${rankBadge} <span class="rank-name">${x.name}</span></div><div class="rank-score">${x.val}점</div></div>`;
            }).join('');
        }
    }

    const w = getWeeklyRange();
    const b = document.getElementById('rank-bible');
    const sortedBible = u.map(x => {
        const log = appData[x].bibleLog || [];
        const c = log.filter(entry => entry.date >= w.start && entry.date <= w.end).length;
        return { name: appData.auth[x].name, val: c };
    }).sort((a, b) => b.val - a.val);

    if(b) {
        if(sortedBible.length === 0) b.innerHTML = `<div style="text-align:center; padding:10px; color:#ccc; font-size:0.8rem;">아직 기록이 없습니다.</div>`;
        else {
            b.innerHTML = sortedBible.map((x, i) => {
                let rankBadge = `<span class="rank-num">${i+1}</span>`;
                if(i === 0) rankBadge = `🥇`; if(i === 1) rankBadge = `🥈`; if(i === 2) rankBadge = `🥉`;
                const highlightClass = i === 0 ? 'top-rank' : '';
                return `<div class="rank-row ${highlightClass}"><div class="rank-left">${rankBadge} <span class="rank-name">${x.name}</span></div><div class="rank-score">${x.val}장</div></div>`;
            }).join('');
        }
    }
}

export function renderResolutionList(appData, myName) {
    const l = document.getElementById('list-resolution');
    if(!l) return;
    l.innerHTML = "";
    const today = getTodayDate();
    const list = appData[myName].resolution || [];
    
    if(list.length === 0) {
        l.innerHTML = `<div class="empty-state"><span class="empty-icon">📝</span><p>등록된 목표가 없습니다.<br>상단 입력창에서 목표를 추가해보세요!</p></div>`;
        return;
    }

    list.forEach((x, i) => {
        const s = x.steps.map((st, si) => {
            const isDoneToday = (x.done[si] === today);
            return `<span class="step-item ${isDoneToday?'done':''}" onclick="window.toggleStep(${i},${si})">${st}</span>`;
        }).join('');
        l.innerHTML += `<li class="resolution-item"><div class="res-content"><div class="res-text" onclick="window.editItem(${i})">${x.text}</div><div class="steps">${s}</div></div><button class="del-btn" onclick="window.deleteItem(${i})"><i class="fas fa-trash-alt"></i></button></li>`;
    });
}

export function renderFamilyGoals(appData, myName) {
    const container = document.getElementById('family-goals-container');
    if(!container) return;
    container.innerHTML = "";

    USER_SLOTS.forEach((slot, idx) => {
        if(slot === myName) return;
        if(!appData.auth[slot]) return;
        const user = appData.auth[slot];
        const goals = appData[slot].resolution || [];
        const total = goals.length;

        let html = `<div class="family-card accordion-card"><div class="accordion-header" onclick="window.toggleFamilyList('fam-list-${idx}')"><span class="family-name">${user.name}</span><span class="family-badge">${total}개</span></div><ul id="fam-list-${idx}" class="family-goal-list hidden">`;
        if(total === 0) html += `<li class="empty-msg-small">목표 없음</li>`;
        else goals.forEach(g => html += `<li><span class="dot">•</span> ${g.text}</li>`);
        html += `</ul></div>`;
        container.innerHTML += html;
    });
}

export function renderMessages(appData) {
    const l = document.getElementById('msg-list');
    if(!l) return;
    l.innerHTML = "";
    const msgs = [...(appData.messages || [])].reverse();
    if(msgs.length === 0) { 
        l.innerHTML = `<div style="text-align:center; padding:20px; color:#ccc;"><i class="far fa-comment-dots" style="font-size:2rem; margin-bottom:5px;"></i><br>첫 응원을 남겨보세요!</div>`; 
        return; 
    }
    msgs.forEach(m => l.innerHTML += `<li><b class="sender-name">${m.sender}</b> ${m.text}</li>`);
}

export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    const myHistory = appData[myName].history || {};
    // [중요 수정] 현재 체크된 성경이 아니라, '누적 기록부(bibleLog)'를 가져옵니다.
    const myBibleLog = appData[myName].bibleLog || [];
    const today = getTodayDate();
    const myGoals = appData[myName].resolution || [];
    
    let todayTotal = 0, todayDone = 0;
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        todayTotal++;
        if(isDoneToday) todayDone++;
    });

    renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal);

    let rate = 0;
    if(todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100);
    const dRate = document.getElementById('dash-rate');
    const dFill = document.getElementById('donut-fill');
    if(dRate) dRate.innerText = rate + "%";
    if(dFill) setTimeout(() => { dFill.style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);

    calculateStreak(myHistory, rate, todayTotal);
    
    // [중요 수정] 역사 기록부(bibleLog)를 통계 함수에 넘겨줍니다.
    updateBibleStats(myBibleLog);
    
    renderWeeklyGraph(myHistory, today);
    renderHabitAnalysis(myGoals);
    renderRankings(appData, period);
    renderHallOfFame(appData);
}

function renderTodayTasksAccordion(myGoals, today, doneCount, totalCount) {
    const listContainer = document.getElementById('today-task-list');
    if(!listContainer) return;
    const statusText = document.getElementById('today-status-text');
    if(statusText) statusText.innerHTML = `${doneCount}/${totalCount}`;

    if(myGoals.length === 0) { 
        listContainer.innerHTML = `<div class="empty-state" style="padding:20px;"><span class="empty-icon" style="font-size:2rem;">📅</span><br>목표를 설정하면 여기에 나타납니다.</div>`;
        return; 
    }
    let html = '';
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        html += `<div class="task-card ${isDoneToday?'active':''}"><span class="task-text">${g.text}</span><div class="task-icon-box">${isDoneToday?'<i class="fas fa-check"></i>':'<i class="fas fa-circle" style="opacity:0.1"></i>'}</div></div>`;
    });
    listContainer.innerHTML = html;
}

function renderHabitAnalysis(myGoals) {
    let container = document.getElementById('habit-analysis-card');
    if(!container) {
        const graphCard = document.querySelector('.weekly-graph').closest('.dash-card');
        container = document.createElement('div');
        container.id = 'habit-analysis-card';
        if(graphCard) graphCard.parentNode.insertBefore(container, graphCard); 
        else return;
    }
    const analysis = myGoals.map(g => ({ text: g.text, count: (g.counts || []).reduce((a, b) => a + b, 0) })).sort((a, b) => b.count - a.count);
    const maxVal = Math.max(...analysis.map(a => a.count)) || 1;
    let html = `<div class="dash-card"><div class="accordion-header" onclick="window.toggleAccordion('habit-acc', this.querySelector('.accordion-icon'))"><span class="card-title">📊 목표별 성실도</span><i class="fas fa-chevron-down accordion-icon"></i></div><div id="habit-acc" class="accordion-content hidden">`;
    if(analysis.length === 0) { html += `<div class="empty-msg-small">데이터 없음</div>`; } 
    else {
        analysis.forEach(item => {
            const width = (item.count / maxVal) * 100;
            const color = width > 70 ? 'var(--success)' : (width > 30 ? '#fbbf24' : '#ef4444');
            html += `<div class="habit-row"><div class="habit-info"><span class="habit-name">${item.text}</span><span class="habit-count" style="color:${color}">${item.count}회</span></div><div class="habit-track"><div class="habit-bar" style="width:${width}%; background:${color};"></div></div></div>`;
        });
    }
    html += `</div></div>`;
    container.innerHTML = html;
}

function renderWeeklyGraph(myHistory, today) {
    const weekGraph = document.getElementById('weekly-graph');
    if(!weekGraph) return;
    weekGraph.innerHTML = "";
    
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9*60*60*1000));
    const dayOfWeek = kstNow.getDay();
    const offset = (dayOfWeek + 1) % 7; 
    const saturdayStart = new Date(kstNow); saturdayStart.setDate(kstNow.getDate() - offset);
    
    const dayNames = ['일','월','화','수','목','금','토'];
    let maxCount = 0;
    const weekData = [];
    
    for(let i=0; i<7; i++) {
        const d = new Date(saturdayStart); d.setDate(saturdayStart.getDate() + i);
        const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
        const dStr = `${y}-${m}-${dd}`;
        const count = myHistory[dStr] || 0;
        if(count > maxCount) maxCount = count;
        weekData.push({ date: dStr, count: count, dayLabel: dayNames[d.getDay()] });
    }
    const scaleBase = Math.max(4, maxCount);

    weekData.forEach(data => {
        const h = Math.round((data.count / scaleBase) * 100);
        const isToday = (data.date === today);
        weekGraph.innerHTML += `<div class="graph-col"><div class="bar-area"><div class="week-bar ${h>0?'high':''}" style="height:${h}%; opacity:${isToday?'0.6':'1'};"></div></div><div class="day-label ${isToday?'active':''}">${data.dayLabel}</div></div>`;
    });
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
        if(myHistory[dStr] > 0) realStreak++; else if(i>0) break;
    }
    streakText.innerText = `${realStreak}일`;
}

// [핵심 변경] 성경 역사 기록부(bibleLog)를 바탕으로 누적 장수를 셉니다!
function updateBibleStats(bibleLog) {
    const today = getTodayDate();
    const yearStr = today.split('-')[0];
    let todayCnt = 0;
    let yearCnt = 0;
    
    // 기록부를 쭉 훑어보면서 날짜별로 셉니다. (체크 해제되어도 기록부엔 남아있음)
    if(bibleLog && Array.isArray(bibleLog)) {
        bibleLog.forEach(entry => {
            if(entry.date === today) todayCnt++;
            if(entry.date && entry.date.startsWith(yearStr)) yearCnt++;
        });
    }
    
    const elToday = document.getElementById('bible-today-count');
    const elYear = document.getElementById('bible-year-count');
    if(elToday) elToday.innerText = `${todayCnt}장`;
    if(elYear) elYear.innerText = `${yearCnt}장`; // 이제 완독을 눌러도 이 숫자는 줄어들지 않습니다!
}

function renderHallOfFame(appData) {
    const l = document.getElementById('hall-of-fame-list');
    if(!l) return;
    l.innerHTML = "";
    (appData.pastSeasons || []).reverse().forEach(p => {
        l.innerHTML += `<div class="fame-row"><span>${p.range}</span><span class="fame-win">👑 ${p.winner} (${p.score})</span></div>`;
    });
    if(l.innerHTML === "") l.innerHTML = "<div class='empty-msg-small'>아직 기록이 없습니다.</div>";
}

export function renderBibleBooks(appData, myName, bibleState) {
    const g = document.getElementById('bible-books-grid');
    if(!g) return;
    g.innerHTML = "";
    BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament).forEach(b => {
        const d = document.createElement('div');
        let c = 0;
        const y = new Date().getFullYear().toString();
        for(let i=1; i<=b.chapters; i++){
            const k = `${b.name}-${i}`;
            const dt = appData[myName].bible && appData[myName].bible[k];
            if(dt && dt.startsWith(y)) c++;
        }
        const isDone = c >= b.chapters;
        const round = (appData[myName].bibleRounds && appData[myName].bibleRounds[b.name]) || 0;
        
        d.className = `bible-btn ${isDone?'completed':''}`;
        let html = `<div>${b.name}</div>`;
        if(round > 0) html += `<div class="round-badge">🔄 ${round+1}독</div>`;
        
        d.innerHTML = html;
        d.onclick = () => window.showChapters(b.name);
        g.appendChild(d);
    });
}

export function renderChaptersGrid(appData, myName, bibleState, rangeStart) {
    const b = BIBLE_DATA.books.find(x => x.name === bibleState.currentBook);
    const g = document.getElementById('bible-chapters-grid');
    const y = new Date().getFullYear().toString();
    if(!g || !b) return;
    g.innerHTML = "";
    let all = true;
    for(let i=1; i<=b.chapters; i++){
        const d = document.createElement('div');
        const k = `${b.name}-${i}`;
        const dt = appData[myName].bible && appData[myName].bible[k];
        const r = dt && dt.startsWith(y);
        if(r) d.classList.add('checked'); else all = false;
        d.className = `chapter-item ${r?'checked':''} ${rangeStart===i?'range-start':''}`;
        d.innerText = i;
        d.onclick = () => window.toggleChapter(i, k, !r); 
        g.appendChild(d);
    }
    const btn = document.getElementById('btn-finish-book');
    if(btn) {
        if(all){ btn.classList.remove('disabled'); btn.innerText = "완독하기 🎉"; } 
        else { btn.classList.add('disabled'); btn.innerText = "모두 읽어야 완독 가능"; }
    }
}
