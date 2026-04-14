// ui.js의 renderDashboard와 calculateStreak 함수만 아래와 같이 교체해주세요. (다른 건 원본 유지)

export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    const myHistory = appData[myName].history || {};
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
    
    // [추가] 오늘이 일요일이면 자동으로 달성률 100% 처리
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
        
        // [수정] 과거 기록 중 일요일(getDay() === 0)은 무조건 성공한 것으로 간주하여 기록 유지
        if(myHistory[dStr] > 0 || d.getDay() === 0) {
            realStreak++; 
        } else if(i>0) {
            break;
        }
    }
    streakText.innerText = `${realStreak}일`;
}
