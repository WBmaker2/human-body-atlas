/** Quiz sheet — F6: drag name labels onto organs + teacher print table. */
import { ORGANS, QUIZ_ITEMS, quizLabelsShifted, scoreQuiz } from '../anatomy/organs';
import type { AtlasStore } from '../stores/atlasStore';

export function renderQuiz(el: HTMLElement, store: AtlasStore): () => void {
  let answers: Record<string, string> = {};
  let pickedLabel: string | null = null;
  let submitted = false;
  const labels = quizLabelsShifted();

  function result() {
    return scoreQuiz(answers);
  }

  function render(): void {
    const { quizOpen } = store.get();
    if (!quizOpen) {
      el.innerHTML = '';
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const { correct, total } = result();
    el.innerHTML = `
      <div class="quiz-sheet" role="dialog" aria-modal="false" aria-labelledby="quiz-title">
        <div class="card-head">
          <h2 id="quiz-title">라벨 퀴즈 <span class="en">Label quiz</span></h2>
          <button type="button" class="ghost" data-action="close" aria-label="퀴즈 닫기">✕</button>
        </div>
        <p class="hint">이름표를 끌어(또는 눌러) 알맞은 장기 칸에 붙이세요. 키보드: 이름표 Enter → 칸 Enter.</p>
        <div class="quiz-labels" role="list" aria-label="이름표">
          ${labels.map((label) => `
            <button type="button" role="listitem" class="label-chip ${pickedLabel === label ? 'picked' : ''} ${Object.values(answers).includes(label) ? 'used' : ''}"
              draggable="true" data-label="${label}" data-action="pick"
              aria-pressed="${pickedLabel === label}">${label}</button>`).join('')}
        </div>
        <ul class="quiz-slots">
          ${QUIZ_ITEMS.map((item) => {
            const organ = ORGANS.find((o) => o.id === item.organId);
            const got = answers[item.organId];
            const cls = submitted ? (got === item.label ? 'slot-correct' : 'slot-wrong') : (got ? 'slot-filled' : '');
            return `
            <li class="quiz-slot ${cls}" data-slot="${item.organId}"
              aria-label="${organ?.quizHint ?? item.organId}">
              <span class="slot-hint">${organ?.quizHint ?? ''}</span>
              <span class="slot-value" aria-live="polite">${got ?? '여기에 붙이기'}</span>
              ${got && !submitted ? `<button type="button" class="ghost" data-action="clear" data-slot-clear="${item.organId}" aria-label="붙인 이름표 떼기">지우기</button>` : ''}
              ${submitted ? `<span class="slot-answer">정답: ${item.label}</span>` : ''}
            </li>`;
          }).join('')}
        </ul>
        <div class="row quiz-actions">
          <button type="button" class="primary" data-action="submit">채점하기</button>
          <button type="button" data-action="reset">다시 풀기</button>
          <button type="button" data-action="print">장기표 인쇄</button>
          ${submitted ? `<p class="score" role="status">${total}개 중 ${correct}개 정답! ${correct === total ? '완벽해요!' : '틀린 칸의 힌트를 다시 읽어보세요.'}</p>` : ''}
        </div>
        <details class="print-table">
          <summary>교사 인쇄용 전체 장기표 (13개)</summary>
          <table>
            <caption>주요 장기 정리표 — 소화 순서는 숫자로 표시</caption>
            <thead><tr><th scope="col">소화 순서</th><th scope="col">장기</th><th scope="col">하는 일</th></tr></thead>
            <tbody>
              ${ORGANS.map((o) => `<tr><td>${o.digestionOrder ?? '—'}</td><th scope="row">${o.name} <span class="en">${o.nameEn}</span></th><td>${o.function}</td></tr>`).join('')}
            </tbody>
          </table>
        </details>
      </div>
    `;
  }

  function place(label: string, slot: string): void {
    // Remove the label from any other slot first (1:1 mapping).
    for (const key of Object.keys(answers)) {
      if (answers[key] === label) delete answers[key];
    }
    answers[slot] = label;
    pickedLabel = null;
    submitted = false;
    render();
  }

  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-action], [data-slot]');
    if (!btn) return;
    if (btn.dataset.slot && pickedLabel && !btn.closest('[data-action]')) {
      place(pickedLabel, btn.dataset.slot);
      return;
    }
    const action = btn.dataset.action;
    if (action === 'pick') {
      const label = btn.dataset.label ?? '';
      pickedLabel = pickedLabel === label ? null : label;
      render();
    } else if (action === 'close') {
      store.setQuizOpen(false);
    } else if (action === 'clear') {
      const slot = btn.dataset.slotClear;
      if (slot) delete answers[slot];
      submitted = false;
      render();
    } else if (action === 'submit') {
      submitted = true;
      render();
    } else if (action === 'reset') {
      answers = {};
      pickedLabel = null;
      submitted = false;
      render();
    } else if (action === 'print') {
      window.print();
    }
  });

  el.addEventListener('dragstart', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-label]');
    if (!chip?.dataset.label || !e.dataTransfer) return;
    e.dataTransfer.setData('text/plain', chip.dataset.label);
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragover', (e) => {
    if ((e.target as HTMLElement).closest?.('[data-slot]')) e.preventDefault();
  });
  el.addEventListener('drop', (e) => {
    const slot = (e.target as HTMLElement).closest<HTMLElement>('[data-slot]');
    const label = e.dataTransfer?.getData('text/plain');
    if (slot?.dataset.slot && label) {
      e.preventDefault();
      place(label, slot.dataset.slot);
    }
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const slot = (e.target as HTMLElement).closest<HTMLElement>('[data-slot]');
      if (slot?.dataset.slot && pickedLabel) place(pickedLabel, slot.dataset.slot);
    }
  });

  const unsubscribe = store.subscribe(render);
  render();
  return unsubscribe;
}
