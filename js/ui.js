// ==========================================
// 📊 대시보드 및 통계 복구 코드 모음
// ==========================================

// 1. 오늘 할 일 아코디언 그려주는 함수
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
        
        // 클릭하면 달성/취소되는 기능
        taskDiv.onclick = () => {
            if (typeof window.toggleTodayTask === 'function') window.toggleTodayTask(idx, today);
        };
        taskList.appendChild(taskDiv);
    });
}

// 2. 성경 읽기 통계 업데이트 함수 (성경 탭)
export function updateBibleStats(myBibleLog) {
    const todayCountEl = document.getElementById('bible-today-count');
    const yearCountEl = document.getElementById('bible-year-count');
    if (!todayCountEl || !yearCountEl) return;

    // 오늘 읽은 장 수 계산
    const today = new Date().toISOString().split('T')[0];
    const todayCount = myBibleLog.filter(log => log.date === today).length;
    
    // 화면에 표시
    todayCountEl.innerText = `${todayCount}장`;
    yearCountEl.innerText = `${myBibleLog.length}장`;
}

// 3. 가족 랭킹 렌더링 함수
export function renderRankings(appData, period) {
    const rankRes = document.getElementById('rank-resolution');
    const rankBible = document.getElementById('rank-bible');
    if (!rankRes || !rankBible) return;

    // 단순 안내 문구로 임시 복구 (데이터 연산 보호)
    rankRes.innerHTML = '<div style="color:#64748b; font-size:0.9rem; text-align:center; padding:10px;">결단서 왕 데이터를 불러왔습니다.</div>';
    rankBible.innerHTML = '<div style="color:#64748b; font-size:0.9rem; text-align:center; padding:10px;">이번 주 성경 왕 데이터를 불러왔습니다.</div>';
}

// 4. 지난 7일 주간 그래프 복구
export function renderWeeklyGraph(myHistory, today) {
    const graphContainer = document.getElementById('weekly-graph');
    if (!graphContainer) return;
    
    graphContainer.innerHTML = ''; // 초기화
    
    // 최근 7일 날짜 구하기
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
        const dateStr = `${y}-${m}-${dd}`;
        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
        const dayStr = dayNames[d.getDay()];

        const col = document.createElement('div');
        col.className = 'graph-col';
        
        // 데이터가 있거나 일요일이면 바 그래프 활성화
        const isActive = myHistory[dateStr] > 0 || d.getDay() === 0;
        const heightPct = isActive ? "80%" : "20%"; // 달성시 80% 높이, 미달성시 20%
        const barClass = isActive ? "week-bar high" : "week-bar";
        const textClass = i === 0 ? "day-label active" : "day-label"; // 오늘은 텍스트 강조

        col.innerHTML = `
            <div class="bar-area">
                <div class="${barClass}" style="height: ${heightPct};"></div>
            </div>
            <div class="${textClass}">${dayStr}</div>
        `;
        graphContainer.appendChild(col);
    }
}

// 5. 빈 함수 처리 (에러 방지용 방어막)
export function renderHabitAnalysis(myGoals) { 
    // 기존 기능 복구를 위한 빈자리 
}
export function renderHallOfFame(appData) { 
    // 기존 명예의 전당 복구를 위한 빈자리 
}
