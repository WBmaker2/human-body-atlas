/** Left rail — F1: 5-layer toggles + opacity sliders + isolate mode. */
import { LAYERS } from '../anatomy/layers';
import type { AtlasStore } from '../stores/atlasStore';
import { isLayerEffectivelyVisible } from '../stores/atlasStore';
import type { BodyScene } from '../scene/BodyScene';

export function renderLayerRail(el: HTMLElement, store: AtlasStore, scene: BodyScene): () => void {
  function syncScene(): void {
    const s = store.get();
    for (const l of LAYERS) {
      scene.setLayerVisible(l.id, isLayerEffectivelyVisible(s, l.id));
      scene.setLayerOpacity(l.id, s.layerOpacity[l.id]);
    }
  }

  function render(): void {
    const s = store.get();
    el.innerHTML = `
      <h2 id="layer-heading">레이어 <span class="en">Layers</span></h2>
      <ul class="layer-list" aria-labelledby="layer-heading">
        ${LAYERS.map((l) => {
          const on = isLayerEffectivelyVisible(s, l.id);
          const isolated = s.isolated === l.id;
          return `
          <li class="layer-item" data-layer="${l.id}">
            <div class="layer-row">
              <label class="layer-toggle">
                <input type="checkbox" data-action="toggle" data-layer="${l.id}" ${on ? 'checked' : ''} aria-label="${l.name} 레이어 보이기" />
                <span class="swatch" style="background:#${l.color.toString(16).padStart(6, '0')}" aria-hidden="true"></span>
                <span class="layer-name">${l.name} <span class="en">${l.nameEn}</span></span>
              </label>
              <button type="button" class="chip ${isolated ? 'chip-active' : ''}" data-action="isolate" data-layer="${l.id}"
                aria-pressed="${isolated}" title="이 레이어만 보기">격리</button>
            </div>
            <label class="opacity-row">
              <span class="visually-hidden">${l.name} 투명도</span>
              <input type="range" min="0.05" max="1" step="0.05" value="${s.layerOpacity[l.id]}"
                data-action="opacity" data-layer="${l.id}" aria-label="${l.name} 투명도" ${on ? '' : 'disabled'} />
            </label>
          </li>`;
        }).join('')}
      </ul>
      <div class="rail-actions">
        ${s.isolated ? `<button type="button" class="ghost" data-action="clear-isolate">격리 해제 (전체 보기)</button>` : ''}
        <button type="button" class="ghost" data-action="reset">레이어 초기화</button>
      </div>
      <p class="hint">피부→근육→골격→장기 순서로 끄면 몸속이 보입니다.</p>
    `;
  }

  el.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    const action = t.dataset.action;
    const layer = t.dataset.layer as 'skin' | 'muscle' | 'skeleton' | 'organs' | 'vessels' | undefined;
    if (!action || !layer) return;
    if (action === 'toggle') store.toggleLayer(layer);
    else if (action === 'opacity') store.setOpacity(layer, Number(t.value));
  });
  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const layer = btn.dataset.layer as 'skin' | 'muscle' | 'skeleton' | 'organs' | 'vessels' | undefined;
    if (action === 'isolate' && layer) {
      store.isolate(store.get().isolated === layer ? null : layer);
    } else if (action === 'clear-isolate') {
      store.isolate(null);
    } else if (action === 'reset') {
      store.resetLayers();
    }
  });

  const unsubscribe = store.subscribe(() => {
    render();
    syncScene();
  });
  render();
  syncScene();
  return unsubscribe;
}
