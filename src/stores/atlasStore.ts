/** Tiny observable store (no external deps) — unit-testable pure logic lives here. */
import { LAYER_IDS, LAYERS, type LayerId } from '../anatomy/layers';
import { TOURS, type TourId } from '../anatomy/organs';

export interface AtlasState {
  layerVisible: Record<LayerId, boolean>;
  layerOpacity: Record<LayerId, number>;
  isolated: LayerId | null;
  selectedOrgan: string | null;
  circulationPlaying: boolean;
  circulationSpeed: number;
  breathingPlaying: boolean;
  breathingRate: number;
  tourPlaying: boolean;
  tourId: TourId;
  tourIndex: number;
  quizOpen: boolean;
}

export function initialState(): AtlasState {
  const layerVisible = {} as Record<LayerId, boolean>;
  const layerOpacity = {} as Record<LayerId, number>;
  for (const l of LAYERS) {
    layerVisible[l.id] = true;
    layerOpacity[l.id] = l.defaultOpacity;
  }
  return {
    layerVisible,
    layerOpacity,
    isolated: null,
    selectedOrgan: null,
    circulationPlaying: true,
    circulationSpeed: 1,
    breathingPlaying: true,
    breathingRate: 1,
    tourPlaying: false,
    tourId: 'digestion',
    tourIndex: 0,
    quizOpen: false,
  };
}

/** Effective visibility honoring isolate mode — pure, tested. */
export function isLayerEffectivelyVisible(s: AtlasState, id: LayerId): boolean {
  if (s.isolated !== null) return s.isolated === id;
  return s.layerVisible[id];
}

export function toggleLayer(s: AtlasState, id: LayerId): AtlasState {
  if (s.isolated === id) return { ...s, isolated: null };
  if (s.isolated !== null) return { ...s, isolated: null, layerVisible: { ...s.layerVisible, [id]: !s.layerVisible[id] } };
  return { ...s, layerVisible: { ...s.layerVisible, [id]: !s.layerVisible[id] } };
}

export function isolateLayer(s: AtlasState, id: LayerId | null): AtlasState {
  return { ...s, isolated: id };
}

export function nextTourIndex(current: number, dir: 1 | -1 = 1, tourId: TourId = 'digestion'): number {
  const n = TOURS[tourId].length;
  return ((current + dir) % n + n) % n;
}

export function isTourComplete(index: number, tourId: TourId = 'digestion'): boolean {
  return index >= TOURS[tourId].length - 1;
}

export type Listener = (s: AtlasState) => void;

export class AtlasStore {
  private state: AtlasState = initialState();
  private listeners = new Set<Listener>();

  get(): AtlasState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private set(next: AtlasState): void {
    this.state = next;
    for (const fn of this.listeners) fn(next);
  }

  toggleLayer(id: LayerId): void {
    this.set(toggleLayer(this.state, id));
  }

  setOpacity(id: LayerId, v: number): void {
    this.set({ ...this.state, layerOpacity: { ...this.state.layerOpacity, [id]: v } });
  }

  isolate(id: LayerId | null): void {
    this.set(isolateLayer(this.state, id));
  }

  select(id: string | null): void {
    this.set({ ...this.state, selectedOrgan: id });
  }

  setCirculation(playing: boolean, speed?: number): void {
    this.set({
      ...this.state,
      circulationPlaying: playing,
      circulationSpeed: speed ?? this.state.circulationSpeed,
    });
  }

  setBreathing(playing: boolean, rate?: number): void {
    this.set({
      ...this.state,
      breathingPlaying: playing,
      breathingRate: rate ?? this.state.breathingRate,
    });
  }

  setTour(playing: boolean, index?: number): void {
    this.set({
      ...this.state,
      tourPlaying: playing,
      tourIndex: index ?? this.state.tourIndex,
    });
  }

  setTourId(id: TourId): void {
    this.set({ ...this.state, tourId: id, tourIndex: 0, tourPlaying: false });
  }

  setQuizOpen(open: boolean): void {
    this.set({ ...this.state, quizOpen: open });
  }

  resetLayers(): void {
    const fresh = initialState();
    this.set({
      ...this.state,
      layerVisible: fresh.layerVisible,
      layerOpacity: fresh.layerOpacity,
      isolated: null,
    });
  }

  layerIds(): LayerId[] {
    return LAYER_IDS;
  }
}
