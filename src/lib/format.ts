import type { Question } from '../types';

/**
 * Escape user-controlled text for Telegram HTML parse_mode. Only three
 * characters are special: < > &. Everything else is literal. Code blocks
 * and spoiler blocks use the same rule because the content inside them
 * is rendered verbatim.
 */
export function htmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const DIFF_BADGE: Record<Question['difficulty'], string> = {
  easy: '🟢 Easy',
  hard: '🔴 Hard',
};

/**
 * Build the rich context message that precedes the poll. The message
 * gives the learner everything they need: the business scenario, the
 * relevant schema as a SQL code block, optional sample rows, the four
 * candidate answers with full text (the poll itself only carries short
 * "A/B/C/D" labels so even long SQL queries are visible without scroll),
 * and a hint hidden behind a Telegram spoiler.
 *
 * Returned text uses HTML parse_mode. The four lettered option blocks
 * mirror the poll option order: index 0 is A, 1 is B, 2 is C, 3 is D.
 */
export function formatContextMessage(q: Question): string {
  const badge = DIFF_BADGE[q.difficulty];
  const topic = htmlEscape(q.topic);
  const scenario = htmlEscape(q.scenario);
  const schema = htmlEscape(q.schema);
  const prompt = htmlEscape(q.prompt);
  const hint = htmlEscape(q.hint);

  const lettered = ['A', 'B', 'C', 'D']
    .map((letter, i) => {
      const opt = htmlEscape(q.options[i] ?? '');
      return `<b>${letter})</b> <code>${opt}</code>`;
    })
    .join('\n');

  const lines: string[] = [
    `${badge} <b>SQL Ninjas</b> | <i>${topic}</i>`,
    '',
    scenario,
    '',
    '<b>Schema</b>',
    `<pre><code class="language-sql">${schema}</code></pre>`,
  ];

  if (q.sampleRows) {
    lines.push(
      '',
      '<b>Sample rows</b>',
      `<pre><code class="language-sql">${htmlEscape(q.sampleRows)}</code></pre>`,
    );
  }

  lines.push(
    '',
    '<b>Question</b>',
    prompt,
    '',
    lettered,
    '',
    `💡 <b>Hint</b>: <tg-spoiler>${hint}</tg-spoiler>`,
    '',
    '<i>Vote in the poll just below ☟ Pick the letter you think is correct.</i>',
  );

  return lines.join('\n');
}

/**
 * The poll itself stays short: a fixed question line plus single-letter
 * options. All the detail lives in the context message just above, so
 * the poll never hits Telegram's 100-char-per-option limit and never
 * truncates SQL queries.
 */
export function pollQuestion(): string {
  return 'Which one is correct?';
}

export function pollOptions(): [string, string, string, string] {
  return ['A', 'B', 'C', 'D'];
}
