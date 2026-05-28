import { config } from './config';
import type { Difficulty } from './types';

export type ScheduleDef = {
  name: string;
  cron: string;
  difficulty: Difficulty;
};

/**
 * The two daily fires. Defaults are 10:00 (easy) and 19:00 (hard) in the
 * configured timezone. Override via EASY_CRON / HARD_CRON in env.
 *
 * Why two questions and not three or five: pacing. A junior who follows
 * along gets a quick morning warm-up and an evening challenge. More than
 * that turns the channel into noise.
 */
export const schedules: readonly ScheduleDef[] = [
  { name: 'daily_easy', cron: config.easyCron, difficulty: 'easy' },
  { name: 'daily_hard', cron: config.hardCron, difficulty: 'hard' },
];
