/**
 * Manual dev tool: fire one question into the configured channel right
 * now. Useful for previewing changes to content or formatting without
 * waiting for the daily cron.
 *
 * Usage:
 *   pnpm send-test            -> sends today's easy question
 *   pnpm send-test easy       -> sends today's easy question
 *   pnpm send-test hard       -> sends today's hard question
 *   pnpm send-test both       -> sends both, easy first
 *
 * Requirements: BOT_TOKEN and CHANNEL_CHAT_ID in env (or .env), and the
 * bot must be a channel admin with "Post messages" permission.
 */
import { Bot } from 'grammy';
import { config } from '../src/config';
import { runOnce } from '../src/scheduler';
import { logger } from '../src/lib/logger';

async function main(): Promise<void> {
  const arg = (process.argv[2] ?? 'easy').toLowerCase();
  // Validate the mode BEFORE doing any work, so a typo like
  // "pnpm send-test hardd" fails fast instead of silently posting
  // nothing (or worse, posting the wrong question).
  if (!['easy', 'hard', 'both'].includes(arg)) {
    console.error(`Unknown mode "${arg}". Use easy, hard, or both.`);
    process.exit(1);
  }

  const bot = new Bot(config.botToken);
  // Preflight: catches bad token or chat id with one clean diagnostic
  // instead of two confusing failures inside runOnce.
  try {
    const chat = await bot.api.getChat(config.channelChatId);
    logger.info('Channel preflight OK', { title: 'title' in chat ? chat.title : '(private)' });
  } catch (err) {
    logger.error('Channel preflight failed. Check BOT_TOKEN and CHANNEL_CHAT_ID.', {
      error: String(err),
    });
    process.exit(1);
  }

  if (arg === 'easy' || arg === 'both') {
    await runOnce('easy', bot);
  }
  if (arg === 'hard' || arg === 'both') {
    await runOnce('hard', bot);
  }
}

main().catch((err) => {
  logger.error('send-test failed', { error: String(err) });
  process.exit(1);
});
