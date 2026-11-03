/**
 * Parametric anatomy engine v2 — copyright-safe, built in code (no GLB).
 * Primitive stacking → profile lathes + variable-radius tubes + vertex sculpting,
 * so each organ reads as itself (heart with aortic arch, J-shaped stomach,
 * serpentine small intestine, two-lobe brain, bean kidneys with ureters…).
 * Stylized concept models for grades 5-9 (not medically exact).
 */
import * as THREE from 'three';
import type { LayerId } from './layers';

/* ---------------- engine primitives ---------------- */

function sstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Tube with per-point radius along a CatmullRom path.
 * The workhorse of the anatomy engine: gut, vessels, airways, ureters…
 */
export function taperedTube(
  points: THREE.Vector3[],
  radiusAt: (t: number) => number,
  tubularSegments = 40,
  radialSegments = 10,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const ring = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = i / tubularSegments;
    const center = curve.getPointAt(t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];
    const r = Math.max(0.005, radiusAt(t));
    for (let j = 0; j <= radialSegments; j += 1) {
      const a = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      ring.set(
        center.x + r * (cos * normal.x + sin * binormal.x),
        center.y + r * (cos * normal.y + sin * binormal.y),
        center.z + r * (cos * normal.z + sin * binormal.z),
      );
      positions.push(ring.x, ring.y, ring.z);
      uvs.push(t, j / radialSegments);
    }
  }
  for (let i = 0; i < tubularSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Reshape vertices in place (tapers, dents, flattening), then re-smooth normals. */
export function sculpt(geo: THREE.BufferGeometry, fn: (p: THREE.Vector3) => void): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    fn(v);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Surface of revolution from an (radius, height) profile — heart, bladder, gallbladder… */
export function latheOrgan(profile: [number, number][], segments = 18): THREE.LatheGeometry {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

const V3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/* ---------------- materials ---------------- */

function organMat(color: number, roughness = 0.48): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.6,
    transparent: true,
    opacity: 1,
  });
}

function stdMat(color: number, roughness = 0.7): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
    transparent: true,
    opacity: 1,
  });
}

function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  layerId: LayerId,
  organId?: string,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  m.userData.layerId = layerId;
  m.userData.synthetic = true; // procedural fallback — replaced when a real GLB arrives
  if (organId) m.userData.organId = organId;
  return m;
}

/** World anchors for each organ — used for camera focus + HTML fallback picking. */
export const ORGAN_ANCHORS: Record<string, [number, number, number]> = {
  brain: [0, 3.62, 0],
  mouth: [0, 3.13, 0.58],
  esophagus: [0, 2.0, 0.15],
  lungs: [-0.42, 2.12, 0.1],
  heart: [0.18, 1.8, 0.35],
  liver: [-0.32, 1.02, 0.15],
  stomach: [-0.45, 0.9, 0.3],
  'small-intestine': [0.05, -0.2, 0.28],
  'large-intestine': [0.55, -0.2, 0.24],
  kidneys: [-0.52, 0.5, -0.22],
  pancreas: [0.12, 0.62, 0.02],
  gallbladder: [-0.28, 0.78, 0.32],
  bladder: [0, -1.12, 0.28],
};

/* ---------------- skin ---------------- */

export function buildSkin(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'skin';
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xe8b08a,
    roughness: 0.35,
    clearcoat: 0.5,
    transparent: true,
    opacity: 0.35,
  });

  const torso = mesh(new THREE.CapsuleGeometry(0.95, 2.6, 4, 12), skin, [0, 0.9, -0.05], 'skin');
  torso.scale.set(1, 1, 0.75);
  g.add(torso);

  const neck = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.45, 10), skin, [0, 3.05, -0.02], 'skin');
  g.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.62, 14, 12), skin, [0, 3.62, 0], 'skin');
  head.scale.set(0.95, 1.05, 0.98);
  g.add(head);

  for (const side of [-1, 1]) {
    const arm = mesh(
      new THREE.CapsuleGeometry(0.22, 1.9, 3, 10),
      skin,
      [side * 1.35, 1.3, -0.1],
      'skin',
    );
    arm.rotation.z = side * -0.12;
    g.add(arm);
    const leg = mesh(
      new THREE.CapsuleGeometry(0.28, 2.0, 3, 10),
      skin,
      [side * 0.42, -2.6, -0.1],
      'skin',
    );
    g.add(leg);
  }
  return g;
}

/* ---------------- muscle ---------------- */

export function buildMuscle(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'muscle';
  const muscle = stdMat(0xb03a2e, 0.65);

  // Pectorals — small, lateral + flat so the heart & lungs stay visible.
  for (const side of [-1, 1]) {
    const pec = mesh(
      new THREE.CapsuleGeometry(0.21, 0.22, 4, 10),
      muscle,
      [side * 0.72, 2.32, 0.26],
      'muscle',
    );
    pec.rotation.z = side * -0.3;
    pec.scale.set(1, 1, 0.45);
    g.add(pec);

    const delt = mesh(new THREE.SphereGeometry(0.2, 10, 8), muscle, [side * 1.32, 2.12, -0.05], 'muscle');
    g.add(delt);

    const oblique = mesh(
      new THREE.CapsuleGeometry(0.1, 0.85, 3, 8),
      muscle,
      [side * 0.6, 0.35, 0.12],
      'muscle',
    );
    oblique.rotation.z = side * 0.14;
    g.add(oblique);

    const bicep = mesh(
      new THREE.CapsuleGeometry(0.17, 0.9, 3, 8),
      muscle,
      [side * 1.28, 1.75, 0.05],
      'muscle',
    );
    const thigh = mesh(
      new THREE.CapsuleGeometry(0.24, 1.1, 3, 8),
      muscle,
      [side * 0.42, -2.2, 0.08],
      'muscle',
    );
    g.add(bicep, thigh);
  }

  // Rectus abdominis — one slim central column so the gut shows on both sides.
  const abs = mesh(new THREE.CapsuleGeometry(0.15, 0.85, 3, 10), muscle, [0, -0.1, 0.26], 'muscle');
  abs.scale.set(1, 1, 0.5);
  g.add(abs);
  return g;
}

/* ---------------- skeleton ---------------- */

export function buildSkeleton(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'skeleton';
  const bone = stdMat(0xe9e2d4, 0.55);

  const skull = mesh(new THREE.SphereGeometry(0.45, 12, 10), bone, [0, 3.62, 0], 'skeleton');
  skull.scale.set(0.95, 1.12, 1);
  g.add(skull);
  const jaw = mesh(new THREE.BoxGeometry(0.3, 0.16, 0.26), bone, [0, 3.3, 0.14], 'skeleton');
  g.add(jaw);

  const spine = mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.4, 8), bone, [0, 0.9, -0.3], 'skeleton');
  g.add(spine);

  // Ribcage — closed tilted rings + sternum + clavicles.
  for (let i = 0; i < 5; i += 1) {
    const rib = mesh(
      new THREE.TorusGeometry(0.6 - i * 0.04, 0.045, 6, 22),
      bone,
      [0, 2.5 - i * 0.24, 0],
      'skeleton',
    );
    rib.rotation.x = Math.PI / 2 + 0.12;
    rib.scale.set(1, 1, 0.78);
    g.add(rib);
  }
  const sternum = mesh(new THREE.BoxGeometry(0.1, 0.8, 0.06), bone, [0, 2.02, 0.52], 'skeleton');
  g.add(sternum);
  for (const side of [-1, 1]) {
    const clavicle = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 6), bone, [side * 0.38, 2.44, 0.4], 'skeleton');
    clavicle.rotation.z = Math.PI / 2 - side * 0.15;
    g.add(clavicle);
  }

  const pelvis = mesh(new THREE.TorusGeometry(0.42, 0.09, 6, 14), bone, [0, -1.0, -0.2], 'skeleton');
  pelvis.rotation.x = Math.PI / 2;
  pelvis.scale.set(1.2, 1, 0.8);
  g.add(pelvis);

  for (const side of [-1, 1]) {
    const femur = mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 1.8, 7),
      bone,
      [side * 0.42, -2.4, -0.2],
      'skeleton',
    );
    const humerus = mesh(
      new THREE.CylinderGeometry(0.06, 0.055, 1.1, 7),
      bone,
      [side * 1.32, 1.75, -0.2],
      'skeleton',
    );
    const forearm = mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.8, 7),
      bone,
      [side * 1.36, 0.75, -0.18],
      'skeleton',
    );
    g.add(femur, humerus, forearm);
  }
  return g;
}

/* ---------------- organs ---------------- */

function buildLung(side: -1 | 1): THREE.Mesh {
  const geo = sculpt(new THREE.SphereGeometry(0.42, 16, 14), (p) => {
    const ny = p.y / 0.42;
    const taper = 1 - 0.38 * sstep(0.05, 1, ny); // narrow apex
    const widen = 1 + 0.12 * sstep(-0.2, -1, ny); // broad base
    p.x *= taper * widen;
    p.z *= taper * 0.82;
    // Flatten the medial (inner) face against the heart.
    if (side < 0 && p.x > 0.08) p.x = 0.08 + (p.x - 0.08) * 0.45;
    if (side > 0 && p.x < -0.08) p.x = -0.08 + (p.x + 0.08) * 0.45;
  });
  const lung = mesh(geo, organMat(0xf0879b), [side * 0.42, 2.12, 0.08], 'organs', 'lungs');
  lung.scale.set(1, 1.35, 1);
  lung.name = side < 0 ? 'lungL' : 'lungR';
  lung.userData.baseScale = [1, 1.35, 1];
  return lung;
}

function buildHeart(): THREE.Group {
  const heart = new THREE.Group();
  heart.position.set(0.18, 1.72, 0.35);
  heart.rotation.z = 0.28; // apex tips toward the body's left
  heart.scale.setScalar(1.12);
  const red = organMat(0xd62841);

  // Ventricle mass — rounded top, pointed apex.
  const ventricle = mesh(
    latheOrgan([
      [0.001, -0.34],
      [0.14, -0.32],
      [0.22, -0.22],
      [0.27, -0.08],
      [0.28, 0.06],
      [0.24, 0.18],
      [0.15, 0.27],
      [0.001, 0.3],
    ]),
    red,
    [0, 0, 0],
    'organs',
    'heart',
  );
  heart.add(ventricle);

  // Atrium bulge.
  const atrium = mesh(new THREE.SphereGeometry(0.17, 12, 10), organMat(0xe2506a), [0.13, 0.2, -0.04], 'organs', 'heart');
  atrium.scale.set(1, 0.95, 0.9);
  heart.add(atrium);

  // Aortic arch — the candy-cane every student recognizes.
  heart.add(
    mesh(
      taperedTube(
        [V3(0.02, 0.28, 0), V3(0.05, 0.5, -0.04), V3(-0.05, 0.62, -0.12), V3(-0.16, 0.52, -0.18), V3(-0.18, 0.28, -0.2)],
        (t) => 0.085 - 0.02 * t,
        24,
        10,
      ),
      organMat(0xe63950),
      [0, 0, 0],
      'organs',
      'heart',
    ),
  );

  // Pulmonary trunk (deoxygenated → bluish) and vena-cava stub.
  heart.add(
    mesh(
      taperedTube([V3(0.06, 0.26, 0.06), V3(-0.08, 0.4, 0.02), V3(-0.2, 0.44, -0.04)], () => 0.055, 12, 8),
      organMat(0x7aa2ff),
      [0, 0, 0],
      'organs',
      'heart',
    ),
  );
  heart.add(
    mesh(
      taperedTube([V3(0.18, 0.24, -0.02), V3(0.22, 0.48, -0.05)], () => 0.065, 8, 8),
      organMat(0x4a8ff7),
      [0, 0, 0],
      'organs',
      'heart',
    ),
  );

  heart.name = 'heart';
  heart.userData.layerId = 'organs';
  heart.userData.organId = 'heart';
  heart.userData.baseScale = 1.12;
  return heart;
}

export function buildOrgans(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'organs';
  const brainMat = organMat(0xf2a7bb);

  // Brain — two hemispheres (visible fissure) + cerebellum + brainstem.
  for (const side of [-1, 1]) {
    const hemi = mesh(new THREE.SphereGeometry(0.3, 14, 12), brainMat, [side * 0.17, 3.64, -0.02], 'organs', 'brain');
    hemi.scale.set(1, 0.95, 1.2);
    g.add(hemi);
  }
  const cerebellum = mesh(new THREE.SphereGeometry(0.16, 10, 8), brainMat, [0, 3.4, -0.3], 'organs', 'brain');
  cerebellum.scale.set(1.2, 0.8, 1);
  g.add(cerebellum);
  g.add(
    mesh(
      taperedTube([V3(0, 3.44, -0.22), V3(0, 3.22, -0.18)], (t) => 0.07 - 0.015 * t, 8, 8),
      brainMat,
      [0, 0, 0],
      'organs',
      'brain',
    ),
  );

  // Mouth cavity + tongue.
  g.add(mesh(new THREE.BoxGeometry(0.36, 0.18, 0.22), organMat(0x7a1f2b, 0.6), [0, 3.13, 0.55], 'organs', 'mouth'));
  const tongue = mesh(new THREE.SphereGeometry(0.12, 10, 8), organMat(0xd96a7f), [0, 3.1, 0.6], 'organs', 'mouth');
  tongue.scale.set(1.2, 0.5, 1);
  g.add(tongue);

  // Esophagus — slim tube down to the stomach.
  g.add(
    mesh(
      taperedTube(
        [V3(0, 3.05, 0.42), V3(0, 2.4, 0.1), V3(-0.1, 1.7, 0.18), V3(-0.18, 1.35, 0.28)],
        () => 0.075,
        24,
        8,
      ),
      organMat(0xe8a0ae),
      [0, 0, 0],
      'organs',
      'esophagus',
    ),
  );

  // Trachea + bronchi (counted as lungs for cards/quiz).
  const airwayMat = organMat(0xe8c8c8, 0.6);
  g.add(
    mesh(
      taperedTube([V3(0, 3.02, 0.32), V3(0, 2.72, 0.22), V3(0, 2.5, 0.16)], (t) => 0.105 - 0.015 * t, 16, 10),
      airwayMat,
      [0, 0, 0],
      'organs',
      'lungs',
    ),
  );
  for (const side of [-1, 1] as const) {
    g.add(
      mesh(
        taperedTube(
          [V3(0, 2.5, 0.16), V3(side * 0.18, 2.4, 0.13), V3(side * 0.32, 2.28, 0.11)],
          (t) => 0.065 - 0.02 * t,
          12,
          8,
        ),
        airwayMat,
        [0, 0, 0],
        'organs',
        'lungs',
      ),
    );
  }

  // Lungs + diaphragm.
  g.add(buildLung(-1), buildLung(1));
  const diaphragm = mesh(
    new THREE.SphereGeometry(0.72, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.4),
    organMat(0xd94f6a),
    [0, 1.45, 0.05],
    'organs',
    'lungs',
  );
  diaphragm.rotation.x = Math.PI;
  diaphragm.name = 'diaphragm';
  diaphragm.userData.baseY = 1.45;
  g.add(diaphragm);

  g.add(buildHeart());

  // Liver — big flattened dome, body's right.
  const liverGeo = sculpt(new THREE.SphereGeometry(0.5, 18, 14), (p) => {
    if (p.y < 0) p.y *= 0.5;
  });
  const liver = mesh(liverGeo, organMat(0x97352b, 0.55), [-0.32, 1.02, 0.12], 'organs', 'liver');
  liver.scale.set(1.15, 0.62, 0.78);
  g.add(liver);

  // Gallbladder — pear tucked under the liver's front edge.
  g.add(
    mesh(
      latheOrgan([
        [0.001, -0.12],
        [0.07, -0.1],
        [0.1, -0.02],
        [0.07, 0.08],
        [0.001, 0.1],
      ]),
      organMat(0x86b06a),
      [-0.28, 0.78, 0.32],
      'organs',
      'gallbladder',
    ),
  );

  // Stomach — J-shape, swelling mid-way.
  g.add(
    mesh(
      taperedTube(
        [
          V3(-0.18, 1.32, 0.3),
          V3(-0.5, 1.15, 0.32),
          V3(-0.62, 0.85, 0.3),
          V3(-0.5, 0.6, 0.3),
          V3(-0.15, 0.55, 0.28),
          V3(0.12, 0.62, 0.26),
        ],
        (t) => 0.13 + 0.06 * Math.sin(Math.PI * Math.min(1, t * 1.15)),
        40,
        10,
      ),
      organMat(0xf0a05a),
      [0, 0, 0],
      'organs',
      'stomach',
    ),
  );

  // Pancreas — slim leaf behind the stomach.
  const pancreas = mesh(new THREE.CapsuleGeometry(0.085, 0.4, 3, 10), organMat(0xf2cf6b), [0.12, 0.62, 0.02], 'organs', 'pancreas');
  pancreas.rotation.z = Math.PI / 2 - 0.15;
  g.add(pancreas);

  // Small intestine — serpentine stack.
  const gutPts: THREE.Vector3[] = [V3(0.12, 0.62, 0.26), V3(0.3, 0.48, 0.28)];
  const rows = 8;
  for (let r = 0; r < rows; r += 1) {
    const y = 0.32 - r * 0.14;
    const leftFirst = r % 2 === 0;
    gutPts.push(V3(leftFirst ? -0.38 : 0.42, y, 0.28));
    gutPts.push(V3(leftFirst ? 0.42 : -0.38, y, 0.28));
  }
  gutPts.push(V3(0.5, -0.82, 0.24)); // → cecum
  g.add(
    mesh(taperedTube(gutPts, () => 0.068, 120, 8), organMat(0xf5cf8e), [0, 0, 0], 'organs', 'small-intestine'),
  );

  // Large intestine — ascending → transverse → descending → sigmoid.
  g.add(
    mesh(
      taperedTube(
        [
          V3(0.5, -0.85, 0.24),
          V3(0.55, -0.4, 0.24),
          V3(0.55, 0.1, 0.24),
          V3(0.5, 0.34, 0.24),
          V3(0.1, 0.4, 0.24),
          V3(-0.3, 0.4, 0.24),
          V3(-0.5, 0.32, 0.24),
          V3(-0.52, -0.2, 0.24),
          V3(-0.5, -0.7, 0.24),
          V3(-0.3, -0.88, 0.24),
          V3(0.0, -0.95, 0.24),
          V3(0.05, -1.08, 0.22),
        ],
        (t) => 0.105 - 0.02 * t,
        80,
        10,
      ),
      organMat(0xc97b4a),
      [0, 0, 0],
      'organs',
      'large-intestine',
    ),
  );

  // Kidneys — beans with a hilar dent + ureters down to the bladder.
  for (const side of [-1, 1]) {
    const dir = side > 0 ? -1 : 1; // toward the midline
    const bean = sculpt(new THREE.SphereGeometry(0.17, 12, 10), (p) => {
      if (p.x * dir > 0.06 && Math.abs(p.y) < 0.09) {
        p.x -= dir * 0.05 * (1 - Math.abs(p.y) / 0.09);
      }
    });
    const kidney = mesh(bean, organMat(0x8f2b33, 0.55), [side * 0.52, 0.5, -0.22], 'organs', 'kidneys');
    kidney.scale.set(0.85, 1.25, 0.7);
    g.add(kidney);
    g.add(
      mesh(
        taperedTube(
          [V3(side * 0.48, 0.35, -0.2), V3(side * 0.3, -0.3, -0.02), V3(side * 0.08, -1.05, 0.22)],
          () => 0.028,
          24,
          6,
        ),
        organMat(0xd9a05b),
        [0, 0, 0],
        'organs',
        'kidneys',
      ),
    );
  }

  // Bladder — rounded sac above the pelvis.
  g.add(
    mesh(
      latheOrgan([
        [0.001, -0.17],
        [0.12, -0.14],
        [0.17, -0.02],
        [0.14, 0.1],
        [0.05, 0.16],
        [0.001, 0.17],
      ]),
      organMat(0xe3b95c),
      [0, -1.12, 0.28],
      'organs',
      'bladder',
    ),
  );

  return g;
}

/* ---------------- vessels & nerves ---------------- */

export function buildVessels(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'vessels';
  const artery = organMat(0xd62841);
  const vein = organMat(0x4a8ff7);
  const nerveMat = stdMat(0xf5d76e, 0.5);

  // Aorta — arch over the heart, trunk down the back.
  g.add(
    mesh(
      taperedTube(
        [
          V3(-0.07, 1.95, 0.22),
          V3(-0.05, 2.3, 0.05),
          V3(0.0, 2.5, 0.0),
          V3(0.0, 2.2, -0.08),
          V3(0.0, 1.4, -0.08),
          V3(0.0, 0.2, -0.08),
          V3(0.0, -1.0, -0.08),
        ],
        (t) => 0.08 - 0.025 * t,
        48,
        8,
      ),
      artery,
      [0, 0, 0],
      'vessels',
    ),
  );

  // Vena cava — blue return highway beside the aorta.
  g.add(
    mesh(
      taperedTube(
        [V3(0.32, 2.0, 0.3), V3(0.24, 1.5, 0.0), V3(0.2, 0.5, -0.05), V3(0.16, -1.0, -0.05)],
        () => 0.07,
        32,
        8,
      ),
      vein,
      [0, 0, 0],
      'vessels',
    ),
  );

  // Carotids (red) + jugulars (blue) up the neck.
  for (const side of [-1, 1]) {
    g.add(
      mesh(
        taperedTube([V3(side * 0.12, 2.45, 0.05), V3(side * 0.13, 3.05, 0.22)], () => 0.032, 12, 6),
        artery,
        [0, 0, 0],
        'vessels',
      ),
    );
    g.add(
      mesh(
        taperedTube([V3(side * 0.2, 2.4, 0.0), V3(side * 0.2, 3.0, 0.2)], () => 0.038, 12, 6),
        vein,
        [0, 0, 0],
        'vessels',
      ),
    );
  }

  // Pulmonary artery (to right lung) + pulmonary vein (back, oxygenated).
  g.add(
    mesh(
      taperedTube([V3(0.3, 1.95, 0.4), V3(0.55, 2.1, 0.25), V3(0.5, 2.15, 0.12)], () => 0.05, 16, 8),
      organMat(0x7aa2ff),
      [0, 0, 0],
      'vessels',
    ),
  );
  g.add(
    mesh(
      taperedTube([V3(-0.4, 2.2, 0.15), V3(-0.1, 2.0, 0.3), V3(0.1, 1.9, 0.38)], () => 0.045, 16, 8),
      organMat(0xff6b81),
      [0, 0, 0],
      'vessels',
    ),
  );

  // Limb veins.
  for (const side of [-1, 1]) {
    g.add(
      mesh(
        taperedTube(
          [V3(side * 0.6, 1.9, 0.1), V3(side * 1.1, 1.4, 0.0), V3(side * 1.32, 0.6, -0.05)],
          () => 0.045,
          12,
          6,
        ),
        vein,
        [0, 0, 0],
        'vessels',
      ),
    );
    g.add(
      mesh(
        taperedTube(
          [V3(side * 0.2, -0.9, -0.05), V3(side * 0.38, -1.8, -0.1), V3(side * 0.42, -3.2, -0.1)],
          () => 0.05,
          12,
          6,
        ),
        vein,
        [0, 0, 0],
        'vessels',
      ),
    );
  }

  // Nerves — slim spinal cord + branches.
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.6, 6), nerveMat, [0, 0.9, -0.42], 'vessels'));
  for (let i = 0; i < 5; i += 1) {
    for (const side of [-1, 1]) {
      const branch = mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.7, 5),
        nerveMat,
        [side * 0.4, 1.9 - i * 0.55, -0.42],
        'vessels',
      );
      branch.rotation.z = Math.PI / 2;
      g.add(branch);
    }
  }
  return g;
}

export function buildLayer(id: LayerId): THREE.Group {
  switch (id) {
    case 'skin':
      return buildSkin();
    case 'muscle':
      return buildMuscle();
    case 'skeleton':
      return buildSkeleton();
    case 'organs':
      return buildOrgans();
    case 'vessels':
      return buildVessels();
  }
}

/** Blood loop for F3 flow particles: heart → lungs → heart → body → heart. */
export function circulationCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      V3(0.18, 1.85, 0.38),
      V3(-0.2, 2.1, 0.25),
      V3(-0.42, 2.15, 0.12),
      V3(0.18, 1.85, 0.38),
      V3(0.05, 1.2, 0.0),
      V3(0.0, -0.6, 0.0),
      V3(0.42, -2.4, -0.1),
      V3(0.1, -0.9, 0.0),
      V3(0.18, 1.85, 0.38),
    ],
    true,
  );
}

/** Gut path for digestion dots: mouth → esophagus → stomach → intestines. */
export function gutCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    V3(0, 3.13, 0.58),
    V3(0, 2.4, 0.12),
    V3(-0.2, 1.3, 0.3),
    V3(-0.55, 0.9, 0.3),
    V3(-0.1, 0.4, 0.28),
    V3(0.05, -0.3, 0.28),
    V3(0.4, -0.85, 0.24),
    V3(-0.3, -0.9, 0.24),
  ]);
}
