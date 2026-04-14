// [최종 복구] CSS 스타일과 세부 목표 기능을 모두 포함한 버전
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

        // 내용 영역 (제목 + 세부단계)
        const infoDiv = document.createElement('div');
        infoDiv.style.flex = "1";

        // 1. 목표 제목
        const titleDiv = document.createElement('div');
        titleDiv.className = 'res-text';
        titleDiv.innerText = goal.text || (typeof goal === 'string' ? goal : '나의 목표');
        infoDiv.appendChild(titleDiv);

        // 2. 세부 단계 (Steps) - CSS의 .step-item 활용
        if (goal.steps && Array.isArray(goal.steps)) {
            const stepsDiv = document.createElement('div');
            goal.steps.forEach((step, sIndex) => {
                const span = document.createElement('span');
                // 완료 여부에 따라 .done 클래스 추가
                const isDone = goal.done && goal.done.includes(`${gIndex}-${sIndex}`);
                span.className = isDone ? 'step-item done' : 'step-item';
                span.innerText = step;
                
                // 클릭 시 상태 변경 기능 (window에 연결된 함수가 있다면)
                span.onclick = () => {
                    if (typeof window.toggleStep === 'function') {
                        window.toggleStep(gIndex, sIndex);
                    }
                };
                stepsDiv.appendChild(span);
            });
            infoDiv.appendChild(stepsDiv);
        }

        // 3. 삭제 버튼
        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn';
        delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.onclick = () => {
            if (confirm('이 목표를 삭제할까요?')) {
                if (typeof window.addItem === 'function') { // 기존 로직에 따른 삭제 함수 호출
                    window.deleteItem && window.deleteItem(gIndex);
                }
            }
        };

        li.appendChild(infoDiv);
        li.appendChild(delBtn);
        listEl.appendChild(li);
    });
}
