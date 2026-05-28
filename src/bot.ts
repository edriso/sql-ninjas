import { Bot } from 'grammy';
import { config } from './config';
import { logger } from './lib/logger';
import { runOnce } from './scheduler';

/**
 * Build and configure the Grammy bot. The bot exists mainly to drive
 * scheduled channel posts. The DM surface is intentionally minimal: a
 * /start that points new arrivals to the channel, and optional admin
 * commands that fire a schedule on demand for debugging.
 */
export function buildBot(): Bot {
  const bot = new Bot(config.botToken);

  bot.command('start', async (ctx) => {
    const link = config.channelUrl;
    const tail = link ? `\n\nJoin the channel: ${link}` : '';
    await ctx.reply(
      [
        '👋 Hi! SQL Ninjas posts two SQL puzzles a day to its Telegram channel.',
        '',
        'One easy at 10:00 and one harder at 19:00 (default times). Each comes with a real scenario, the schema, a hint, and a quiz so you can check yourself in seconds.',
        tail,
      ].join('\n'),
      { link_preview_options: { is_disabled: true } },
    );
  });

  bot.command('about', async (ctx) => {
    await ctx.reply(
      [
        'SQL Ninjas is a tiny open-source Telegram bot that posts daily SQL puzzles to a channel.',
        'It has no database. Questions live in the source.',
      ].join('\n'),
    );
  });

  // Admin-only manual fire. Useful when you want to preview the next
  // question without waiting for the cron. Anyone other than the
  // configured admin is silently ignored, so the bot never leaks the
  // existence of the command to strangers in DMs.
  bot.command('admin_easy', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return;
    await ctx.reply('Firing easy...');
    await runOnce('easy', bot);
    await ctx.reply('Done.');
  });

  bot.command('admin_hard', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return;
    await ctx.reply('Firing hard...');
    await runOnce('hard', bot);
    await ctx.reply('Done.');
  });

  bot.catch((err) => {
    logger.error('Grammy uncaught error', { error: String(err.error) });
  });

  return bot;
}

function isAdmin(id: number | undefined): boolean {
  if (!config.adminTelegramId || !id) return false;
  return BigInt(id) === config.adminTelegramId;
}
