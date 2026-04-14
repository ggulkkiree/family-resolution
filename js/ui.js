export function renderDashboard(appData, myName) {
    const period = appData.period || { start: "2026-01-01", end: "2026-12-31" };
    const pDisplay = document.getElementById('period-display');
    if(pDisplay) pDisplay.innerText = `${period.start} ~ ${period.end}`;
    
    // [수정 1] 내 데이터가 아예 없을 때 앱이 멈추는 것을 방지하는 안전장치 추가
    const userData = appData[myName] || {}; 
    const myHistory = userData.history || {};
    const myBibleLog = userData.bibleLog || [];
    const myGoals = userData.resolution || [];
    
    const today = getTodayDate();
    let todayTotal = 0, todayDone = 0;
    
    myGoals.forEach(g => {
        todayTotal++;
        // [수정 2] .every 대신 .includes를 사용 (배열인지 확인하는 방어 로직 추가)
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
    
    // 작성하신 일요일 달성률 100% 보너스 로직 (유지)
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
        
        // 작성하신 과거 기록 일요일 보너스 로직 (유지)
        if(myHistory[dStr] > 0 || d.getDay() === 0) {
            realStreak++; 
        } else if(i>0) {
            break;
        }
    }
    streakText.innerText = `${realStreak}일`;
}
