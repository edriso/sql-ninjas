import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // The bot, scheduler, post and post-welcome modules transitively
    // import src/config.ts, which reads BOT_TOKEN and CHANNEL_CHAT_ID
    // at import time. Tests should not require a real bot token, so
    // inject placeholder values here.
    env: {
      BOT_TOKEN: 'test-token',
      CHANNEL_CHAT_ID: '-1001234567890',
      NODE_ENV: 'test',
      TZ_NAME: 'UTC',
    },
  },
});
