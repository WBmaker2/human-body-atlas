/**
 * Procedural low-poly anatomy — copyright-safe, built in code (no GLB).
 * Stylized concept models for grades 5-9 (not medically exact).
 */
import * as THREE from 'three';
import type { LayerId } from './layers';

function mat(color: number, opts: { opacity?: number; emissive?: number } = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.85,
    metalness: 0.02,
    transparent: true,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
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
  if (organId) m.userData.organId = organId;
  return m;
}

/** World anchors for each organ — used for camera focus + HTML fallback picking. */
export const ORGAN_ANCHORS: Record<string, [number, number, number]> = {
  brain: [0, 3.6, 0],
  mouth: [0, 3.15, 0.55],
  esophagus: [0, 2.2, 0.1],
  lungs: [-0.55, 2.2, 0.15],
  heart: [0.25, 1.9, 0.35],
  liver: [-0.45, 1.15, 0.25],
  stomach: [-0.35, 0.95, 0.3],
  'small-intestine': [0.1, -0.4, 0.25],
  'large-intestine': [0.1, -0.35, 0.15],
  kidneys: [0.55, 0.7, -0.2],
  pancreas: [0.2, 0.7, 0.05],
  gallbladder: [-0.45, 0.82, 0.35],
  bladder: [0, -1.15, 0.25],
};

/* ---------------- skin ---------------- */

export function buildSkin(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'skin';
  const skin = mat(0xe8b08a, { opacity: 0.35 });

  const torso = mesh(new THREE.CapsuleGeometry(0.95, 2.6, 4, 10), skin, [0, 0.9, -0.15], 'skin');
  torso.scale.set(1, 1, 0.62);
  g.add(torso);

  const head = mesh(new THREE.SphereGeometry(0.62, 10, 8), skin, [0, 3.6, 0], 'skin');
  g.add(head);

  for (const side of [-1, 1]) {
    const arm = mesh(
      new THREE.CapsuleGeometry(0.22, 1.9, 3, 8),
      skin,
      [side * 1.35, 1.3, -0.1],
      'skin',
    );
    arm.rotation.z = side * -0.12;
    g.add(arm);
    const leg = mesh(
      new THREE.CapsuleGeometry(0.28, 2.0, 3, 8),
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
  const muscle = mat(0xc0392b, {});

  const chestL = mesh(new THREE.CapsuleGeometry(0.3, 1.1, 3, 7), muscle, [-0.42, 1.9, 0.42], 'muscle');
  chestL.rotation.z = 0.35;
  const chestR = mesh(new THREE.CapsuleGeometry(0.3, 1.1, 3, 7), muscle, [0.42, 1.9, 0.42], 'muscle');
  chestR.rotation.z = -0.35;
  g.add(chestL, chestR);

  for (let i = 0; i < 3; i += 1) {
    const ab = mesh(
      new THREE.BoxGeometry(0.55, 0.34, 0.3),
      muscle,
      [0, 0.75 - i * 0.45, 0.5],
      'muscle',
    );
    g.add(ab);
  }

  for (const side of [-1, 1]) {
    const bicep = mesh(
      new THREE.CapsuleGeometry(0.17, 0.9, 3, 7),
      muscle,
      [side * 1.28, 1.75, 0.05],
      'muscle',
    );
    const thigh = mesh(
      new THREE.CapsuleGeometry(0.24, 1.1, 3, 7),
      muscle,
      [side * 0.42, -2.2, 0.08],
      'muscle',
    );
    g.add(bicep, thigh);
  }
  return g;
}

/* ---------------- skeleton ---------------- */

export function buildSkeleton(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'skeleton';
  const bone = mat(0xece5d8, {});

  const skull = mesh(new THREE.SphereGeometry(0.45, 8, 6), bone, [0, 3.6, 0], 'skeleton');
  skull.scale.set(1, 1.15, 1);
  g.add(skull);

  const spine = mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.4, 7), bone, [0, 0.9, -0.3], 'skeleton');
  g.add(spine);

  for (let i = 0; i < 4; i += 1) {
    const rib = mesh(
      new THREE.TorusGeometry(0.62 - i * 0.04, 0.05, 5, 12, Math.PI),
      bone,
      [0, 2.35 - i * 0.32, 0],
      'skeleton',
    );
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = Math.PI;
    rib.scale.set(1, 1, 0.7);
    g.add(rib);
  }

  const pelvis = mesh(new THREE.TorusGeometry(0.42, 0.09, 5, 10), bone, [0, -1.0, -0.2], 'skeleton');
  pelvis.rotation.x = Math.PI / 2;
  pelvis.scale.set(1.2, 1, 0.8);
  g.add(pelvis);

  for (const side of [-1, 1]) {
    const femur = mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 1.8, 6),
      bone,
      [side * 0.42, -2.4, -0.2],
      'skeleton',
    );
    const humerus = mesh(
      new THREE.CylinderGeometry(0.06, 0.055, 1.7, 6),
      bone,
      [side * 1.32, 1.3, -0.2],
      'skeleton',
    );
    g.add(femur, humerus);
  }
  return g;
}

/* ---------------- organs ---------------- */

export function buildOrgans(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'organs';

  // Brain — bumpy sphere (icosahedron detail 1, flattened).
  const brain = mesh(
    new THREE.IcosahedronGeometry(0.42, 1),
    mat(0xf5a3b8, { emissive: 0x2a0a12 }),
    [0, 3.6, 0],
    'organs',
    'brain',
  );
  brain.scale.set(1, 0.85, 1.05);
  g.add(brain);

  // Mouth — small dark-red cavity box on the face.
  const mouth = mesh(
    new THREE.BoxGeometry(0.34, 0.16, 0.2),
    mat(0x7a1f2b, {}),
    [0, 3.15, 0.55],
    'organs',
    'mouth',
  );
  g.add(mouth);

  // Esophagus — vertical tube mouth → stomach.
  const esoCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.1, 0.4),
    new THREE.Vector3(0, 2.4, 0.15),
    new THREE.Vector3(-0.1, 1.6, 0.2),
    new THREE.Vector3(-0.3, 1.1, 0.28),
  ]);
  g.add(
    mesh(new THREE.TubeGeometry(esoCurve, 12, 0.09, 6, false), mat(0xf2b8c6, {}), [0, 0, 0], 'organs', 'esophagus'),
  );

  // Lungs — two flattened spheres.
  for (const side of [-1, 1]) {
    const lung = mesh(
      new THREE.SphereGeometry(0.42, 8, 6),
      mat(0xff9db0, {}),
      [side * 0.5, 2.15, 0.1],
      'organs',
      'lungs',
    );
    lung.scale.set(0.85, 1.25, 0.75);
    lung.name = side < 0 ? 'lungL' : 'lungR';
    g.add(lung);
  }

  // Diaphragm — dome sheet under lungs (breathing anim scales it).
  const diaphragm = mesh(
    new THREE.SphereGeometry(0.7, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2.4),
    mat(0xd94f6a, {}),
    [0, 1.5, 0],
    'organs',
    'lungs',
  );
  diaphragm.rotation.x = Math.PI;
  diaphragm.name = 'diaphragm';
  g.add(diaphragm);

  // Heart — tilted icosahedron + cone tip.
  const heart = new THREE.Group();
  heart.position.set(0.25, 1.85, 0.35);
  heart.rotation.z = -0.3;
  const heartBody = mesh(new THREE.IcosahedronGeometry(0.3, 1), mat(0xe63950, { emissive: 0x3d0510 }), [0, 0.08, 0], 'organs', 'heart');
  const heartTip = mesh(new THREE.ConeGeometry(0.2, 0.35, 7), mat(0xe63950, {}), [0, -0.25, 0], 'organs', 'heart');
  heartTip.rotation.x = Math.PI;
  heart.add(heartBody, heartTip);
  heart.name = 'heart';
  heart.userData.layerId = 'organs';
  heart.userData.organId = 'heart';
  g.add(heart);

  // Liver — flattened wedge on the right side of the viewer (body's right = -x? keep simple).
  const liver = mesh(
    new THREE.SphereGeometry(0.42, 8, 6),
    mat(0x8e3b2f, {}),
    [-0.5, 1.1, 0.22],
    'organs',
    'liver',
  );
  liver.scale.set(1.15, 0.6, 0.8);
  g.add(liver);

  // Stomach — bean via lathe-ish: use a curved tube with fat radius.
  const stomachCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 1.25, 0.3),
    new THREE.Vector3(-0.62, 1.0, 0.32),
    new THREE.Vector3(-0.5, 0.6, 0.3),
    new THREE.Vector3(-0.1, 0.55, 0.28),
  ]);
  g.add(
    mesh(new THREE.TubeGeometry(stomachCurve, 12, 0.2, 7, false), mat(0xf4a259, {}), [0, 0, 0], 'organs', 'stomach'),
  );

  // Small intestine — coiled tube.
  const coilPts: THREE.Vector3[] = [];
  for (let i = 0; i < 14; i += 1) {
    const t = i / 13;
    coilPts.push(
      new THREE.Vector3(
        Math.sin(t * Math.PI * 5) * 0.32 + 0.1,
        0.25 - t * 1.05,
        0.25 + Math.cos(t * Math.PI * 3) * 0.06,
      ),
    );
  }
  const coil = new THREE.CatmullRomCurve3(coilPts);
  g.add(
    mesh(new THREE.TubeGeometry(coil, 48, 0.09, 6, false), mat(0xf7d08a, {}), [0, 0, 0], 'organs', 'small-intestine'),
  );

  // Large intestine — frame around the coil.
  const framePts = [
    new THREE.Vector3(-0.35, 0.3, 0.22),
    new THREE.Vector3(0.55, 0.3, 0.22),
    new THREE.Vector3(0.6, -0.7, 0.22),
    new THREE.Vector3(0.35, -0.95, 0.22),
    new THREE.Vector3(-0.3, -0.95, 0.22),
    new THREE.Vector3(-0.45, -0.6, 0.22),
  ];
  const frame = new THREE.CatmullRomCurve3(framePts);
  g.add(
    mesh(new THREE.TubeGeometry(frame, 32, 0.13, 7, false), mat(0xc97b4a, {}), [0, 0, 0], 'organs', 'large-intestine'),
  );

  // Kidneys — two beans at the back.
  for (const side of [-1, 1]) {
    const kidney = mesh(
      new THREE.SphereGeometry(0.16, 7, 5),
      mat(0x9b2226, {}),
      [side * 0.55, 0.7, -0.2],
      'organs',
      'kidneys',
    );
    kidney.scale.set(0.8, 1.2, 0.7);
    g.add(kidney);
  }

  // Pancreas — slim leaf tucked behind the stomach.
  const pancreas = mesh(
    new THREE.CapsuleGeometry(0.09, 0.38, 3, 7),
    mat(0xf2c14e, {}),
    [0.2, 0.7, 0.05],
    'organs',
    'pancreas',
  );
  pancreas.rotation.z = 1.25;
  g.add(pancreas);

  // Gallbladder — small green pouch under the liver.
  const gallbladder = mesh(
    new THREE.SphereGeometry(0.11, 7, 5),
    mat(0x7fb069, {}),
    [-0.45, 0.82, 0.35],
    'organs',
    'gallbladder',
  );
  gallbladder.scale.set(1, 1.3, 1);
  g.add(gallbladder);

  // Bladder — balloon-like sac above the pelvis.
  const bladder = mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    mat(0xe9c46a, {}),
    [0, -1.15, 0.25],
    'organs',
    'bladder',
  );
  bladder.scale.set(1, 1.15, 0.9);
  g.add(bladder);

  return g;
}

/* ---------------- vessels & nerves ---------------- */

export function buildVessels(): THREE.Group {
  const g = new THREE.Group();
  g.userData.layerId = 'vessels';
  const vesselMat = mat(0x4aa8ff, { opacity: 0.95 });
  const nerveMat = mat(0xffe066, { opacity: 0.95 });

  // Aorta-ish trunk: heart → down through torso.
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 1.9, 0.3),
    new THREE.Vector3(0.1, 1.2, 0.1),
    new THREE.Vector3(0.05, 0.2, 0.0),
    new THREE.Vector3(0.0, -1.0, -0.05),
  ]);
  g.add(mesh(new THREE.TubeGeometry(aortaCurve, 20, 0.07, 6, false), vesselMat, [0, 0, 0], 'vessels'));

  // Pulmonary loop: heart → lungs.
  const lungLoop = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 1.9, 0.3),
    new THREE.Vector3(-0.2, 2.2, 0.25),
    new THREE.Vector3(-0.55, 2.2, 0.15),
  ]);
  g.add(mesh(new THREE.TubeGeometry(lungLoop, 12, 0.05, 6, false), mat(0xff5d73, {}), [0, 0, 0], 'vessels'));

  // Arm + leg vessels.
  for (const side of [-1, 1]) {
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.6, 1.9, 0.1),
      new THREE.Vector3(side * 1.1, 1.4, 0.0),
      new THREE.Vector3(side * 1.32, 0.6, -0.05),
    ]);
    g.add(mesh(new THREE.TubeGeometry(armCurve, 10, 0.045, 5, false), vesselMat, [0, 0, 0], 'vessels'));
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.2, -0.9, -0.05),
      new THREE.Vector3(side * 0.38, -1.8, -0.1),
      new THREE.Vector3(side * 0.42, -3.2, -0.1),
    ]);
    g.add(mesh(new THREE.TubeGeometry(legCurve, 10, 0.05, 5, false), vesselMat, [0, 0, 0], 'vessels'));
  }

  // Nerves — spinal cord + branches (yellow).
  const cord = mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.6, 5), nerveMat, [0, 0.9, -0.42], 'vessels');
  g.add(cord);
  for (let i = 0; i < 5; i += 1) {
    for (const side of [-1, 1]) {
      const branch = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4), nerveMat, [side * 0.4, 1.9 - i * 0.55, -0.42], 'vessels');
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
      new THREE.Vector3(0.25, 1.9, 0.35),
      new THREE.Vector3(-0.3, 2.2, 0.25),
      new THREE.Vector3(-0.55, 2.2, 0.15),
      new THREE.Vector3(0.25, 1.9, 0.35),
      new THREE.Vector3(0.1, 1.2, 0.1),
      new THREE.Vector3(0.0, -0.6, 0.0),
      new THREE.Vector3(0.42, -2.4, -0.1),
      new THREE.Vector3(0.1, -0.9, 0.0),
      new THREE.Vector3(0.25, 1.9, 0.35),
    ],
    true,
  );
}

/** Gut path for digestion dots: mouth → esophagus → stomach → intestines. */
export function gutCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.15, 0.55),
    new THREE.Vector3(0, 2.4, 0.15),
    new THREE.Vector3(-0.3, 1.1, 0.3),
    new THREE.Vector3(-0.55, 0.8, 0.3),
    new THREE.Vector3(0.1, 0.0, 0.25),
    new THREE.Vector3(0.1, -0.8, 0.22),
    new THREE.Vector3(-0.4, -0.9, 0.22),
  ]);
}
