export type Difficulty = 'easy' | 'hard';

/**
 * One SQL question. The content fields are the source of truth and live
 * in src/content/questions-*.ts. Each question renders as two posts in
 * the channel:
 *
 *   1. A context message with scenario, schema, sample rows (optional),
 *      the prompt, and a hint hidden behind a Telegram spoiler tag.
 *   2. A quiz poll replying to that message, with the four options and
 *      a short explanation that Telegram shows when the user taps the
 *      lightbulb after voting.
 *
 * Constraints (validated by scripts/audit-questions.ts and unit tests):
 *  - `options` is exactly 4 entries
 *  - `correctIndex` is 0..3
 *  - Each option is <= 100 chars (Telegram poll limit)
 *  - `prompt` used as poll question is <= 300 chars
 *  - `explanation` is <= 200 chars (Telegram quiz poll limit)
 */
export type Question = {
  id: string;
  difficulty: Difficulty;
  topic: string;
  scenario: string;
  schema: string;
  sampleRows?: string;
  prompt: string;
  hint: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};
