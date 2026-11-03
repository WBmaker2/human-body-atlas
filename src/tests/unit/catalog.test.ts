import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  HRA_CREDIT,
  MODEL_SOURCES,
  PROCEDURAL_ORGANS,
  computeFit,
  modelColorFor,
} from '../../anatomy/modelCatalog';

const MODELS_DIR = new URL('../../../public/models/', import.meta.url);

describe('model catalog attribution (CC BY 4.0 duty)', () => {
  it('lists 14 vendored HRA files with complete credit fields', () => {
    expect(MODEL_SOURCES).toHaveLength(14);
    for (const s of MODEL_SOURCES) {
      expect(s.file.endsWith('.glb')).toBe(true);
      expect(s.title.length).toBeGreaterThan(2);
      expect(s.version).toMatch(/^v\d/);
      expect(s.creators).toContain('Schlehlein');
      expect(s.sourceUrl.startsWith('https://purl.humanatlas.io/ref-organ/')).toBe(true);
      expect(s.license).toBe('CC BY 4.0');
      expect(s.licenseUrl).toBe('https://creativecommons.org/licenses/by/4.0/');
      expect(s.targetSize).toBeGreaterThan(0);
    }
  });

  it('ships every cataloged file under public/models/', () => {
    const onDisk = new Set(readdirSync(MODELS_DIR));
    for (const s of MODEL_SOURCES) {
      expect(existsSync(new URL(s.file, MODELS_DIR))).toBe(true);
      expect(onDisk.has(s.file)).toBe(true);
    }
  });

  it('names the library credit + changes note', () => {
    expect(HRA_CREDIT.library).toContain('Human Reference Atlas');
    expect(HRA_CREDIT.changesNote.length).toBeGreaterThan(10);
    expect(HRA_CREDIT.libraryUrl.startsWith('https://')).toBe(true);
  });

  it('keeps 4 procedural organs out of the GLB set', () => {
    expect([...PROCEDURAL_ORGANS]).toEqual(['mouth', 'esophagus', 'stomach', 'gallbladder']);
    const glbOrgans = new Set(MODEL_SOURCES.map((s) => s.organId));
    for (const id of PROCEDURAL_ORGANS) {
      expect(glbOrgans.has(id)).toBe(false);
    }
  });
});

describe('computeFit math', () => {
  it('scales longest side to target and centers on the wrapper origin', () => {
    const fit = computeFit([-0.1, 0, -0.1], [0.1, 0.4, 0.1], 1.0);
    expect(fit.scale).toBeCloseTo(2.5, 5);
    // Native center (0, 0.2, 0) shifted to origin: shift = -center * scale.
    expect(fit.shift[0]).toBeCloseTo(0, 5);
    expect(fit.shift[1]).toBeCloseTo(-0.5, 5);
    expect(fit.shift[2]).toBeCloseTo(0, 5);
  });

  it('top mode lands the bbox top-center on the wrapper origin', () => {
    const fit = computeFit([0, 0, 0], [0.2, 0.3, 0.1], 0.6, 'top');
    expect(fit.scale).toBeCloseTo(2, 5);
    // Top-center (0.1, 0.3, 0.05) * 2 = (0.2, 0.6, 0.1).
    expect(fit.shift).toEqual([-0.2, -0.6, -0.1]);
  });
});

describe('modelColorFor', () => {
  it('uses airway/ureter colors for helper structures', () => {
    expect(modelColorFor('trachea.glb', 'lungs')).toBe(modelColorFor('bronchus.glb', 'lungs'));
    expect(modelColorFor('ureter-l.glb', 'kidneys')).toBe(0xd9a05b);
    expect(modelColorFor('heart.glb', 'heart')).toBe(0xd62841);
  });
});
