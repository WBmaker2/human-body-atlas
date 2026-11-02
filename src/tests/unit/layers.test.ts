import { describe, expect, it } from 'vitest';
import { LAYERS, layerById } from '../../anatomy/layers';

describe('layers', () => {
  it('has exactly 5 layers in peel order', () => {
    expect(LAYERS.map((l) => l.id)).toEqual(['skin', 'muscle', 'skeleton', 'organs', 'vessels']);
  });

  it('resolves bilingual names', () => {
    expect(layerById('skin').name).toBe('피부');
    expect(layerById('vessels').nameEn).toBe('Nerves & Vessels');
  });

  it('throws on unknown layer', () => {
    expect(() => layerById('hair' as never)).toThrow();
  });
});
