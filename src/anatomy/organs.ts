/**
 * KR organ content (F2) + digestion tour stops (F5) + quiz data (F6).
 * Educational concept model — simplified shapes & positions for grades 5-9.
 */
import type { LayerId } from './layers';

export interface OrganInfo {
  id: string;
  name: string;
  nameEn: string;
  layer: LayerId;
  function: string;
  disease: string;
  fact: string;
  quizHint: string;
  digestionOrder?: number;
}

export const ORGANS: OrganInfo[] = [
  {
    id: 'brain',
    name: '뇌',
    nameEn: 'Brain',
    layer: 'organs',
    function: '몸의 사령탑으로, 보고·듣고·느낀 것을 처리하고 명령을 내립니다.',
    disease: '뇌진탕, 뇌수막염 — 머리를 부딪히면 꼭 어른에게 알리세요.',
    fact: '뇌는 몸무게의 약 2%지만 에너지의 약 20%를 씁니다.',
    quizHint: '머리 안에 있고 생각을 만드는 기관은?',
  },
  {
    id: 'mouth',
    name: '입',
    nameEn: 'Mouth',
    layer: 'organs',
    function: '소화의 첫 번째 문. 이로 음식을 잘게 부수고 침으로 적십니다.',
    disease: '충치, 구내염 — 이를 닦지 않으면 음식물이 썩어 충치가 생깁니다.',
    fact: '침은 하루에 약 1리터나 나옵니다.',
    quizHint: '소화가 시작되는 첫 번째 입구는?',
    digestionOrder: 1,
  },
  {
    id: 'esophagus',
    name: '식도',
    nameEn: 'Esophagus',
    layer: 'organs',
    function: '입에서 위까지 음식을 밀어 보내는 통로입니다(꿈틀운동).',
    disease: '역류성 식도염 — 위산이 올라오면 가슴이 쓰립니다.',
    fact: '거꾸로 매달려도 꿈틀운동 덕분에 음식이 위로 내려갑니다.',
    quizHint: '입과 위를 잇는 통로는?',
    digestionOrder: 2,
  },
  {
    id: 'lungs',
    name: '폐',
    nameEn: 'Lungs',
    layer: 'organs',
    function: '숨을 쉬어 산소를 받아들이고 이산화탄소를 내보냅니다.',
    disease: '천식, 폐렴 — 담배 연기와 미세먼지가 폐를 아프게 합니다.',
    fact: '폐에는 공기가 드나드는 작은 주머니(폐포)가 약 3억 개 있습니다.',
    quizHint: '숨을 쉴 때 부풀었다 쪼그라드는 기관은?',
  },
  {
    id: 'heart',
    name: '심장',
    nameEn: 'Heart',
    layer: 'organs',
    function: '펌프처럼 뛰며 피를 온몸으로 보냅니다. 1분에 약 70번 뜁니다.',
    disease: '심장병 — 기름진 음식을 많이 먹으면 혈관이 좁아집니다.',
    fact: '심장은 하루에 약 10만 번, 평생 약 30억 번 뜁니다.',
    quizHint: '가슴이 쿵쾅쿵쾅 뛰게 만드는 펌프는?',
  },
  {
    id: 'liver',
    name: '간',
    nameEn: 'Liver',
    layer: 'organs',
    function: '몸에서 가장 큰 장기. 쓸개즙을 만들어 기름진 음식을 녹입니다.',
    disease: '간염, 지방간 — 술과 기름진 음식이 간을 아프게 합니다.',
    fact: '간은 상처가 나도 다시 자라나는 놀라운 재생 능력이 있습니다.',
    quizHint: '몸에서 가장 크고 쓸개즙을 만드는 장기는?',
  },
  {
    id: 'stomach',
    name: '위',
    nameEn: 'Stomach',
    layer: 'organs',
    function: '음식을 위산과 섞어 죽처럼 만듭니다. 소화의 주방장입니다.',
    disease: '위염, 위궤양 — 자극적인 음식을 많이 먹으면 위가 헐 수 있습니다.',
    fact: '위는 일주일마다 안쪽 벽을 새로 만들 정도로 위산이 강합니다.',
    quizHint: '음식을 죽처럼 만드는 주머니는?',
    digestionOrder: 3,
  },
  {
    id: 'small-intestine',
    name: '소장',
    nameEn: 'Small intestine',
    layer: 'organs',
    function: '영양분을 빨아들여 피로 보냅니다. 소화의 진짜 주인공입니다.',
    disease: '장염 — 상한 음식을 먹으면 배가 아프고 설사를 합니다.',
    fact: '소장은 5~6m로 몸길이의 3배가 넘습니다.',
    quizHint: '영양분을 빨아들이는 가장 긴 관은?',
    digestionOrder: 4,
  },
  {
    id: 'large-intestine',
    name: '대장',
    nameEn: 'Large intestine',
    layer: 'organs',
    function: '남은 음식에서 물을 빨아들이고 찌꺼기를 모읍니다.',
    disease: '변비 — 물을 적게 마시면 찌꺼기가 딱딱해져 나오기 힘듭니다.',
    fact: '대장 속에는 몸에 도움을 주는 좋은 균이 수조 마리나 삽니다.',
    quizHint: '물을 빨아들이고 찌꺼기를 모으는 굵은 관은?',
    digestionOrder: 5,
  },
  {
    id: 'kidneys',
    name: '신장',
    nameEn: 'Kidneys',
    layer: 'organs',
    function: '피를 걸러 노폐물을 오줌으로 만듭니다. 몸의 정수기입니다.',
    disease: '신장염 — 짠 음식을 많이 먹으면 신장이 힘들어합니다.',
    fact: '콩팥이라고도 하며, 하루에 약 180리터의 피를 거릅니다.',
    quizHint: '피를 걸러 오줌을 만드는 콩 모양 기관은?',
  },
  {
    id: 'pancreas',
    name: '췌장',
    nameEn: 'Pancreas',
    layer: 'organs',
    function: '소화액을 만들어 소화를 돕고, 인슐린으로 혈당을 조절합니다.',
    disease: '당뇨병 — 인슐린이 부족하면 피 속 당이 너무 많아집니다.',
    fact: '이자라고도 하며, 길이가 약 15cm로 손가락 두 개 정도입니다.',
    quizHint: '소화액과 인슐린을 만드는 가느다란 장기는?',
  },
  {
    id: 'gallbladder',
    name: '쓸개',
    nameEn: 'Gallbladder',
    layer: 'organs',
    function: '간이 만든 쓸개즙을 저장했다가 기름진 음식이 오면 내보냅니다.',
    disease: '담석 — 쓸개즙이 굳어 돌이 되면 배가 심하게 아픕니다.',
    fact: '주머니 모양으로, 가득 차면 탁구공만 해집니다.',
    quizHint: '쓸개즙을 저장하는 작은 주머니는?',
  },
  {
    id: 'bladder',
    name: '방광',
    nameEn: 'Bladder',
    layer: 'organs',
    function: '신장이 만든 오줌을 모아 두었다가 한꺼번에 내보냅니다.',
    disease: '방광염 — 오줌을 오래 참으면 균이 생겨 아플 수 있습니다.',
    fact: '풍선처럼 늘어나 오줌을 약 500mL까지 모읍니다.',
    quizHint: '오줌을 모아 두는 풍선 같은 기관은?',
  },
];

export const ORGAN_IDS = ORGANS.map((o) => o.id);

export function organById(id: string): OrganInfo {
  const found = ORGANS.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown organ: ${id}`);
  return found;
}

/** Digestion order used by quiz + print table (mouth → … → large intestine). */
export function digestionSequence(): OrganInfo[] {
  return ORGANS.filter((o) => o.digestionOrder !== undefined).sort(
    (a, b) => (a.digestionOrder ?? 0) - (b.digestionOrder ?? 0),
  );
}

export interface TourStop {
  id: string;
  title: string;
  body: string;
  /** Camera position in scene units. */
  pos: [number, number, number];
  /** Camera look-at target. */
  target: [number, number, number];
  organId?: string;
}

/** 6 digestion tour stops — F5. Order: mouth → esophagus → stomach → small → large → recap. */
export const DIGESTION_TOUR: TourStop[] = [
  {
    id: 'tour-mouth',
    title: '1정거장 · 입 — 소화가 시작되는 곳',
    body: '이가 음식을 잘게 부수고, 침이 음식을 부드럽게 적십니다.',
    pos: [0.6, 3.4, 3.4],
    target: [0, 3.1, 0],
    organId: 'mouth',
  },
  {
    id: 'tour-esophagus',
    title: '2정거장 · 식도 — 꿈틀꿈틀 통로',
    body: '식도가 꿈틀운동으로 음식을 위까지 밀어 보냅니다.',
    pos: [1.6, 2.2, 3.2],
    target: [0, 2.2, 0],
    organId: 'esophagus',
  },
  {
    id: 'tour-stomach',
    title: '3정거장 · 위 — 소화의 주방장',
    body: '위산이 음식을 죽처럼 만듭니다. 카메라도 가까이 다가가 봅니다.',
    pos: [1.8, 1.2, 3.0],
    target: [-0.2, 1.1, 0],
    organId: 'stomach',
  },
  {
    id: 'tour-small',
    title: '4정거장 · 소장 — 영양분 흡수',
    body: '소장에서 영양분이 피로 빨려 들어갑니다. 가장 긴 구간입니다.',
    pos: [0.4, -0.4, 3.6],
    target: [0, -0.2, 0],
    organId: 'small-intestine',
  },
  {
    id: 'tour-large',
    title: '5정거장 · 대장 — 물 회수와 마무리',
    body: '대장이 물을 빨아들이고 남은 찌꺼기를 모읍니다.',
    pos: [-1.8, -0.2, 3.2],
    target: [0, -0.2, 0],
    organId: 'large-intestine',
  },
  {
    id: 'tour-recap',
    title: '6정거장 · 정리 — 소화 순서 외우기',
    body: '입 → 식도 → 위 → 소장 → 대장! 순서대로 손가락으로 짚어 보세요.',
    pos: [0, 1.2, 6.4],
    target: [0, 1.2, 0],
  },
];

/** 5 circulation tour stops — heart → lungs → aorta → legs → recap. */
export const CIRCULATION_TOUR: TourStop[] = [
  {
    id: 'tour-heart',
    title: '1정거장 · 심장 — 몸의 펌프',
    body: '심장이 쿵쾅 뛰며 피를 뿜어냅니다. 박동에 맞춰 화면도 통통 뜁니다.',
    pos: [1.9, 1.9, 2.9],
    target: [0.25, 1.9, 0.3],
    organId: 'heart',
  },
  {
    id: 'tour-lungs-oxygen',
    title: '2정거장 · 폐 — 산소 싣기',
    body: '피가 폐에서 숨으로 들어온 산소를 싣고 다시 심장으로 돌아옵니다.',
    pos: [-1.9, 2.4, 2.9],
    target: [-0.4, 2.2, 0.15],
    organId: 'lungs',
  },
  {
    id: 'tour-aorta',
    title: '3정거장 · 대동맥 — 온몸으로 출발',
    body: '산소를 가득 실은 빨간 피가 대동맥을 타고 온몸으로 출발합니다.',
    pos: [1.7, 0.7, 3.1],
    target: [0.05, 0.7, 0],
  },
  {
    id: 'tour-legs',
    title: '4정거장 · 다리 — 발끝까지 갔다 오기',
    body: '피는 발끝까지 갔다가 몸의 찌꺼기를 싣고 다시 심장으로 돌아옵니다.',
    pos: [1.5, -2.2, 3.4],
    target: [0.2, -2.2, -0.1],
  },
  {
    id: 'tour-blood-recap',
    title: '5정거장 · 정리 — 피의 한 바퀴',
    body: '심장 → 폐 → 심장 → 온몸 → 심장! 이것이 피의 한 바퀴입니다.',
    pos: [0, 1.0, 6.6],
    target: [0, 1.0, 0],
  },
];

/** 4 breathing tour stops — airway → lungs → diaphragm → recap. */
export const BREATHING_TOUR: TourStop[] = [
  {
    id: 'tour-airway',
    title: '1정거장 · 숨의 길 — 코에서 폐까지',
    body: '숨은 코와 입으로 들어와 기관을 지나 폐까지 내려갑니다.',
    pos: [0.7, 3.0, 3.6],
    target: [0, 2.6, 0.1],
    organId: 'lungs',
  },
  {
    id: 'tour-lungs-inflate',
    title: '2정거장 · 폐 — 풍선처럼 부풀기',
    body: '들숨에 폐가 부풀며 산소를 받아들입니다. 화면의 폐도 커졌다 작아집니다.',
    pos: [2.0, 2.2, 2.7],
    target: [0.4, 2.15, 0.1],
    organId: 'lungs',
  },
  {
    id: 'tour-diaphragm',
    title: '3정거장 · 횡격막 — 아래로 내려가기',
    body: '숨을 들이쉴 때 횡격막이 아래로 내려가며 폐가 넓어질 자리를 만듭니다.',
    pos: [-2.0, 1.1, 2.7],
    target: [0, 1.5, 0],
    organId: 'lungs',
  },
  {
    id: 'tour-breath-recap',
    title: '4정거장 · 정리 — 들숨과 날숨',
    body: '들숨에 산소가 들어오고, 날숨에 이산화탄소가 나갑니다.',
    pos: [0, 1.6, 6.4],
    target: [0, 1.6, 0],
  },
];

export type TourId = 'digestion' | 'circulation' | 'breathing';

export interface TourMeta {
  id: TourId;
  name: string;
  nameEn: string;
  startLabel: string;
}

export const TOUR_META: Record<TourId, TourMeta> = {
  digestion: { id: 'digestion', name: '소화 투어', nameEn: 'Digestion tour', startLabel: '소화 투어 시작' },
  circulation: { id: 'circulation', name: '순환 투어', nameEn: 'Circulation tour', startLabel: '순환 투어 시작' },
  breathing: { id: 'breathing', name: '호흡 투어', nameEn: 'Breathing tour', startLabel: '호흡 투어 시작' },
};

export const TOUR_IDS: TourId[] = ['digestion', 'circulation', 'breathing'];

export const TOURS: Record<TourId, TourStop[]> = {
  digestion: DIGESTION_TOUR,
  circulation: CIRCULATION_TOUR,
  breathing: BREATHING_TOUR,
};

export interface QuizItem {
  organId: string;
  label: string;
}

export const QUIZ_ITEMS: QuizItem[] = [
  { organId: 'heart', label: '심장' },
  { organId: 'lungs', label: '폐' },
  { organId: 'stomach', label: '위' },
  { organId: 'liver', label: '간' },
  { organId: 'small-intestine', label: '소장' },
  { organId: 'brain', label: '뇌' },
  { organId: 'pancreas', label: '췌장' },
  { organId: 'bladder', label: '방광' },
];

/** Pure quiz scorer — unit-tested. */
export function scoreQuiz(
  answers: Record<string, string>,
  items: QuizItem[] = QUIZ_ITEMS,
): { correct: number; total: number } {
  let correct = 0;
  for (const item of items) {
    if (answers[item.organId] === item.label) correct += 1;
  }
  return { correct, total: items.length };
}

/** Rotate a copy of quiz labels — keeps the quiz fresh without randomness in tests. */
export function quizLabelsShifted(items: QuizItem[] = QUIZ_ITEMS, shift = 2): string[] {
  const labels = items.map((i) => i.label);
  const n = labels.length;
  const k = ((shift % n) + n) % n;
  return [...labels.slice(k), ...labels.slice(0, k)];
}
