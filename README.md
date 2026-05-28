# SQL Ninjas

A tiny Telegram bot that posts two SQL puzzles a day to a channel. One easy in the morning, one harder in the evening. Each puzzle is a real-world scenario, with the schema, a hint, four options, and a quiz so readers can check themselves in seconds.

The whole project is junior friendly on purpose. The questions are short, the English is plain, the scenarios are things you might be asked at work.

## How a question looks

Each day, in the channel, the bot posts:

1. A context message with the difficulty badge, the topic, the business scenario, the schema as a SQL code block, the question, four lettered options (A, B, C, D), and a hint hidden behind a Telegram spoiler tag.
2. A quiz poll right below it. Readers tap the letter they think is right. Telegram then reveals the correct one and a short explanation.

That second post is what makes it fun. The feedback is instant and anonymous. Nobody can see who voted what.

## Tech stack

| Part       | Choice                                |
| ---------- | ------------------------------------- |
| Bot        | TypeScript, Grammy, node-cron, Node 20+ |
| Storage    | none, no database                     |
| Content    | TypeScript files in `src/content/`    |
| Packager   | pnpm                                  |
| Tests      | Vitest, no network                    |

There is no database. All the questions live in source files. To add a question or change one, you edit a file and redeploy.

## Quick start

```bash
pnpm install
cp .env.example .env          # optional, you can also pass env vars another way
# fill in BOT_TOKEN and CHANNEL_CHAT_ID
pnpm test                     # run the unit tests
pnpm audit-questions          # sanity-check the question pool
pnpm dev                      # run the bot locally
```

You will need a bot from `@BotFather` and a channel where you have added the bot as an admin with the "Post messages" permission.

## Daily schedule

| Slot           | Default cron | Difficulty |
| -------------- | ------------ | ---------- |
| Morning warm-up | `0 10 * * *` | easy       |
| Evening puzzle  | `0 19 * * *` | hard       |

The cron runs in the timezone set by `TZ_NAME` (default UTC, sample sets Africa/Cairo). Override the cron expressions with `EASY_CRON` and `HARD_CRON` if you want different times.

## Picking is deterministic

The bot picks today's question by `dayOfYearInTimezone % poolLength`. That means:

- The same calendar day always picks the same question, even if the cron is restarted or refires.
- The two pools advance independently. With 17 easy and 17 hard questions, you get a fresh question every day for about half a month before the cycle wraps.
- Add more questions and the cycle lengthens automatically. No config needed.

## Adding a question

See `docs/QUESTIONS.md`. The short version: append an object to `src/content/questions-easy.ts` or `src/content/questions-hard.ts`, then run `pnpm audit-questions` and `pnpm test`. If both pass, redeploy.

## Why no database

A daily question channel does not need user accounts, votes saved, or a leaderboard. Telegram already tallies the anonymous quiz poll and shows the right answer on the spot. Keeping the project stateless means fewer parts that can break, no schema migrations, and no privacy footprint.

If you ever want a leaderboard, that becomes a different project. This one stays simple.

## Environment variables

All variables are documented in `.env.example`. Only two are required:

- `BOT_TOKEN`: from `@BotFather`
- `CHANNEL_CHAT_ID`: the numeric chat id (recommended) or `@channel` handle

The `.env` file itself is optional. Production hosts that inject env vars directly do not need a file at all.

## Scripts

| Command                       | What it does                                                          |
| ----------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                    | Start the bot locally with hot reload                                 |
| `pnpm start`                  | Run the compiled bot (after `pnpm build`)                             |
| `pnpm build`                  | Compile TypeScript to `dist/`                                         |
| `pnpm test`                   | Run unit tests (no network)                                           |
| `pnpm typecheck`              | TypeScript with no emit                                               |
| `pnpm audit-questions`        | Validate the question pool (option length, id uniqueness, etc.)       |
| `pnpm send-test [mode]`       | Fire one question into the channel right now. mode = easy, hard, both |
| `pnpm post-welcome [id?]`     | Post the channel welcome message, or edit it in place by id           |
| `pnpm format`                 | Prettier across the repo                                              |

## License

MIT. See `LICENSE` if present, or assume MIT.
