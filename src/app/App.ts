/** AtlasView composition: 3D center + layer rail left + card right + tour bar + quiz. */
import { ORGAN_ANCHORS } from '../anatomy/builders';
import { ORGANS } from '../anatomy/organs';
import { BodyScene } from '../scene/BodyScene';
import { AtlasStore } from '../stores/atlasStore';
import { renderLayerRail } from '../ui/LayerRail';
import { renderOrganCard } from '../ui/OrganCard';
import { renderQuiz } from '../ui/Quiz';
import { renderTourBar } from '../ui/TourBar';

export class App {
  private scene: BodyScene | null = null;
  private store = new AtlasStore();

  constructor(private root: HTMLElement) {
    this.root.innerHTML = `
      <a class="skip-link" href="#main">본문으로 건너뛰기</a>
      <header class="topbar">
        <h1>Human Body Atlas <span class="sub">인체 3D 아틀라스 · 초5~중3</span></h1>
        <div class="top-actions">
          <button type="button" id="quiz-open" class="ghost">라벨 퀴즈 풀기</button>
        </div>
      </header>
      <main id="main" class="layout">
        <aside class="rail" id="rail" aria-label="레이어 조절"></aside>
        <section class="stage" aria-label="3D 인체 장면">
          <div class="canvas-wrap">
            <canvas id="scene" tabindex="0" aria-label="인체 3D 모형. 한 손가락으로 회전, 두 손가락으로 확대. 장기 선택은 아래 장기 버튼을 이용하세요."></canvas>
          </div>
          <p class="caption" id="scene-caption" role="status" aria-live="polite">
            드래그로 돌리고 두 손가락으로 확대하세요. 장기를 클릭하면 설명 카드가 열립니다.
          </p>
          <div class="organ-quick" aria-label="장기 바로가기">
            <span class="quick-title">장기 바로가기:</span>
            ${ORGANS.map((o) => `<button type="button" data-focus="${o.id}">${o.name}</button>`).join('')}
          </div>
        </section>
        <aside class="panel" id="organ-panel" aria-label="장기 설명 카드" aria-live="polite"></aside>
      </main>
      <section class="tourbar" id="tourbar" aria-label="애니메이션과 투어 조절"></section>
      <section class="quiz" id="quiz" hidden aria-label="라벨 퀴즈"></section>
      <footer class="footer">
        <small>교육용 개념 모형으로 실제 해부 구조와 다를 수 있습니다 · 절차적 자체 모델(저작권 안전) · 소화 순서: 입→식도→위→소장→대장</small>
      </footer>
    `;

    const canvas = this.root.querySelector<HTMLCanvasElement>('#scene');
    const rail = this.root.querySelector<HTMLElement>('#rail');
    const panel = this.root.querySelector<HTMLElement>('#organ-panel');
    const tourbar = this.root.querySelector<HTMLElement>('#tourbar');
    const quiz = this.root.querySelector<HTMLElement>('#quiz');
    const caption = this.root.querySelector<HTMLElement>('#scene-caption');
    if (!canvas || !rail || !panel || !tourbar || !quiz || !caption) return;

    this.scene = new BodyScene(canvas, {
      onSelect: (id) => {
        this.store.select(id);
        this.scene?.setSelected(id);
        if (caption) {
          caption.textContent = id
            ? `${this.organName(id)}을(를) 선택했습니다. 오른쪽 카드에서 설명을 확인하세요.`
            : '드래그로 돌리고 두 손가락으로 확대하세요. 장기를 클릭하면 설명 카드가 열립니다.';
        }
      },
      onTourIndex: (index) => {
        const playing = this.scene?.isTourPlaying() ?? false;
        this.store.setTour(playing, index);
        if (caption) caption.textContent = `투어 ${index + 1}정거장으로 이동했습니다.`;
      },
    });

    renderLayerRail(rail, this.store, this.scene);
    renderOrganCard(panel, this.store);
    renderTourBar(tourbar, this.store, this.scene);
    renderQuiz(quiz, this.store);

    // Organ quick buttons — keyboard/precision fallback + gentle camera focus.
    this.root.querySelector('.organ-quick')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-focus]');
      const id = btn?.dataset.focus;
      if (!id) return;
      this.store.select(id);
      this.scene?.setSelected(id);
      this.scene?.focusOrgan(ORGAN_ANCHORS, id);
      if (caption) caption.textContent = `${this.organName(id)}으로 카메라가 이동했습니다.`;
    });

    this.root.querySelector('#quiz-open')?.addEventListener('click', () => {
      this.store.setQuizOpen(true);
      this.root.querySelector('.quiz')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    if (this.scene.reducedMotion && caption) {
      caption.textContent += ' (움직임 줄이기 설정이 켜져 있어 카메라 자동 이동이 꺼졌습니다.)';
    }
  }

  private organName(id: string): string {
    return ORGANS.find((o) => o.id === id)?.name ?? id;
  }
}
