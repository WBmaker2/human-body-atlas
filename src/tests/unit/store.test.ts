import { describe, expect, it } from 'vitest';
import {
  AtlasStore,
  initialState,
  isLayerEffectivelyVisible,
  isTourComplete,
  isolateLayer,
  nextTourIndex,
  toggleLayer,
} from '../../stores/atlasStore';

describe('layer store logic', () => {
  it('toggles visibility', () => {
    const s = toggleLayer(initialState(), 'skin');
    expect(s.layerVisible.skin).toBe(false);
    expect(toggleLayer(s, 'skin').layerVisible.skin).toBe(true);
  });

  it('isolate mode shows only one layer', () => {
    const s = isolateLayer(initialState(), 'organs');
    expect(isLayerEffectivelyVisible(s, 'organs')).toBe(true);
    expect(isLayerEffectivelyVisible(s, 'skin')).toBe(false);
    expect(isLayerEffectivelyVisible(isolateLayer(s, null), 'skin')).toBe(true);
  });

  it('store notifies subscribers', () => {
    const store = new AtlasStore();
    let calls = 0;
    const off = store.subscribe(() => {
      calls += 1;
    });
    store.toggleLayer('muscle');
    store.select('heart');
    expect(calls).toBe(2);
    off();
    store.toggleLayer('muscle');
    expect(calls).toBe(2);
  });
});

describe('tour logic', () => {
  it('wraps around 6 stops', () => {
    expect(nextTourIndex(5)).toBe(0);
    expect(nextTourIndex(0, -1)).toBe(5);
    expect(nextTourIndex(2)).toBe(3);
  });

  it('wraps per tour kind', () => {
    expect(nextTourIndex(4, 1, 'circulation')).toBe(0);
    expect(nextTourIndex(0, -1, 'breathing')).toBe(3);
    expect(isTourComplete(4, 'circulation')).toBe(true);
    expect(isTourComplete(3, 'circulation')).toBe(false);
    expect(isTourComplete(3, 'breathing')).toBe(true);
  });

  it('detects completion at last stop', () => {
    expect(isTourComplete(5)).toBe(true);
    expect(isTourComplete(4)).toBe(false);
  });

  it('switching tour kind resets progress', () => {
    const store = new AtlasStore();
    store.setTour(true, 4);
    store.setTourId('breathing');
    const s = store.get();
    expect(s.tourId).toBe('breathing');
    expect(s.tourIndex).toBe(0);
    expect(s.tourPlaying).toBe(false);
  });
});
