// 🎨 UI (화면 그리기) 전용 파일 - 최종 복구 버전
// 성실도 분석, 아코디언, 그래프 스케일링 포함

import { BIBLE_DATA, USER_SLOTS } from './data.js';

// === 날짜 도우미 ===
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

// === 화면 그리기 함수들 ===

// 1. 나의 목표 리스트
export function renderResolutionList(appData, myName) {
    const l = document.getElementById('list-resolution');
    if(!l) return;
    l.innerHTML = "";
    const today = getTodayDate();
    const list = appData[myName].resolution || [];
    
    list.forEach((x, i) => {
        const s = x.steps.map((st, si) => {
            const isDoneToday = (x.done[si] === today);
            return `<span class="step-item ${isDoneToday?'done':''}" onclick="window.toggleStep(${i},${si})">${st}</span>`;
        }).join('');
        
        l.innerHTML += `
            <li class="resolution-item">
                <div class="res-left">
                    <div class="res-text" onclick="window.editItem(${i})">${x.text}</div>
                    <div class="steps">${s}</div>
                </div>
                <button class="del-icon-btn" onclick="window.deleteItem(${i})"><i class="fas fa-trash-alt"></i></button>
            </li>`;
    });
}

// 2. 가족 목표 리스트
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

        let html = `
            <div class="family-card">
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
                html += `<li class="family-goal-item"><span class="fg-bullet">•</span><span>${g.text}</span></li>`;
            });
        }
        html += `</ul></div>`;
        container.innerHTML += html;
    });
}

// 3. 메시지
export function renderMessages(appData) {
    const l = document.getElementById('msg-list');
    if(!l) return;
    l.innerHTML = "";
    const msgs = [...(appData.messages || [])].reverse();
    msgs.forEach(m => {
        l.innerHTML += `<li><b>${m.sender}:</b> ${m.text}</li>`;
    });
}

// 4. 대시보드 (통합)
export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    const myHistory = appData[myName].history || {};
    const myBible = appData[myName].bible || {};
    const today = getTodayDate();
    const myGoals = appData[myName].resolution || [];
    
    // 계산
    let todayTotal = 0, todayDone = 0;
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        todayTotal++;
        if(isDoneToday) todayDone++;
    });

    // 오늘 할 일 (아코디언)
    renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal);

    // 도넛 차트
    let rate = 0;
    if(todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100);
    const dRate = document.getElementById('dash-rate');
    const dFill = document.getElementById('donut-fill');
    if(dRate) dRate.innerText = rate + "%";
    if(dFill) setTimeout(() => { dFill.style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);

    // 스트릭
    calculateStreak(myHistory, rate, todayTotal);
    
    // 성경바
    updateBibleProgress(myBible);
    
    // 주간 그래프
    renderWeeklyGraph(myHistory, today);
    
    // [New] 성실도 분석 (아코디언)
    renderHabitAnalysis(myGoals);

    // 랭킹
    renderRankings(appData, period);
    renderHallOfFame(appData);
}

// [기능] 오늘 할 일 아코디언 렌더링
function renderTodayTasksAccordion(myGoals, today, doneCount, totalCount) {
    const originalList = document.getElementById('today-task-list');
    if(!originalList) return;
    const parentCard = originalList.closest('.dash-card');
    if(!parentCard) return;

    const isAllDone = (doneCount === totalCount && totalCount > 0);
    
    parentCard.innerHTML = `
        <div class="accordion-header" onclick="window.toggleAccordion('today-task-acc', this.querySelector('.accordion-icon'))" style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:5px 0; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-weight:bold;">📅 오늘 목표</span>
                <span class="check-pill ${isAllDone?'done':''}" style="font-size:0.8rem;">${doneCount}/${totalCount} 완료</span>
            </div>
            <i class="fas fa-chevron-down accordion-icon"></i>
        </div>
        <div id="today-task-acc" class="accordion-content hidden" style="width:100%; border-top:1px solid #f1f5f9; margin-top:10px; padding-top:10px;">
            ${myGoals.length === 0 ? '<div style="color:#94a3b8; font-size:0.9rem;">목표가 없습니다.</div>' : ''}
            ${myGoals.map(g => {
                const isDoneToday = g.done && g.done.every(val => val === today);
                return `
                <div class="today-check-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f8fafc;">
                    <span style="font-size:0.9rem; text-align:left; flex:1; margin-right:10px;">${g.text}</span>
                    <span style="font-size:1.2rem; color:${isDoneToday?'var(--success)':'#e2e8f0'}">
                        ${isDoneToday?'<i class="fas fa-check-circle"></i>':'<i class="far fa-circle"></i>'}
                    </span>
                </div>`;
            }).join('')}
        </div>
    `;
}

// [기능] 성실도 분석 (아코디언 + 깔끔 디자인)
function renderHabitAnalysis(myGoals) {
    let container = document.getElementById('habit-analysis-card');
    if(!container) {
        const graphCard = document.getElementById('weekly-graph').closest('.dash-card');
        container = document.createElement('div');
        container.id = 'habit-analysis-card';
        container.className = 'dash-card';
        container.style.marginBottom = '12px';
        graphCard.after(container);
    }

    const analysis = myGoals.map(g => {
        const totalCount = (g.counts || []).reduce((a, b) => a + b, 0);
        return { text: g.text, count: totalCount };
    }).sort((a, b) => b.count - a.count);

    const maxVal = Math.max(...analysis.map(a => a.count)) || 1;

    let html = `
        <div class="accordion-header" onclick="window.toggleAccordion('habit-acc', this.querySelector('.accordion-icon'))" style="width:100%; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <div style="font-weight:bold;">📊 목표별 누적 실천</div>
            <i class="fas fa-chevron-down accordion-icon"></i>
        </div>
        <div id="habit-acc" class="accordion-content hidden" style="width:100%; margin-top:15px; border-top:1px solid #f1f5f9; padding-top:15px;">
    `;
    
    if(analysis.length === 0) {
        html += `<div style="color:#94a3b8; font-size:0.9rem;">아직 등록된 목표가 없습니다.</div>`;
    } else {
        analysis.forEach(item => {
            const width = (item.count / maxVal) * 100;
            const color = width > 70 ? 'var(--success)' : (width > 30 ? '#fbbf24' : '#ef4444');
            html += `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; margin-bottom:5px;">
                        <span style="text-align:left; font-weight:500; color:var(--text-main); flex:1; margin-right:10px;">${item.text}</span>
                        <span style="font-weight:bold; color:${color}; font-size:0.85rem; white-space:nowrap;">${item.count}회</span>
                    </div>
                    <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                        <div style="width:${width}%; height:100%; background:${color}; border-radius:4px;"></div>
                    </div>
                </div>`;
        });
    }
    html += `</div>`;
    container.innerHTML = html;
}

// [기능] 주간 그래프
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
        weekGraph.innerHTML += `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;">
                <div style="flex:1;display:flex;align-items:flex-end;width:100%;">
                    <div class="week-bar ${h>0?'high':''}" style="width:60%; margin:0 auto; height:${h}%; min-height:${data.count>0?'4px':'0'}; ${isToday ? 'opacity:0.8;' : ''}"></div>
                </div>
                <div class="week-day-label" style="${isToday ? 'font-weight:bold;color:var(--primary);' : ''}">${data.dayLabel}</div>
            </div>`;
    });
}

function calculateStreak(myHistory, rate, todayTotal) {
    const fireIcon = document.getElementById('streak-icon');
    const streakLabel = document.getElementById('streak-label');
    const streakText = document.getElementById('dash-streak');
    if(!fireIcon || !streakText) return;

    if(rate >= 100 && todayTotal > 0) {
        fireIcon.className = "fas fa-crown streak-icon gold"; 
        streakLabel.innerText = "완벽한 하루!";
    } else if(rate >= 50) {
        fireIcon.className = "fas fa-fire streak-icon active";
        streakLabel.innerText = "연속 성공 중";
    } else {
        fireIcon.className = "fas fa-fire streak-icon";
        streakLabel.innerText = "50% 이상 도전!";
    }

    let realStreak = 0;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9*60*60*1000));
    for(let i=0; i<365; i++) {
        const d = new Date(kstNow); d.setDate(d.getDate() - i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if(myHistory[dStr] > 0) realStreak++; else if(i>0) break;
    }
    streakText.innerText = realStreak + "일";
}

function updateBibleProgress(myBible) {
    let lastBook = "없음", percent = 0;
    const readKeys = Object.keys(myBible).sort();
    if(readKeys.length > 0) {
        const lastKey = readKeys[readKeys.length-1];
        const [bName] = lastKey.split('-');
        lastBook = bName;
        const bookData = BIBLE_DATA.books.find(b => b.name === bName);
        if(bookData) percent = Math.round((readKeys.filter(k => k.startsWith(bName+'-')).length / bookData.chapters) * 100);
    }
    const elName = document.getElementById('current-book-name');
    const elPercent = document.getElementById('bible-book-percent');
    const elBar = document.getElementById('bible-progress-bar');
    if(elName) elName.innerText = lastBook;
    if(elPercent) elPercent.innerText = percent + "%";
    if(elBar) setTimeout(() => { elBar.style.width = percent + "%"; }, 100);
}

function renderRankings(appData, p){
    const u = USER_SLOTS.filter(x => appData.auth && appData.auth[x]);
    const r = document.getElementById('rank-resolution');
    if(r) {
        r.innerHTML = "";
        u.map(x => {
            const h = appData[x].history || {};
            const s = Object.keys(h).filter(d => d >= p.start && d <= p.end).reduce((a, b) => a + h[b], 0);
            return { name: appData.auth[x].name, val: s };
        }).sort((a, b) => b.val - a.val).forEach((x, i) => {
            r.innerHTML += `<div class="rank-row"><span>${i+1}.${x.name}</span><span class="score">${x.val}점</span></div>`;
        });
    }
    const w = getWeeklyRange();
    const b = document.getElementById('rank-bible');
    if(b) {
        b.innerHTML = "";
        u.map(x => {
            const log = appData[x].bibleLog || [];
            const c = log.filter(entry => entry.date >= w.start && entry.date <= w.end).length;
            return { name: appData.auth[x].name, val: c };
        }).sort((a, b) => b.val - a.val).forEach((x, i) => {
            b.innerHTML += `<div class="rank-row"><span>${i+1}.${x.name}</span><span class="score">${x.val}장</span></div>`;
        });
    }
}

function renderHallOfFame(appData) {
    const l = document.getElementById('hall-of-fame-list');
    if(!l) return;
    l.innerHTML = "";
    (appData.pastSeasons || []).reverse().forEach(p => {
        l.innerHTML += `<div class="fame-row"><div class="fame-season">${p.range}</div><div class="fame-winner">👑 ${p.winner} (${p.score})</div></div>`;
    });
    if(l.innerHTML === "") l.innerHTML = "<div style='text-align:center;color:#94a3b8;font-size:0.8rem;'>기록 없음</div>";
}

export function renderBibleBooks(appData, myName, bibleState) {
    const g = document.getElementById('bible-books-grid');
    if(!g) return;
    g.innerHTML = "";
    BIBLE_DATA.books.filter(b => b.testament === bibleState.currentTestament).forEach(b => {
        const d = document.createElement('div');
        d.className = "bible-btn";
        let c = 0;
        const y = new Date().getFullYear().toString();
        for(let i=1; i<=b.chapters; i++){
            const k = `${b.name}-${i}`;
            const dt = appData[myName].bible && appData[myName].bible[k];
            if(dt && dt.startsWith(y)) c++;
        }
        if(c >= b.chapters) d.classList.add('completed');
        const round = (appData[myName].bibleRounds && appData[myName].bibleRounds[b.name]) || 0;
        let html = `<div>${b.name}</div>`;
        if(round > 0) html += `<div class="verse-badge" style="margin:2px 0 0 0; font-size:0.7rem; background:#dcfce7; color:#166534;">🔄 ${round+1}독</div>`;
        else html += `<div style="font-size:0.7rem; color:var(--text-light);">${b.chapters}장</div>`;
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
        d.className = "chapter-item";
        const k = `${b.name}-${i}`;
        const dt = appData[myName].bible && appData[myName].bible[k];
        const r = dt && dt.startsWith(y);
        if(r) d.classList.add('checked'); else all = false;
        d.innerText = i;
        if(rangeStart && rangeStart > 0 && i === rangeStart) d.classList.add('range-start');
        d.onclick = () => window.toggleChapter(i, k, !r); 
        g.appendChild(d);
    }
    const btn = document.getElementById('btn-finish-book');
    if(btn) {
        if(all){ btn.classList.remove('disabled'); btn.innerText = "완독하기 🎉"; } 
        else { btn.classList.add('disabled'); btn.innerText = "모두 읽어야 완독 가능"; }
    }
}
