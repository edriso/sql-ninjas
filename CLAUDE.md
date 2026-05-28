# SQL Ninjas: Repo Guide

## What this is

A tiny no-database Telegram bot that posts two short SQL puzzles each day to one channel. One easy in the morning, one harder in the evening. Each post is a context message plus a quiz poll. The quiz reveals the correct answer and a short explanation after the reader votes.

The channel is read-only by design. No user accounts, no leaderboards, no DMs to manage. The bot exists to deliver good content on a schedule.

## Folder layout

```
sql-ninjas/
├── src/
│   ├── index.ts          Entry point (bot, scheduler, health server)
│   ├── config.ts         env loading. Required: BOT_TOKEN, CHANNEL_CHAT_ID.
│   ├── bot.ts            Grammy setup: /start, /about, /admin_easy, /admin_hard.
│   ├── scheduler.ts      node-cron wiring; runOnce(difficulty, bot).
│   ├── schedules.ts      THE EDIT POINT for cron times and what runs.
│   ├── types.ts          Question type + Difficulty union.
│   ├── health.ts         /health HTTP endpoint for platform liveness checks.
│   ├── content/
│   │   ├── questions-easy.ts   The easy pool.
│   │   ├── questions-hard.ts   The hard pool.
│   │   └── welcome.ts          Pinned welcome message body (HTML).
│   └── lib/
│       ├── logger.ts     Tiny structured console logger.
│       ├── pick.ts       Deterministic day-of-year picker (timezone aware).
│       ├── format.ts     Builds the HTML context message + poll labels.
│       └── post.ts       postContextMessage, postQuizPoll, postPlainMessage, editChannelMessage.
├── scripts/
│   ├── send-test.ts      Manual dev sender (easy / hard / both). Not imported by the app.
│   ├── post-welcome.ts   Post or edit-in-place the pinned welcome message.
│   └── audit-questions.ts Sanity-check the pools (length, uniqueness, indices).
├── tests/                Vitest unit tests, no network.
├── docs/
│   ├── DEPLOY.md         Host-agnostic deploy notes.
│   └── QUESTIONS.md      How to add a question.
├── .env.example          All env vars documented.
├── package.json
└── tsconfig.json
```

## Tech stack

| Layer    | Choice                                  |
| -------- | --------------------------------------- |
| Bot      | TypeScript, Grammy, node-cron, Node 20+ |
| Storage  | none, no database, no state file        |
| Packager | pnpm                                    |
| Tests    | Vitest, no network                      |

## Design choices

- **No database, no state file.** Both questions for a given day are picked deterministically from `dayOfYearInTimezone(date, TZ) % pool.length`. The same calendar day always returns the same question, so a restart cannot accidentally pick a "new" question for the same slot. The two pools (easy, hard) advance independently. To extend the cycle length, just add more questions.
- **Two posts per question.** The first is a rich HTML message with the scenario, schema, four lettered options, and the hint in a `<tg-spoiler>` tag. The second is a quiz poll replying to the first, with just "A", "B", "C", "D" as options. This keeps the poll well under Telegram's 100-char-per-option limit even when the SQL in option A is long. The reader sees both posts grouped in the feed.
- **Quiz polls, not regular polls.** Quiz polls reveal the correct answer and the explanation when the reader votes. That is the learn-by-doing loop we want.
- **Anonymous polls.** No one can see who voted. There is nothing to track and no privacy footprint.
- **HTML parse mode.** Telegram HTML has only three special characters (`<`, `>`, `&`) so escaping is trivial. `<pre><code class="language-sql">` blocks render SQL with monospace and a code-block feel. `<tg-spoiler>` hides the hint.
- **`.env` is optional.** `src/config.ts` tries `import('dotenv')` and silently skips if dotenv is not installed. Production hosts that inject env vars need neither the file nor the package. Required values still throw if missing.
- **Optional dependency for dotenv.** Listed under `optionalDependencies` so a prod `npm install --omit=optional` works fine. Dev installs always get it.
- **Discriminated schedule type.** `ScheduleDef` has a `difficulty` field. Adding a new slot (a Friday challenge, a weekend roundup) is a one-line edit in `schedules.ts`.
- **No retries.** A failed Telegram call is logged; the tick is lost; the next fire takes over. The bot is meant to run for years untouched; a flaky-network day at 10:00 is not worth complicating the codebase for.
- **LeetCode integration is optional per-question.** A question can set `leetcodeNumber` and `leetcodeSlug` together. When present, the channel post adds a "Practice freehand on LeetCode #N" link to the free LeetCode problem. Readers can earn points there. The MCQ is the quick self check; LeetCode is the deeper practice. The audit enforces all-or-nothing on the two fields.
- **Date math is timezone-safe.** `dayOfYearIn` uses `Intl.DateTimeFormat` with the timezone, never `Date.getDate()` or `getDay()` which read the host TZ. This matters when the host is in UTC and the channel runs on Cairo time.
- **Schedule cron clamp.** Defaults to 10:00 and 19:00 so neither lands inside Egypt's spring-forward window (00:00 -> 01:00 on the last Friday of April), which node-cron silently skips.
- **Question pool audit is a script, not a runtime check.** Author mistakes are caught at edit time by `pnpm audit-questions` and by unit tests. The runtime trusts the pool.

## How to change what it posts

1. **Pick the right pool.** Easy goes in `src/content/questions-easy.ts`, hard in `src/content/questions-hard.ts`. The id prefix must match (`easy-` or `hard-`).
2. **Edit or append.** Each entry is a `Question` object. See `docs/QUESTIONS.md` for the full checklist.
3. **Validate.** `pnpm audit-questions && pnpm test`.
4. **Preview.** `pnpm send-test easy` or `pnpm send-test hard` posts today's question to the configured channel immediately.
5. **Redeploy.**

## Environment variables

| Variable             | Required | Notes                                                       |
| -------------------- | -------- | ----------------------------------------------------------- |
| `BOT_TOKEN`          | yes      | From `@BotFather`.                                          |
| `CHANNEL_CHAT_ID`    | yes      | Numeric `-100...` is best; `@channel` also works.           |
| `CHANNEL_PUBLIC_URL` | no       | Public link shown by `/start` in DMs.                       |
| `ADMIN_TELEGRAM_ID`  | no       | Unlocks `/admin_easy` and `/admin_hard` in DMs.             |
| `TZ_NAME`            | no       | Cron timezone. Default UTC, sample uses Africa/Cairo.       |
| `EASY_CRON`          | no       | Override the easy schedule cron (default `0 10 * * *`).     |
| `HARD_CRON`          | no       | Override the hard schedule cron (default `0 19 * * *`).     |
| `PORT`               | no       | `/health` server port. Default 8080.                        |
| `NODE_ENV`           | no       | `production` for hosted.                                    |

## Channel admin rights

The bot only needs **"Post messages"**. No delete permission is required because question posts are never auto-deleted; the channel scrollback is the archive.

If you later want to auto-delete or auto-edit, the helpers already exist in `src/lib/post.ts` (`editChannelMessage`) and `post-welcome.ts` already uses edit-in-place for the pinned welcome.

## Testing

`pnpm test` runs Vitest. The suite covers:

- The question pools: every entry has 4 options, a hint, a scenario, a schema, a prompt, a valid `correctIndex`, and a unique id. Options stay under 400 chars (the poll only shows A/B/C/D, so Telegram's 100-char poll limit does not apply); explanations stay under Telegram's 200-char quiz-poll limit. Limits live in `src/lib/limits.ts`.
- `pickForDay`: deterministic, cycles through the pool, throws on empty pool, respects the timezone.
- `formatContextMessage`: contains the scenario, schema, lettered options, the spoiler hint, and stays well under 4096 chars.
- `channelUrlFrom`: handles `@username`, full t.me URLs, numeric ids, and rejects short handles.
- `resolvePort`: defaults to 8080 and rejects garbage.

No test needs a real bot token; `vitest.config.ts` injects placeholders.

## Common gotchas

- **Channel admin rights**: the bot must be a channel admin and "Post messages" must be on. Without it `sendMessage` and `sendPoll` return 403.
- **Numeric chat id is safest**: `-1001234567890` keeps working even if the channel username changes later. `@channel` works but breaks on a rename.
- **`correct_option_ids`, not `correct_option_id`**: Bot API 9.x renamed this to a plural array. A single-element array preserves the quiz behaviour. See `src/lib/post.ts`.
- **DST**: node-cron silently drops a job whose wall-clock time does not exist on the spring-forward day. Defaults of 10:00 and 19:00 are safe in every IANA zone.
- **Polls are always anonymous**: by design. Nobody can see who voted, including the bot.
- **The poll's options are short letters, the SQL is in the message**: do not be tempted to put SQL into the poll options. The 100-char limit will bite you on complex queries, and your audit will fail.

## Git

- Commit after each meaningful unit of work.
- Do NOT add Co-Authored-By in commit messages.
