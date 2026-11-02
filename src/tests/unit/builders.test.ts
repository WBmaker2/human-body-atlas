import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  ORGAN_ANCHORS,
  buildOrgans,
  latheOrgan,
  sculpt,
  taperedTube,
} from '../../anatomy/builders';
import { ORGAN_IDS } from '../../anatomy/organs';

const V3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

describe('taperedTube engine primitive', () => {
  it('builds the expected vertex grid', () => {
    const geo = taperedTube([V3(0, 0, 0), V3(0, 1, 0), V3(0, 2, 0)], () => 0.1, 10, 6);
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    expect(pos.count).toBe((10 + 1) * (6 + 1));
    expect(geo.getIndex()?.count).toBeGreaterThan(0);
    geo.computeBoundingSphere();
    expect(geo.boundingSphere?.radius ?? 0).toBeGreaterThan(0.5);
  });

  it('widens where radiusAt is larger', () => {
    const geo = taperedTube([V3(0, 0, 0), V3(0, 1, 0), V3(0, 2, 0)], (t) => 0.05 + 0.15 * t, 20, 8);
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    expect(box).toBeDefined();
    // Max radius end (top, y≈2) must bulge wider than the start.
    expect(box!.max.x - box!.min.x).toBeGreaterThan(0.3);
  });
});

describe('latheOrgan + sculpt', () => {
  it('makes a closed-ish solid from a profile', () => {
    const geo = latheOrgan([
      [0.001, -0.3],
      [0.2, 0],
      [0.001, 0.3],
    ]);
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    expect(pos.count).toBeGreaterThan(0);
  });

  it('sculpt flattens vertices as instructed', () => {
    const geo = sculpt(new THREE.SphereGeometry(1, 8, 6), (p) => {
      if (p.y < 0) p.y *= 0.5;
    });
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    expect(Math.abs(box.min.y)).toBeCloseTo(0.5, 1);
    expect(box.max.y).toBeCloseTo(1, 1);
  });
});

describe('organ meshes', () => {
  it('covers every organ id with a pickable mesh', () => {
    const group = buildOrgans();
    const found = new Set<string>();
    group.traverse((obj) => {
      const id = obj.userData.organId as string | undefined;
      if (id) found.add(id);
    });
    for (const id of ORGAN_IDS) {
      expect(found.has(id)).toBe(true);
    }
  });

  it('has a world anchor for every organ', () => {
    for (const id of ORGAN_IDS) {
      expect(ORGAN_ANCHORS[id]).toBeDefined();
      expect(ORGAN_ANCHORS[id]).toHaveLength(3);
    }
  });
});
