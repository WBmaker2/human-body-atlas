/** 5 body layers — F1. KO/EN bilingual metadata. */

export type LayerId = 'skin' | 'muscle' | 'skeleton' | 'organs' | 'vessels';

export interface LayerInfo {
  id: LayerId;
  name: string;
  nameEn: string;
  description: string;
  color: number;
  defaultOpacity: number;
}

export const LAYERS: LayerInfo[] = [
  {
    id: 'skin',
    name: '피부',
    nameEn: 'Skin',
    description: '몸을 감싸는 가장 바깥 층',
    color: 0xe8b08a,
    defaultOpacity: 0.35,
  },
  {
    id: 'muscle',
    name: '근육',
    nameEn: 'Muscle',
    description: '몸을 움직이는 붉은 근육층',
    color: 0xc0392b,
    defaultOpacity: 0.85,
  },
  {
    id: 'skeleton',
    name: '골격',
    nameEn: 'Skeleton',
    description: '몸을 지탱하는 뼈대',
    color: 0xece5d8,
    defaultOpacity: 1,
  },
  {
    id: 'organs',
    name: '장기',
    nameEn: 'Organs',
    description: '소화·순환·호흡을 맡는 장기들',
    color: 0xff8fa3,
    defaultOpacity: 1,
  },
  {
    id: 'vessels',
    name: '신경·혈관',
    nameEn: 'Nerves & Vessels',
    description: '피를 나르는 혈관과 신호를 보내는 신경',
    color: 0x4aa8ff,
    defaultOpacity: 0.95,
  },
];

export const LAYER_IDS = LAYERS.map((l) => l.id);

export function layerById(id: LayerId): LayerInfo {
  const found = LAYERS.find((l) => l.id === id);
  if (!found) throw new Error(`Unknown layer: ${id}`);
  return found;
}
