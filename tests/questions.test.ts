import { describe, expect, it } from 'vitest';
import { easyQuestions } from '../src/content/questions-easy';
import { hardQuestions } from '../src/content/questions-hard';

const OPTION_MAX = 400;
const EXPLANATION_MAX = 200;

describe('question pools', () => {
  it('have content in both pools', () => {
    expect(easyQuestions.length).toBeGreaterThan(0);
    expect(hardQuestions.length).toBeGreaterThan(0);
  });

  it('all easy ids are unique and prefixed correctly', () => {
    const ids = easyQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith('easy-')).toBe(true);
  });

  it('all hard ids are unique and prefixed correctly', () => {
    const ids = hardQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith('hard-')).toBe(true);
  });

  it('every question has exactly four options', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      expect(q.options.length).toBe(4);
      for (const opt of q.options) expect(opt.length).toBeGreaterThan(0);
    }
  });

  it('option length stays under the message budget', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      for (const opt of q.options) {
        expect(opt.length, `option for ${q.id}: "${opt}"`).toBeLessThanOrEqual(OPTION_MAX);
      }
    }
  });

  it('explanation stays under the Telegram quiz poll limit', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      expect(
        q.explanation.length,
        `explanation for ${q.id}: ${q.explanation.length} chars`,
      ).toBeLessThanOrEqual(EXPLANATION_MAX);
    }
  });

  it('correctIndex is always in range 0..3', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    }
  });

  it('every question has a hint, scenario, schema, prompt', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      expect(q.hint.trim().length, q.id).toBeGreaterThan(0);
      expect(q.scenario.trim().length, q.id).toBeGreaterThan(0);
      expect(q.schema.trim().length, q.id).toBeGreaterThan(0);
      expect(q.prompt.trim().length, q.id).toBeGreaterThan(0);
    }
  });

  it('LeetCode metadata is all-or-nothing and slug is kebab-case', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      const hasNumber = q.leetcodeNumber !== undefined;
      const hasSlug = q.leetcodeSlug !== undefined;
      expect(hasNumber, q.id).toBe(hasSlug);
      if (hasSlug) {
        expect(q.leetcodeSlug!, q.id).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it('every question has a sane char budget for rendering', () => {
    for (const q of [...easyQuestions, ...hardQuestions]) {
      const total = q.scenario.length + q.schema.length + q.prompt.length + q.hint.length +
        q.options.reduce((s, o) => s + o.length, 0);
      expect(total, q.id).toBeLessThan(3500);
    }
  });
});
