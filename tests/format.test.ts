import { describe, expect, it } from 'vitest';
import {
  formatContextMessage,
  htmlEscape,
  pollOptions,
  pollQuestion,
} from '../src/lib/format';
import { easyQuestions } from '../src/content/questions-easy';

describe('htmlEscape', () => {
  it('escapes the three HTML-special characters', () => {
    expect(htmlEscape('a<b>c&d')).toBe('a&lt;b&gt;c&amp;d');
  });

  it('leaves quotes alone (Telegram HTML treats them as plain text)', () => {
    expect(htmlEscape(`it's "ok"`)).toBe(`it's "ok"`);
  });
});

describe('formatContextMessage', () => {
  const q = easyQuestions[0]!;

  it('contains the scenario, schema, and lettered options', () => {
    const out = formatContextMessage(q);
    expect(out).toContain('SQL Ninjas');
    expect(out).toContain(q.topic);
    expect(out).toContain(q.scenario);
    expect(out).toContain(q.options[0]);
    expect(out).toContain(q.options[3]);
    expect(out).toContain('A)');
    expect(out).toContain('D)');
  });

  it('wraps the hint in a Telegram spoiler tag', () => {
    expect(formatContextMessage(q)).toContain('<tg-spoiler>');
    expect(formatContextMessage(q)).toContain('</tg-spoiler>');
  });

  it('uses HTML pre/code blocks for the schema', () => {
    expect(formatContextMessage(q)).toContain('<pre><code class="language-sql">');
  });

  it('stays well under the Telegram message limit of 4096', () => {
    for (const item of easyQuestions) {
      expect(formatContextMessage(item).length).toBeLessThan(4096);
    }
  });
});

describe('poll helpers', () => {
  it('returns a short poll question well under the 300-char limit', () => {
    expect(pollQuestion().length).toBeLessThan(300);
  });

  it('returns exactly four short letter options', () => {
    const opts = pollOptions();
    expect(opts).toEqual(['A', 'B', 'C', 'D']);
    for (const o of opts) expect(o.length).toBeLessThan(100);
  });
});
