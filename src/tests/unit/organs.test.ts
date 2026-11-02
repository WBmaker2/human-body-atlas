import { describe, expect, it } from 'vitest';
import {
  DIGESTION_TOUR,
  ORGANS,
  QUIZ_ITEMS,
  TOURS,
  digestionSequence,
  organById,
  quizLabelsShifted,
  scoreQuiz,
} from '../../anatomy/organs';

describe('organs content', () => {
  it('covers 13 KR organs with function + disease', () => {
    expect(ORGANS).toHaveLength(13);
    expect(QUIZ_ITEMS.length).toBeGreaterThanOrEqual(6);
    for (const o of ORGANS) {
      expect(o.function.length).toBeGreaterThan(5);
      expect(o.disease.length).toBeGreaterThan(5);
    }
  });

  it('new organs (pancreas, gallbladder, bladder) resolve', () => {
    expect(organById('pancreas').name).toBe('췌장');
    expect(organById('gallbladder').name).toBe('쓸개');
    expect(organById('bladder').name).toBe('방광');
  });

  it('digestion sequence is mouth → esophagus → stomach → small → large', () => {
    expect(digestionSequence().map((o) => o.id)).toEqual([
      'mouth',
      'esophagus',
      'stomach',
      'small-intestine',
      'large-intestine',
    ]);
  });

  it('tour has 6 stops ending with a recap', () => {
    expect(DIGESTION_TOUR).toHaveLength(6);
    expect(DIGESTION_TOUR[0].organId).toBe('mouth');
    expect(DIGESTION_TOUR[5].id).toBe('tour-recap');
  });

  it('offers 3 tours with organ-linked stops', () => {
    expect(TOURS.circulation).toHaveLength(5);
    expect(TOURS.breathing).toHaveLength(4);
    expect(TOURS.circulation[0].organId).toBe('heart');
    expect(TOURS.breathing[1].organId).toBe('lungs');
    for (const stops of Object.values(TOURS)) {
      for (const stop of stops) {
        if (stop.organId) expect(() => organById(stop.organId as string)).not.toThrow();
      }
    }
  });
});

describe('quiz scoring', () => {
  it('scores exact label matches', () => {
    const all = Object.fromEntries(QUIZ_ITEMS.map((i) => [i.organId, i.label]));
    expect(scoreQuiz(all)).toEqual({ correct: QUIZ_ITEMS.length, total: QUIZ_ITEMS.length });
    expect(scoreQuiz({})).toEqual({ correct: 0, total: QUIZ_ITEMS.length });
    expect(scoreQuiz({ ...all, heart: '폐' }).correct).toBe(QUIZ_ITEMS.length - 1);
  });

  it('shifts labels deterministically', () => {
    expect(quizLabelsShifted(QUIZ_ITEMS, 0)).toEqual(QUIZ_ITEMS.map((i) => i.label));
    expect(quizLabelsShifted(QUIZ_ITEMS, 2)).toHaveLength(QUIZ_ITEMS.length);
  });
});
