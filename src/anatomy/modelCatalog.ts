/**
 * Real-organ model catalog — HuBMAP Human Reference Atlas (HRA)
 * 3D Reference Object Library, CC BY 4.0.
 *
 * Each entry maps one vendored GLB (public/models/*.glb) to an in-app organ:
 * target display size + placement anchor. Identity rotation is correct for all
 * files (verified from part names: +X = body-left, +Y = up, +Z = anterior —
 * e.g. ascending colon sits at -X, frontal lobe at +Z).
 *
 * License duty (CC BY 4.0): credit creators + source link + license link and
 * note the changes (rescaled, recolored for education). Rendered in-app by
 * the attribution dialog; full text in THIRD-PARTY-LICENSES.md.
 */

export interface ModelSource {
  /** In-app organ id (mouth/esophagus/stomach/gallbladder stay procedural). */
  organId: string;
  /** File under public/models/. */
  file: string;
  /** HRA object title, e.g. "Heart, Male". */
  title: string;
  /** Dataset version, e.g. "v1.3". */
  version: string;
  creators: string;
  /** Version-agnostic HRA page for this object. */
  sourceUrl: string;
  license: 'CC BY 4.0';
  licenseUrl: string;
  /** Target bounding-box longest side, in scene units. */
  targetSize: number;
  /** Where the fitted model lands. Center-mapped unless anchorMode is 'top'. */
  anchor: [number, number, number];
  anchorMode?: 'center' | 'top';
  /** Split meshes into left/right subgroups (lungs, for breathing anim). */
  splitSides?: boolean;
}

export const HRA_CREDIT = {
  library: 'Human Reference Atlas (HRA) 3D Reference Object Library',
  publisher: 'HuBMAP Consortium, Indiana University',
  citation:
    'Kristen Browne, Heidi Schlehlein, Bruce W. Herr II, Ellen Quardokus, Andreas Bueckle, Katy Börner. HuBMAP CCF 3D Reference Object Library.',
  sourceData: 'Visible Human Project, U.S. National Library of Medicine (brain: Allen Human Reference Atlas, Ding et al. 2016)',
  libraryUrl: 'https://humanatlas.io/3d-reference-library',
  changesNote: '교육용으로 크기 조정·회전 없는 배치·단일 색상 재도색됨 (Resized, placed without rotation, recolored with single educational colors).',
} as const;

const CC = 'CC BY 4.0' as const;
const CC_URL = 'https://creativecommons.org/licenses/by/4.0/';
const BROWNE_SCHLEHLEIN = 'Kristen Browne, Heidi Schlehlein';

export const MODEL_SOURCES: ModelSource[] = [
  {
    organId: 'bladder',
    file: 'bladder.glb',
    title: 'Urinary Bladder, Male',
    version: 'v1.2',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/urinary-bladder-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.38,
    anchor: [0, -1.1, 0.28],
  },
  {
    organId: 'lungs',
    file: 'bronchus.glb',
    title: 'Main Bronchus, Male',
    version: 'v1.1',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/main-bronchus-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.3,
    anchor: [0, 2.42, 0.14],
  },
  {
    organId: 'kidneys',
    file: 'ureter-r.glb',
    title: 'Ureter (Right), Male',
    version: 'v1.2',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/ureter-male-right',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.5,
    anchor: [-0.47, 0.38, -0.19],
    anchorMode: 'top',
  },
  {
    organId: 'kidneys',
    file: 'ureter-l.glb',
    title: 'Ureter (Left), Male',
    version: 'v1.2',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/ureter-male-left',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.5,
    anchor: [0.47, 0.38, -0.19],
    anchorMode: 'top',
  },
  {
    organId: 'large-intestine',
    file: 'large-intestine.glb',
    title: 'Large Intestine, Male',
    version: 'v1.3',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/large-intestine-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.3,
    anchor: [0.02, -0.25, 0.24],
  },
  {
    organId: 'small-intestine',
    file: 'small-intestine.glb',
    title: 'Small Intestine, Male',
    version: 'v1.2',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/small-intestine-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.05,
    anchor: [0.05, -0.2, 0.26],
  },
  {
    organId: 'liver',
    file: 'liver.glb',
    title: 'Liver, Male',
    version: 'v1.2',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/liver-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.0,
    anchor: [-0.28, 1.0, 0.12],
  },
  {
    organId: 'lungs',
    file: 'trachea.glb',
    title: 'Trachea, Male',
    version: 'v1.1',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/trachea-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.63,
    anchor: [0, 2.98, 0.3],
    anchorMode: 'top',
  },
  {
    organId: 'kidneys',
    file: 'kidney-l.glb',
    title: 'Kidney (Left), Male',
    version: 'v1.3',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/kidney-male-left',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.42,
    anchor: [0.52, 0.5, -0.2],
  },
  {
    organId: 'kidneys',
    file: 'kidney-r.glb',
    title: 'Kidney (Right), Male',
    version: 'v1.3',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/kidney-male-right',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.42,
    anchor: [-0.52, 0.5, -0.2],
  },
  {
    organId: 'pancreas',
    file: 'pancreas.glb',
    title: 'Pancreas, Male',
    version: 'v1.3',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/pancreas-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.5,
    anchor: [0.05, 0.62, 0.05],
  },
  {
    organId: 'heart',
    file: 'heart.glb',
    title: 'Heart, Male',
    version: 'v1.3',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/heart-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.8,
    anchor: [0.18, 1.8, 0.35],
  },
  {
    organId: 'lungs',
    file: 'lung.glb',
    title: 'Lung, Male',
    version: 'v1.4',
    creators: BROWNE_SCHLEHLEIN,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/lung-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 1.15,
    anchor: [0, 2.12, 0.08],
    splitSides: true,
  },
  {
    organId: 'brain',
    file: 'brain.glb',
    title: 'Brain, Male',
    version: 'v1.4',
    creators: `${BROWNE_SCHLEHLEIN} (based on Allen Human Reference Atlas, Ding et al. 2016)`,
    sourceUrl: 'https://purl.humanatlas.io/ref-organ/brain-male',
    license: CC,
    licenseUrl: CC_URL,
    targetSize: 0.72,
    anchor: [0, 3.62, 0],
  },
];

/** Display color per organ for the recolored educational look. */
export const MODEL_COLORS: Record<string, number> = {
  brain: 0xf2a7bb,
  lungs: 0xf0879b,
  trachea: 0xe8c8c8,
  heart: 0xd62841,
  liver: 0x97352b,
  'small-intestine': 0xf5cf8e,
  'large-intestine': 0xc97b4a,
  kidneys: 0x8f2b33,
  pancreas: 0xf2cf6b,
  bladder: 0xe3b95c,
};

export function modelColorFor(file: string, organId: string): number {
  if (file.startsWith('trachea') || file.startsWith('bronchus')) return MODEL_COLORS.trachea;
  if (file.startsWith('ureter')) return 0xd9a05b;
  return MODEL_COLORS[organId] ?? 0xcccccc;
}

export interface FitResult {
  scale: number;
  /** Inner offset so the reference point lands on the anchor. */
  shift: [number, number, number];
}

type Vec3 = [number, number, number];

/**
 * Pure fit math (unit-tested): uniform scale from native bbox longest side to
 * targetSize, then shift so the bbox center ('center') or bbox top-center
 * ('top') lands on the wrapper origin. The caller positions the wrapper at
 * the anchor, completing the fit.
 */
export function computeFit(
  nativeMin: Vec3,
  nativeMax: Vec3,
  targetSize: number,
  mode: 'center' | 'top' = 'center',
): FitResult {
  const sizes: Vec3 = [nativeMax[0] - nativeMin[0], nativeMax[1] - nativeMin[1], nativeMax[2] - nativeMin[2]];
  const longest = Math.max(sizes[0], sizes[1], sizes[2], 1e-6);
  const scale = targetSize / longest;
  const ref: Vec3 =
    mode === 'top'
      ? [(nativeMin[0] + nativeMax[0]) / 2, nativeMax[1], (nativeMin[2] + nativeMax[2]) / 2]
      : [
          (nativeMin[0] + nativeMax[0]) / 2,
          (nativeMin[1] + nativeMax[1]) / 2,
          (nativeMin[2] + nativeMax[2]) / 2,
        ];
  return { scale, shift: [-ref[0] * scale, -ref[1] * scale, -ref[2] * scale] };
}

export const PROCEDURAL_ORGANS = ['mouth', 'esophagus', 'stomach', 'gallbladder'] as const;
