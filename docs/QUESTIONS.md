# Adding and Editing Questions

Questions are plain TypeScript objects in two files:

- `src/content/questions-easy.ts`
- `src/content/questions-hard.ts`

The id prefix must match the file: `easy-...` or `hard-...`.

## The shape

```ts
type Question = {
  id: string;              // "easy-something-short", unique across the pool
  difficulty: 'easy' | 'hard';
  topic: string;           // short label shown in the message header
  scenario: string;        // 1 to 3 sentences. A real business situation.
  schema: string;          // CREATE TABLE-like layout. Multi-line is fine.
  sampleRows?: string;     // optional rows under the schema
  prompt: string;          // the actual question
  hint: string;            // shown behind a Telegram spoiler tag
  options: [string, string, string, string]; // exactly 4 candidate answers
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;     // 200 chars max. Shown when the reader votes.
};
```

## Authoring checklist

1. **Make the scenario real.** A team meeting, an audit, a dashboard, a support ticket. Avoid abstract setups like "given a table T with rows R".
2. **Keep the schema minimal.** Only the columns that matter for the question. Indent for readability.
3. **Hint should nudge, not solve.** Point at the concept, not the answer. Example: "NULL is never equal to anything, not even itself" is a great hint for an IS NULL question.
4. **Write four plausible options.** Three of them must look right at a glance. Common mistakes make the best distractors: a missing GROUP BY, a `= NULL`, the wrong join type, AND vs OR precedence, a forgotten WHERE on an UPDATE.
5. **One clear correct answer.** No "both A and C work" unless the question is explicitly about that.
6. **Explanation is short.** Reveal the why, not a textbook chapter. The Telegram limit is 200 characters.
7. **Options can be long.** They are rendered in the context message, not the poll itself. The audit caps them at 200 chars for readability.
8. **No em-dashes in any prose.** Use commas, colons, or sentences. Em-dashes look out of place in a learning channel and tend to read as a smell that the text was machine-generated.

## After you edit

```bash
pnpm audit-questions      # validates lengths, ids, indices
pnpm test                 # runs the same checks plus picker and format tests
pnpm send-test easy       # preview today's easy question in the channel
pnpm send-test hard       # preview today's hard question in the channel
```

Both audit and test must pass before deploying.

## Picking is by day of year

The bot uses `dayOfYearInTimezone(today, TZ) % pool.length` to pick. That means:

- Adding a question shifts the cycle by one position for every day after the new entry. That is fine for a daily channel. Readers will not notice.
- If you want to pin a particular question to a specific date (April 1, for example), do not. Keep the pool flat and let the rotation do its job.

## Style cheat sheet

- Real schemas, real columns, real verbs in the scenario (orders, invoices, students, sales, employees, products).
- Junior friendly English. Short sentences. No idioms. Avoid "leverage", "utilize", and "as per".
- Use `SUM(total)` not `SUM("total")` unless the column needs quoting. Single quotes only for text values.
- Indent SQL inside the schema for readability:
  ```
  customers (
    id    INTEGER,
    name  TEXT,
    city  TEXT
  )
  ```
- Aliases should be one letter (`o` for orders, `c` for customers, `e` for employees, `m` for manager) and used consistently.
