/** Right card — F2: click organ → KR function card + disease + quiz link. */
import { organById } from '../anatomy/organs';
import type { AtlasStore } from '../stores/atlasStore';

export function renderOrganCard(el: HTMLElement, store: AtlasStore): () => void {
  function render(): void {
    const { selectedOrgan } = store.get();
    if (!selectedOrgan) {
      el.innerHTML = `
        <h2>장기 카드 <span class="en">Organ card</span></h2>
        <p class="empty">3D 모형의 장기를 클릭하면<br />한글 설명 카드가 열립니다.</p>
        <ul class="try-list">
          <li><button type="button" data-organ="heart">심장 보기</button></li>
          <li><button type="button" data-organ="lungs">폐 보기</button></li>
          <li><button type="button" data-organ="stomach">위 보기</button></li>
        </ul>
      `;
      return;
    }
    const o = organById(selectedOrgan);
    el.innerHTML = `
      <div class="card-head">
        <h2>${o.name} <span class="en">${o.nameEn}</span></h2>
        <button type="button" class="ghost" data-close aria-label="카드 닫기">✕</button>
      </div>
      <dl class="card-body">
        <div><dt>하는 일</dt><dd>${o.function}</dd></div>
        <div><dt>관련 질병</dt><dd>${o.disease}</dd></div>
        <div><dt>깜짝 상식</dt><dd>${o.fact}</dd></div>
      </dl>
      <div class="card-actions">
        <button type="button" class="primary" data-quiz>이 장기로 퀴즈 풀기</button>
      </div>
    `;
  }

  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-close]')) {
      store.select(null);
      return;
    }
    if (t.closest('[data-quiz]')) {
      store.setQuizOpen(true);
      return;
    }
    const organBtn = t.closest<HTMLButtonElement>('[data-organ]');
    if (organBtn?.dataset.organ) {
      store.select(organBtn.dataset.organ);
    }
  });

  const unsubscribe = store.subscribe(render);
  render();
  return unsubscribe;
}
