/**
 * Question-pool sanity checker. Run with `pnpm audit-questions`.
 *
 * Catches the kinds of mistakes the runtime will not: a duplicate id, an
 * option that exceeds Telegram's render budget, an explanation over the
 * 200-char poll limit, or a correctIndex outside 0..3. Pure data check,
 * no network, no bot token needed. Exits with code 1 on any failure so
 * it can be wired into CI later.
 */
import { easyQuestions } from '../src/content/questions-easy';
import { hardQuestions } from '../src/content/questions-hard';
import type { Question } from '../src/types';

const OPTION_MAX = 400;
const EXPLANATION_MAX = 200;
const PROMPT_MAX = 1000;
const POLL_QUESTION = 'Which one is correct?';

type Issue = { id: string; field: string; detail: string };
const issues: Issue[] = [];

function check(qs: readonly Question[], prefix: 'easy-' | 'hard-'): void {
  const seenIds = new Set<string>();
  for (const q of qs) {
    if (!q.id.startsWith(prefix)) {
      issues.push({ id: q.id, field: 'id', detail: `must start with "${prefix}"` });
    }
    if (seenIds.has(q.id)) {
      issues.push({ id: q.id, field: 'id', detail: 'duplicate id' });
    }
    seenIds.add(q.id);

    if (q.options.length !== 4) {
      issues.push({ id: q.id, field: 'options', detail: `must have exactly 4, found ${q.options.length}` });
    }
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i] ?? '';
      if (opt.length === 0) {
        issues.push({ id: q.id, field: `options[${i}]`, detail: 'empty' });
      }
      if (opt.length > OPTION_MAX) {
        issues.push({
          id: q.id,
          field: `options[${i}]`,
          detail: `length ${opt.length} > ${OPTION_MAX}`,
        });
      }
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
      issues.push({ id: q.id, field: 'correctIndex', detail: `out of range: ${q.correctIndex}` });
    }
    // LeetCode metadata is all-or-nothing: either both fields or neither.
    const hasLcNumber = q.leetcodeNumber !== undefined;
    const hasLcSlug = q.leetcodeSlug !== undefined;
    if (hasLcNumber !== hasLcSlug) {
      issues.push({
        id: q.id,
        field: 'leetcode',
        detail: 'must set both leetcodeNumber and leetcodeSlug, or neither',
      });
    }
    if (hasLcSlug && !/^[a-z0-9-]+$/.test(q.leetcodeSlug ?? '')) {
      issues.push({
        id: q.id,
        field: 'leetcodeSlug',
        detail: 'kebab-case lowercase letters, digits, and dashes only',
      });
    }
    if (q.explanation.length > EXPLANATION_MAX) {
      issues.push({
        id: q.id,
        field: 'explanation',
        detail: `length ${q.explanation.length} > ${EXPLANATION_MAX}`,
      });
    }
    if (q.prompt.length > PROMPT_MAX) {
      issues.push({
        id: q.id,
        field: 'prompt',
        detail: `length ${q.prompt.length} > ${PROMPT_MAX}`,
      });
    }
    if (!q.hint || q.hint.length === 0) {
      issues.push({ id: q.id, field: 'hint', detail: 'empty' });
    }
    if (!q.scenario || q.scenario.length === 0) {
      issues.push({ id: q.id, field: 'scenario', detail: 'empty' });
    }
    if (!q.schema || q.schema.length === 0) {
      issues.push({ id: q.id, field: 'schema', detail: 'empty' });
    }
  }
}

check(easyQuestions, 'easy-');
check(hardQuestions, 'hard-');

console.log(`Easy questions: ${easyQuestions.length}`);
console.log(`Hard questions: ${hardQuestions.length}`);
console.log(`Poll question literal: ${POLL_QUESTION} (${POLL_QUESTION.length} chars)`);

if (issues.length === 0) {
  console.log('OK: all questions pass the audit.');
  process.exit(0);
}

console.error(`Found ${issues.length} issue(s):`);
for (const i of issues) {
  console.error(`  [${i.id}] ${i.field}: ${i.detail}`);
}
process.exit(1);
