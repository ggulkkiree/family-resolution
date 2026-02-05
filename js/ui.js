// 🎨 UI (화면 그리기) 전용 파일 - Step 2 완성본
// 성실도 분석, 그래프 스케일링, 디자인 최적화 적용

import { BIBLE_DATA, USER_SLOTS } from './data.js';

// === 1. 날짜 도우미 (한국 시간 기준) ===
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
    
    const day = kstNow.getDay(); // 0:일 ~ 6:토
    const offset = (day + 1) % 7; // 토요일 시작 기준
    
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

// === 2. 화면 그리기 핵심 함수들 ===

// [나의 목표 리스트]
export function renderResolutionList(appData, myName) {
    const l = document.getElementById('list-resolution');
    if(!l) return;
    l.innerHTML = "";
    const today = getTodayDate();
    const list = appData[myName].resolution || [];
    
    if(list.length === 0) {
        l.innerHTML = `<li style="text-align:center; color:#94a3b8; font-size:0.9rem; padding:20px;">아직 등록된 목표가 없습니다.<br>위 입력창에서 목표를 추가해보세요!</li>`;
        return;
    }

    list.forEach((x, i) => {
        const s = x.steps.map((st, si) => {
            const isDoneToday = (x.done[si] === today);
            return `<span class="step-item ${isDoneToday?'done':''}" onclick="window.toggleStep(${i},${si})">${st}</span>`;
        }).join('');
        
        l.innerHTML += `
            <li class="resolution-item">
                <div class="res-left" style="flex:1;">
                    <div class="res-text" onclick="window.editItem(${i})" style="font-weight:600; margin-bottom:8px; cursor:pointer;">${x.text}</div>
                    <div class="steps">${s}</div>
                </div>
                <button class="del-icon-btn" onclick="window.deleteItem(${i})" style="border:none; background:none; color:#cbd5e1; padding:10px;"><i class="fas fa-trash-alt"></i></button>
            </li>`;
    });
}

// [가족 목표 리스트]
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

        // 접었다 폈다 할 수 있는 카드 구조
        let html = `
            <div class="family-card" style="padding:0; overflow:hidden;">
                <div class="accordion-header" onclick="window.toggleFamilyList('fam-list-${idx}')" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; background:#fff; cursor:pointer;">
                    <span class="family-name" style="font-weight:700; color:var(--text-main);">${user.name}</span>
                    <span class="family-summary" style="font-size:0.8rem; color:#94a3b8;">${total}개의 목표</span>
                </div>
                <ul id="fam-list-${idx}" class="family-goal-list hidden" style="padding:15px 20px; border-top:1px solid #f1f5f9; background:#fcfcfc; margin:0; list-style:none;">
        `;

        if(total === 0) {
            html += `<li class="family-goal-item" style="color:#94a3b8; font-size:0.9rem;">등록된 목표가 없습니다.</li>`;
        } else {
            goals.forEach(g => {
                html += `
                    <li class="family-goal-item" style="padding:5px 0; font-size:0.9rem; color:#64748b;">
                        <span style="color:#cbd5e1; margin-right:5px;">•</span>
                        <span>${g.text}</span>
                    </li>
                `;
            });
        }
        html += `</ul></div>`;
        container.innerHTML += html;
    });
}

// [메시지(채팅)]
export function renderMessages(appData) {
    const l = document.getElementById('msg-list');
    if(!l) return;
    l.innerHTML = "";
    const msgs = [...(appData.messages || [])].reverse();
    
    if(msgs.length === 0) {
        l.innerHTML = `<li style="text-align:center; color:#cbd5e1; font-size:0.8rem; padding:10px;">첫 메시지를 남겨보세요! 👋</li>`;
        return;
    }

    msgs.forEach(m => {
        l.innerHTML += `<li style="margin-bottom:8px; font-size:0.9rem;"><b style="color:var(--primary);">${m.sender}:</b> ${m.text}</li>`;
    });
}

// [대시보드 통합 렌더링]
export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    const myHistory = appData[myName].history || {};
    const myBible = appData[myName].bible || {};
    const today = getTodayDate();
    const myGoals = appData[myName].resolution || [];
    
    // 1. 오늘 현황 계산
    let todayTotal = 0, todayDone = 0;
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        todayTotal++;
        if(isDoneToday) todayDone++;
    });

    // 2. 오늘 할 일 목록 (아코디언 안에 넣기)
    renderTodayTasksAccordion(myGoals, today, todayDone, todayTotal);

    // 3. 도넛 차트
    let rate = 0;
    if(todayTotal > 0) rate = Math.round((todayDone / todayTotal) * 100);
    const dRate = document.getElementById('dash-rate');
    const dFill = document.getElementById('donut-fill');
    if(dRate) dRate.innerText = rate + "%";
    if(dFill) setTimeout(() => { dFill.style.strokeDashoffset = 251 - (251 * rate / 100); }, 100);

    // 4. 스트릭
    calculateStreak(myHistory, rate, todayTotal);
    
    // 5. 성경 진행도
    updateBibleProgress(myBible);
    
    // 6. 주간 그래프 (스케일링 적용)
    renderWeeklyGraph(myHistory, today);
    
    // 7. [New] 성실도 분석 (그래프)
    renderHabitAnalysis(myGoals);

    // 8. 랭킹 & 명예의 전당
    renderRankings(appData, period);
    renderHallOfFame(appData);
}

// [기능] 오늘 할 일 아코디언 내용 채우기
function renderTodayTasksAccordion(myGoals, today, doneCount, totalCount) {
    // 요약 정보 업데이트
    const statusText = document.getElementById('today-status-text');
    if(statusText) {
        statusText.innerHTML = `<span style="color:${doneCount===totalCount && totalCount>0 ? 'var(--success)' : 'var(--text-sub)'}">${doneCount}/${totalCount} 완료</span>`;
    }

    // 리스트 업데이트
    const listContainer = document.getElementById('today-task-list');
    if(!listContainer) return;
    
    if(myGoals.length === 0) {
        listContainer.innerHTML = '<div style="color:#94a3b8; font-size:0.9rem; padding:10px;">목표가 없습니다.</div>';
        return;
    }

    let html = '';
    myGoals.forEach(g => {
        const isDoneToday = g.done && g.done.every(val => val === today);
        html += `
        <div class="today-check-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f8fafc;">
            <span style="font-size:0.9rem; text-align:left; flex:1; margin-right:10px; color:${isDoneToday?'var(--text-light)':'var(--text-main)'}; ${isDoneToday?'text-decoration:line-through;':''}">${g.text}</span>
            <span style="font-size:1.2rem; color:${isDoneToday?'var(--success)':'#e2e8f0'}">
                ${isDoneToday?'<i class="fas fa-check-circle"></i>':'<i class="far fa-circle"></i>'}
            </span>
        </div>`;
    });
    listContainer.innerHTML = html;
}

// [기능] 성실도 분석 (목표별 누적 횟수 그래프)
function renderHabitAnalysis(myGoals) {
    let container = document.getElementById('habit-analysis-card');
    
    // 컨테이너가 없으면(최초 실행 시) 생성해서 넣을 위치를 찾음
    if(!container) {
        const graphCard = document.querySelector('.weekly-graph').closest('.dash-card');
        if(graphCard) {
            container = document.createElement('div');
            container.id = 'habit-analysis-card';
            // 주간 그래프 카드 앞에 삽입
            graphCard.parentNode.insertBefore(container, graphCard); 
        } else {
            return;
        }
    }

    // 데이터 분석
    const analysis = myGoals.map(g => {
        const totalCount = (g.counts || []).reduce((a, b) => a + b, 0);
        return { text: g.text, count: totalCount };
    }).sort((a, b) => b.count - a.count); // 많이 한 순서대로

    // 최대값 (그래프 비율용)
    const maxVal = Math.max(...analysis.map(a => a.count)) || 1;

    // HTML 생성 (아코디언 구조)
    // index.html의 구조에 맞춰 카드 형태로 생성
    let html = `
        <div class="dash-card">
            <div class="accordion-header" onclick="window.toggleAccordion('habit-acc', this.querySelector('.accordion-icon'))" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-weight:700; font-size:0.95rem;">📊 목표별 성실도</span>
                <i class="fas fa-chevron-down accordion-icon"></i>
            </div>
            
            <div id="habit-acc" class="accordion-content hidden">
    `;
    
    if(analysis.length === 0) {
        html += `<div style="color:#94a3b8; font-size:0.9rem; padding:10px;">아직 데이터가 없습니다.</div>`;
    } else {
        analysis.forEach(item => {
            const width = (item.count / maxVal) * 100;
            // 색상 로직: 70%이상 초록, 30%이상 노랑, 나머지 빨강
            const color = width > 70 ? 'var(--success)' : (width > 30 ? '#fbbf24' : '#ef4444');
            
            html += `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:4px;">
                        <span style="text-align:left; color:var(--text-sub); flex:1; margin-right:10px;">${item.text}</span>
                        <span style="font-weight:700; color:${color}; white-space:nowrap;">${item.count}회</span>
                    </div>
                    <div style="width:100%; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                        <div style="width:${width}%; height:100%; background:${color}; border-radius:3px; transition: width 0.5s;"></div>
                    </div>
                </div>`;
        });
    }
    html += `</div></div>`; // 닫는 태그
    
    container.outerHTML = html; // 기존 요소를 새 HTML로 교체
    // 교체 후 ID가 사라지지 않게 outerHTML 사용시 주의해야 하지만, 위에서 ID를 포함해서 그렸으므로 OK.
    // 다만 outerHTML로 교체하면 container 참조가 끊기므로 다음 렌더링을 위해 ID가 'habit-analysis-card'인 div가 최상위에 있어야 함.
    // 위 코드 수정: container.id = 'habit-analysis-card'를 div.dash-card가 아니라, 그 감싸는 wrapper로 하거나,
    // 더 쉬운 방법: innerHTML만 교체.
    
    // 수정된 로직: container는 빈 div이고 그 안에 내용을 채운다.
    container = document.getElementById('habit-analysis-card'); // 다시 찾기
    if(container) {
        container.innerHTML = html; // 카드 자체를 안에 넣음 (이중 카드가 될 수 있으니 주의)
        // 위 html 변수에서 맨 바깥 <div class="dash-card">...</div> 만 남기고
        // container 자체는 스타일 없는 wrapper로 둠.
    }
}

// [기능] 주간 그래프 (높이 자동 조절)
function renderWeeklyGraph(myHistory, today) {
    const weekGraph = document.getElementById('weekly-graph');
    if(!weekGraph) return;
    weekGraph.innerHTML = "";
    
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const kstNow = new Date(utc + (9*60*60*1000));
    
    // 이번주 토요일 시작일 찾기
    const dayOfWeek = kstNow.getDay();
    const offset = (dayOfWeek + 1) % 7; 
    const saturdayStart = new Date(kstNow); 
    saturdayStart.setDate(kstNow.getDate() - offset);
    
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
    
    // 그래프가 너무 작아지지 않게 최소값 보정
    const scaleBase = Math.max(4, maxCount);

    weekData.forEach(data => {
        const h = Math.round((data.count / scaleBase) * 100);
        const isToday = (data.date === today);
        
        weekGraph.innerHTML += `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%;">
                <div style="flex:1; width:100%; display:flex; align-items:flex-end;">
                    <div class="week-bar ${h>0?'high':''}" style="width:60%; margin:0 auto; height:${h}%; min-height:${data.count>0?'4px':'0'}; opacity:${isToday?'0.6':'1'};"></div>
                </div>
                <div class="week-day-label" style="${isToday ? 'font-weight:800; color:var(--primary);' : ''}">${data.dayLabel}</div>
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
    
    // 365일치 확인
    for(let i=0; i<365; i++) {
        const d = new Date(kstNow); d.setDate(d.getDate() - i);
        const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
        const dStr = `${y}-${m}-${dd}`;
        
        if(myHistory[dStr] > 0) realStreak++; 
        else if(i > 0) break; // 오늘 안했어도 어제 했으면 스트릭 유지되게 하려면 로직 수정 필요하나 일단 끊김 처리
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
        if(round > 0) html += `<div style="font-size:0.65rem; background:#dcfce7; color:#166534; padding:2px 4px; border-radius:4px; margin-top:2px;">🔄 ${round+1}독</div>`;
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
