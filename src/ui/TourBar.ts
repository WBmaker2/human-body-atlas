/** Bottom bar — F3 circulation, F4 breathing, F5 digestion/circulation/breathing tours. */
import { TOUR_IDS, TOUR_META, TOURS, type TourId } from '../anatomy/organs';
import type { AtlasStore } from '../stores/atlasStore';
import type { BodyScene } from '../scene/BodyScene';

export function renderTourBar(el: HTMLElement, store: AtlasStore, scene: BodyScene): () => void {
  function render(): void {
    const s = store.get();
    const stops = TOURS[s.tourId];
    const stop = stops[s.tourIndex] ?? stops[0];
    const meta = TOUR_META[s.tourId];
    el.innerHTML = `
      <div class="tour-groups">
        <section class="tour-group" aria-label="혈액순환">
          <h3>혈액순환 <span class="en">Blood</span></h3>
          <div class="row">
            <button type="button" data-action="blood-toggle" aria-pressed="${s.circulationPlaying}">
              ${s.circulationPlaying ? '일시정지' : '재생'}</button>
            <label>속도
              <input type="range" min="0.2" max="2.5" step="0.1" value="${s.circulationSpeed}"
                data-action="blood-speed" aria-label="혈액 흐름 속도" />
            </label>
          </div>
        </section>
        <section class="tour-group" aria-label="호흡">
          <h3>호흡 <span class="en">Breath</span></h3>
          <div class="row">
            <button type="button" data-action="breath-toggle" aria-pressed="${s.breathingPlaying}">
              ${s.breathingPlaying ? '일시정지' : '재생'}</button>
            <label>호흡수
              <input type="range" min="0.4" max="2" step="0.1" value="${s.breathingRate}"
                data-action="breath-rate" aria-label="호흡 속도" />
            </label>
          </div>
        </section>
        <section class="tour-group tour-main" aria-label="카메라 투어">
          <h3>카메라 투어 <span class="en">Camera tour</span></h3>
          <div class="tour-tabs" role="tablist" aria-label="투어 종류">
            ${TOUR_IDS.map((id: TourId) => {
              const m = TOUR_META[id];
              const selected = id === s.tourId;
              return `<button type="button" role="tab" data-action="tour-kind" data-kind="${id}"
                aria-selected="${selected}" class="${selected ? 'tab-active' : ''}">${m.name}</button>`;
            }).join('')}
          </div>
          <p class="tour-stop" role="status" aria-live="polite">${stop.title}</p>
          <p class="tour-body">${stop.body}</p>
          <div class="row tour-controls">
            <button type="button" data-action="tour-prev" aria-label="이전 정거장">◀ 이전</button>
            ${
              s.tourPlaying
                ? `<button type="button" class="primary btn-pulse" data-action="tour-stop">투어 정지</button>`
                : `<button type="button" class="primary btn-pulse" data-action="tour-start">${meta.startLabel}</button>`
            }
            <button type="button" data-action="tour-next" aria-label="다음 정거장">다음 ▶</button>
          </div>
          <ol class="tour-dots" aria-label="투어 진행도">
            ${stops.map((_, i) => `<li><button type="button" data-action="tour-goto" data-index="${i}"
              class="${i === s.tourIndex ? 'dot-active' : ''} ${i < s.tourIndex ? 'dot-done' : ''}"
              aria-label="${i + 1}정거장으로 이동" aria-current="${i === s.tourIndex ? 'step' : 'false'}">${i + 1}</button></li>`).join('')}
          </ol>
        </section>
      </div>
    `;
  }

  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!btn) return;
    const s = store.get();
    switch (btn.dataset.action) {
      case 'blood-toggle':
        store.setCirculation(!s.circulationPlaying);
        scene.setCirculation(!s.circulationPlaying, s.circulationSpeed);
        break;
      case 'breath-toggle':
        store.setBreathing(!s.breathingPlaying);
        scene.setBreathing(!s.breathingPlaying, s.breathingRate);
        break;
      case 'tour-kind': {
        const kind = (btn.dataset.kind ?? 'digestion') as TourId;
        if (kind === s.tourId) break;
        store.setTourId(kind);
        scene.setTourKind(kind);
        break;
      }
      case 'tour-start':
        store.setTour(true, 0);
        scene.setDigestion(s.tourId === 'digestion');
        scene.startTour();
        break;
      case 'tour-stop':
        store.setTour(false);
        scene.stopTour();
        break;
      case 'tour-prev':
        scene.prevStop();
        break;
      case 'tour-next':
        scene.nextStop();
        break;
      case 'tour-goto': {
        const idx = Number(btn.dataset.index ?? 0);
        store.setTour(s.tourPlaying, idx);
        scene.goToStop(idx);
        break;
      }
    }
  });

  el.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    const s = store.get();
    if (t.dataset.action === 'blood-speed') {
      const v = Number(t.value);
      store.setCirculation(s.circulationPlaying, v);
      scene.setCirculation(s.circulationPlaying, v);
    } else if (t.dataset.action === 'breath-rate') {
      const v = Number(t.value);
      store.setBreathing(s.breathingPlaying, v);
      scene.setBreathing(s.breathingPlaying, v);
    }
  });

  // Scene → store sync for auto-advance.
  const unsubscribe = store.subscribe(render);
  render();
  return unsubscribe;
}
