/**
 * BodyScene — Three.js stage: layer visibility/opacity lerp, organ raycast
 * (visible layers only), circulation + gut flow particles, breathing &
 * heartbeat animation, keyframed digestion camera tour.
 */
import * as THREE from 'three';
import { LAYER_IDS, type LayerId } from '../anatomy/layers';
import { TOURS, type TourId, type TourStop } from '../anatomy/organs';
import { buildLayer, circulationCurve, gutCurve } from '../anatomy/builders';

export interface SceneCallbacks {
  onSelect: (organId: string | null) => void;
  onTourIndex?: (index: number) => void;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

interface CameraTween {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  t: number;
  dur: number;
  after?: () => void;
}

const HOME_POS = new THREE.Vector3(0.6, 1.3, 7.2);
const HOME_TARGET = new THREE.Vector3(0, 1.1, 0);

export class BodyScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private groups = new Map<LayerId, THREE.Group>();
  private visible = new Map<LayerId, boolean>();
  private opacityTarget = new Map<LayerId, number>();
  private raf = 0;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private downAt: [number, number] | null = null;

  // Orbit state (custom minimal orbit — no extra deps).
  private orbitTarget = HOME_TARGET.clone();
  private azimuth = 0.12;
  private polar = 1.18;
  private radius = 7.4;
  private tween: CameraTween | null = null;

  // Animations
  private circulationPlaying = true;
  private circulationSpeed = 1;
  private breathingPlaying = true;
  private breathingRate = 1;
  private digestionActive = false;
  private blood: THREE.Points | null = null;
  private bloodT: number[] = [];
  private bloodCurve = circulationCurve();
  private gut: THREE.Points | null = null;
  private gutT: number[] = [];
  private gutPath = gutCurve();
  private heart: THREE.Object3D | null = null;
  private lungs: THREE.Object3D[] = [];
  private diaphragm: THREE.Object3D | null = null;
  private breathPhase = 0;

  // Tour
  private tourPlaying = false;
  private tourStops: TourStop[] = TOURS.digestion;
  private tourIndex = 0;
  private tourTimer = 0;
  readonly reducedMotion: boolean;

  private onSelect: (id: string | null) => void;
  private onTourIndex?: (index: number) => void;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, cb: SceneCallbacks) {
    this.onSelect = cb.onSelect;
    this.onTourIndex = cb.onTourIndex;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.scene.add(new THREE.HemisphereLight(0xfff2f4, 0x2a1418, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 6, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x4aa8ff, 0.5);
    rim.position.set(-4, 2, -3);
    this.scene.add(rim);

    // Soft stage disc.
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 40),
      new THREE.MeshBasicMaterial({ color: 0x2a1418, transparent: true, opacity: 0.9 }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -3.75;
    this.scene.add(disc);

    for (const id of LAYER_IDS) {
      const group = buildLayer(id);
      this.groups.set(id, group);
      this.visible.set(id, true);
      this.opacityTarget.set(id, id === 'skin' ? 0.35 : 1);
      this.scene.add(group);
    }

    this.heart = this.scene.getObjectByName('heart') ?? null;
    this.lungs = [this.scene.getObjectByName('lungL'), this.scene.getObjectByName('lungR')].filter(
      (o): o is THREE.Object3D => o !== undefined,
    );
    this.diaphragm = this.scene.getObjectByName('diaphragm') ?? null;
    this.buildParticles();
    this.attachInput();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    const parent = canvas.parentElement;
    if (parent) this.resizeObserver.observe(parent);

    this.applyOrbit();
    this.loop();
  }

  /* ---------------- public API ---------------- */

  setLayerVisible(id: LayerId, v: boolean): void {
    this.visible.set(id, v);
  }

  setLayerOpacity(id: LayerId, o: number): void {
    this.opacityTarget.set(id, o);
  }

  setIsolated(id: LayerId | null): void {
    for (const layer of LAYER_IDS) {
      this.visible.set(layer, id === null ? true : layer === id);
    }
  }

  setSelected(id: string | null): void {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (!m || !('emissive' in m)) return;
      const oid = (mesh.userData.organId as string | undefined) ?? undefined;
      if (id !== null && oid === id) {
        m.emissive.setHex(0x5a1a26);
      } else if (mesh.userData.baseEmissive !== undefined) {
        m.emissive.setHex(mesh.userData.baseEmissive as number);
      } else {
        mesh.userData.baseEmissive = m.emissive.getHex();
      }
    });
  }

  setCirculation(playing: boolean, speed: number): void {
    this.circulationPlaying = playing;
    this.circulationSpeed = speed;
    if (this.blood) this.blood.visible = playing;
  }

  setBreathing(playing: boolean, rate: number): void {
    this.breathingPlaying = playing;
    this.breathingRate = rate;
  }

  setDigestion(active: boolean): void {
    this.digestionActive = active;
    if (this.gut) this.gut.visible = true;
  }

  getTourIndex(): number {
    return this.tourIndex;
  }

  isTourPlaying(): boolean {
    return this.tourPlaying;
  }

  /** Switch tour kind (digestion/circulation/breathing) — resets progress. */
  setTourKind(kind: TourId): void {
    this.tourStops = TOURS[kind];
    this.tourIndex = 0;
    this.tourPlaying = false;
    this.tourTimer = 0;
    this.tween = null;
    this.digestionActive = false;
  }

  startTour(): void {
    if (this.gut) this.gut.visible = true;
    if (this.reducedMotion) {
      // Reduced motion: no auto camera moves — jump straight to first stop.
      this.tourPlaying = false;
      this.goToStop(0);
      return;
    }
    this.tourPlaying = true;
    this.tourTimer = 0;
    this.goToStop(this.tourIndex);
  }

  stopTour(): void {
    this.tourPlaying = false;
    this.digestionActive = false;
    this.tween = null;
    this.flyTo(HOME_POS, HOME_TARGET, this.reducedMotion ? 0 : 1.2);
  }

  goToStop(i: number): void {
    const n = this.tourStops.length;
    this.tourIndex = ((i % n) + n) % n;
    const stop = this.tourStops[this.tourIndex];
    const pos = new THREE.Vector3(...stop.pos);
    const target = new THREE.Vector3(...stop.target);
    if (this.reducedMotion) {
      this.orbitTarget.copy(target);
      this.radius = pos.distanceTo(target);
      this.azimuth = Math.atan2(pos.x - target.x, pos.z - target.z);
      this.polar = Math.acos((pos.y - target.y) / this.radius);
      this.applyOrbit();
    } else {
      this.flyTo(pos, target, 1.6);
    }
    if (stop.organId) {
      this.onSelect(stop.organId);
    }
    this.onTourIndex?.(this.tourIndex);
    this.tourTimer = 0;
  }

  nextStop(): void {
    this.goToStop(this.tourIndex + 1);
  }

  prevStop(): void {
    this.goToStop(this.tourIndex - 1);
  }

  focusOrgan(anchors: Record<string, [number, number, number]>, organId: string | null): void {
    if (!organId || this.reducedMotion) return;
    const a = anchors[organId];
    if (!a) return;
    const target = new THREE.Vector3(...a);
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.orbitTarget).normalize();
    const pos = target.clone().addScaledVector(dir, 4.2);
    pos.y = Math.max(pos.y, target.y + 0.6);
    this.flyTo(pos, target, 1.1);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose();
      }
    });
    this.renderer.dispose();
  }

  /* ---------------- internals ---------------- */

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur: number): void {
    if (dur <= 0) {
      this.orbitTarget.copy(target);
      this.radius = pos.distanceTo(target);
      this.azimuth = Math.atan2(pos.x - target.x, pos.z - target.z);
      this.polar = THREE.MathUtils.clamp(Math.acos((pos.y - target.y) / this.radius), 0.2, 2.6);
      this.applyOrbit();
      return;
    }
    this.tween = {
      fromPos: this.camera.position.clone(),
      toPos: pos.clone(),
      fromTarget: this.orbitTarget.clone(),
      toTarget: target.clone(),
      t: 0,
      dur,
    };
  }

  private applyOrbit(): void {
    const { azimuth, polar, radius, orbitTarget } = this;
    this.camera.position.set(
      orbitTarget.x + radius * Math.sin(polar) * Math.sin(azimuth),
      orbitTarget.y + radius * Math.cos(polar),
      orbitTarget.z + radius * Math.sin(polar) * Math.cos(azimuth),
    );
    this.camera.lookAt(orbitTarget);
  }

  private buildParticles(): void {
    // Blood cells — red spheres along the circulation loop.
    const NB = 90;
    const bloodGeo = new THREE.BufferGeometry();
    const bloodPos = new Float32Array(NB * 3);
    this.bloodT = Array.from({ length: NB }, (_, i) => i / NB);
    bloodGeo.setAttribute('position', new THREE.BufferAttribute(bloodPos, 3));
    this.blood = new THREE.Points(
      bloodGeo,
      new THREE.PointsMaterial({ color: 0xff5d73, size: 0.09, transparent: true, opacity: 0.95, sizeAttenuation: true }),
    );
    this.scene.add(this.blood);

    // Digestion dots — golden crumbs along the gut.
    const NG = 26;
    const gutGeo = new THREE.BufferGeometry();
    const gutPos = new Float32Array(NG * 3);
    this.gutT = Array.from({ length: NG }, (_, i) => i / NG);
    gutGeo.setAttribute('position', new THREE.BufferAttribute(gutPos, 3));
    this.gut = new THREE.Points(
      gutGeo,
      new THREE.PointsMaterial({ color: 0xffd166, size: 0.08, transparent: true, opacity: 0.95, sizeAttenuation: true }),
    );
    this.scene.add(this.gut);
  }

  private attachInput(): void {
    const el = this.canvas;
    el.style.touchAction = 'none';
    const pointers = new Map<number, [number, number]>();
    let dragging = false;
    let pinching = false;
    let pinchDist = 0;
    let last: [number, number] = [0, 0];
    let moved = 0;

    const pinchDistance = (): number => {
      const pts = [...pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    };

    el.addEventListener('pointerdown', (e) => {
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size === 2) {
        // Second finger down → pinch zoom, cancel rotate/tap.
        pinching = true;
        dragging = false;
        pinchDist = pinchDistance();
        this.downAt = null;
        this.tween = null;
      } else if (pointers.size === 1) {
        dragging = true;
        last = [e.clientX, e.clientY];
        moved = 0;
        this.downAt = [e.clientX, e.clientY];
        el.setPointerCapture(e.pointerId);
        this.tween = null;
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinching && pointers.size >= 2) {
        const d = pinchDistance();
        if (pinchDist > 0 && d > 0) {
          this.tween = null;
          this.radius = THREE.MathUtils.clamp(this.radius * (pinchDist / d), 3, 14);
          this.applyOrbit();
        }
        pinchDist = d;
        return;
      }
      if (!dragging || pointers.size !== 1) return;
      const dx = e.clientX - last[0];
      const dy = e.clientY - last[1];
      last = [e.clientX, e.clientY];
      moved += Math.abs(dx) + Math.abs(dy);
      this.azimuth -= dx * 0.006;
      this.polar = THREE.MathUtils.clamp(this.polar - dy * 0.005, 0.25, 2.7);
      this.applyOrbit();
    });
    const endPointer = (e: PointerEvent): void => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinching = false;
      if (pointers.size === 0) {
        dragging = false;
        const down = this.downAt;
        this.downAt = null;
        if (!down) return;
        const dist = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
        if (dist < 6 && moved < 6) this.pick(e);
      } else if (pointers.size === 1) {
        // Back to one finger — re-anchor so the view doesn't jump, no tap.
        const remaining = [...pointers.values()][0];
        last = [remaining[0], remaining[1]];
        moved = 999;
        dragging = true;
        this.downAt = null;
      }
    };
    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.tween = null;
      this.radius = THREE.MathUtils.clamp(this.radius + e.deltaY * 0.005, 3, 14);
      this.applyOrbit();
    }, { passive: false });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.onSelect(null);
    });
  }

  private pick(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    for (const hit of hits) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        const layer = obj.userData.layerId as LayerId | undefined;
        if (layer && this.visible.get(layer) !== true) break;
        const organId = obj.userData.organId as string | undefined;
        if (organId) {
          this.onSelect(organId);
          return;
        }
        obj = obj.parent;
      }
    }
    this.onSelect(null);
  }

  private resize(): void {
    const parent = this.canvas.parentElement;
    const w = parent?.clientWidth ?? 640;
    const h = Math.max(300, parent?.clientHeight ?? 420);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // Layer opacity lerp.
    for (const [id, group] of this.groups) {
      const target = this.visible.get(id) ? (this.opacityTarget.get(id) ?? 1) : 0;
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const m = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (!m || !('opacity' in m)) return;
        const base = id === 'skin' ? target : target;
        m.opacity += (base - m.opacity) * Math.min(1, dt * 6);
        m.transparent = m.opacity < 0.999;
        m.depthWrite = m.opacity > 0.6;
      });
      if (target <= 0.01) {
        // Check current opacity via first mesh.
        group.visible = false;
      } else {
        group.visible = true;
      }
    }

    // Heartbeat — always beats; faster when circulation plays.
    if (this.heart) {
      const rate = this.circulationPlaying ? 2.6 * this.circulationSpeed : 1.4;
      const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * rate)), 6);
      const s = 1 + beat * 0.12;
      this.heart.scale.set(s, s, s);
    }

    // Breathing — lungs swell, diaphragm bobs.
    if (this.breathingPlaying && !this.reducedMotion) {
      this.breathPhase += dt * 1.4 * this.breathingRate;
    }
    const breath = Math.sin(this.breathPhase);
    for (const lung of this.lungs) {
      const s = 1 + breath * 0.07;
      lung.scale.set(0.85 * s, 1.25 * (1 + breath * 0.1), 0.75 * s);
    }
    if (this.diaphragm) {
      this.diaphragm.position.y = 1.5 + breath * 0.09;
    }

    // Blood flow.
    if (this.blood && this.circulationPlaying) {
      const pos = this.blood.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < this.bloodT.length; i += 1) {
        this.bloodT[i] = (this.bloodT[i] + dt * 0.06 * this.circulationSpeed) % 1;
        const p = this.bloodCurve.getPointAt(this.bloodT[i]);
        pos.setXYZ(i, p.x, p.y, p.z);
      }
      pos.needsUpdate = true;
    }

    // Gut flow — drifts slowly, faster during digestion tour.
    if (this.gut) {
      const pos = this.gut.geometry.getAttribute('position') as THREE.BufferAttribute;
      const speed = this.digestionActive ? 0.09 : 0.02;
      for (let i = 0; i < this.gutT.length; i += 1) {
        this.gutT[i] = (this.gutT[i] + dt * speed) % 1;
        const p = this.gutPath.getPointAt(this.gutT[i]);
        pos.setXYZ(i, p.x, p.y, p.z);
      }
      pos.needsUpdate = true;
    }

    // Camera tween.
    if (this.tween) {
      this.tween.t += dt / this.tween.dur;
      const k = easeInOutCubic(Math.min(1, this.tween.t));
      this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, k);
      this.orbitTarget.lerpVectors(this.tween.fromTarget, this.tween.toTarget, k);
      this.camera.lookAt(this.orbitTarget);
      if (this.tween.t >= 1) {
        const tw = this.tween;
        this.tween = null;
        // Sync orbit state to the landed camera.
        const off = new THREE.Vector3().subVectors(this.camera.position, this.orbitTarget);
        this.radius = off.length();
        this.azimuth = Math.atan2(off.x, off.z);
        this.polar = THREE.MathUtils.clamp(Math.acos(off.y / this.radius), 0.2, 2.7);
        tw.after?.();
      }
    }

    // Tour auto-advance.
    if (this.tourPlaying && !this.reducedMotion) {
      this.tourTimer += dt;
      if (this.tourTimer > 4.2 && !this.tween) {
        if (this.tourIndex >= this.tourStops.length - 1) {
          this.tourPlaying = false;
          this.onTourIndex?.(this.tourIndex);
        } else {
          this.goToStop(this.tourIndex + 1);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };
}
