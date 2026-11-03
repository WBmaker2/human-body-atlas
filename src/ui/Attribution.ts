/** Attribution dialog — CC BY 4.0 duty: creators + source + license + changes. */
import { HRA_CREDIT, MODEL_SOURCES, PROCEDURAL_ORGANS } from '../anatomy/modelCatalog';
import { organById } from '../anatomy/organs';

export function renderAttribution(el: HTMLElement): void {
  el.innerHTML = `
    <dialog id="attrib-dialog" aria-labelledby="attrib-title">
      <div class="card-head">
        <h2 id="attrib-title">장기 모형 출처 <span class="en">Attribution</span></h2>
        <form method="dialog"><button type="submit" class="ghost" aria-label="출처 닫기">✕</button></form>
      </div>
      <p>
        장기 3D 모형 14종은 <strong>${HRA_CREDIT.library}</strong>(${HRA_CREDIT.publisher})를
        교육용으로 크기 조정·재도색하여 사용했습니다.
      </p>
      <p>
        License: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>
        · 원본 데이터: ${HRA_CREDIT.sourceData}
      </p>
      <p class="hint">${HRA_CREDIT.changesNote}</p>
      <ul class="attrib-list">
        ${MODEL_SOURCES.map((s) => `
          <li>
            <strong>${s.title} ${s.version}</strong> — ${s.creators}<br />
            <a href="${s.sourceUrl}" target="_blank" rel="noopener">${s.sourceUrl}</a>
          </li>`).join('')}
      </ul>
      <p class="hint">인용: ${HRA_CREDIT.citation} · <a href="${HRA_CREDIT.libraryUrl}" target="_blank" rel="noopener">3D Reference Library</a></p>
      <p class="hint">다음은 자체 제작 모형입니다: ${PROCEDURAL_ORGANS.map((id) => organById(id).name).join('·')}·피부·근육·골격·혈관·신경</p>
    </dialog>
  `;
  const dialog = el.querySelector<HTMLDialogElement>('#attrib-dialog');
  el.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-open-attrib]')) dialog?.showModal();
  });
  dialog?.addEventListener('click', (e) => {
    // Backdrop click closes (native Esc already works).
    if (e.target === dialog) dialog.close();
  });
}

export function openAttribution(): void {
  document.querySelector<HTMLDialogElement>('#attrib-dialog')?.showModal();
}
