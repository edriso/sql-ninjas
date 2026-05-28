import { buildBot } from './bot';
import { startScheduler } from './scheduler';
import { startHealthServer } from './health';
import { logger } from './lib/logger';
import { config } from './config';

async function main(): Promise<void> {
  const bot = buildBot();

  const scheduleCount = startScheduler(bot);
  startHealthServer({ scheduleCount });

  logger.info('Starting bot', {
    timezone: config.timezone,
    easyCron: config.easyCron,
    hardCron: config.hardCron,
    isDev: config.isDev,
  });

  await bot.start({
    onStart: (info) => {
      logger.info('Bot started', { username: info.username });
    },
  });
}

main().catch((err) => {
  logger.error('Fatal error during startup', { error: String(err) });
  process.exit(1);
});
