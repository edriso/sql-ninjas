import cron from 'node-cron';
import type { Bot } from 'grammy';
import { config } from './config';
import { logger } from './lib/logger';
import { schedules } from './schedules';
import { formatContextMessage, pollOptions, pollQuestion } from './lib/format';
import { postContextMessage, postQuizPoll } from './lib/post';
import { pickQuestion } from './lib/pick';
import { easyQuestions } from './content/questions-easy';
import { hardQuestions } from './content/questions-hard';
import type { Difficulty, Question } from './types';

/**
 * Pick the question pool for a difficulty. Kept here (not on the schedule
 * object) so adding a new schedule only needs cron + name in schedules.ts.
 */
function poolFor(difficulty: Difficulty): readonly Question[] {
  return difficulty === 'easy' ? easyQuestions : hardQuestions;
}

/**
 * Fire one schedule. The full flow for a question is:
 *   1. pick the question for today's date in the configured timezone
 *   2. post the rich context message (returns its message_id)
 *   3. reply with a quiz poll so the two posts are visually grouped
 * If the context message fails the poll is skipped, because a lone poll
 * with "A/B/C/D" labels and no context is useless.
 */
export async function runOnce(difficulty: Difficulty, bot: Bot): Promise<void> {
  const pool = poolFor(difficulty);
  const question = pickQuestion(pool, new Date(), config.timezone);

  const contextHtml = formatContextMessage(question);
  const contextId = await postContextMessage(bot, contextHtml, {
    questionId: question.id,
  });

  if (!contextId) {
    logger.warn('Skipping poll because context post failed', { id: question.id });
    return;
  }

  await postQuizPoll(
    bot,
    {
      question: pollQuestion(),
      options: pollOptions(),
      correctOptionId: question.correctIndex,
      explanation: question.explanation,
      replyToMessageId: contextId,
    },
    { questionId: question.id },
  );
}

/**
 * Register every schedule with node-cron. Bad cron expressions are
 * validated up front: an invalid one is logged and skipped so the rest
 * of the bot still runs. Returns the number of schedules that were
 * registered, mainly so /health can report it.
 */
export function startScheduler(bot: Bot): number {
  let registered = 0;
  for (const s of schedules) {
    if (!cron.validate(s.cron)) {
      logger.error('Invalid cron expression, skipping schedule', {
        name: s.name,
        cron: s.cron,
      });
      continue;
    }
    cron.schedule(
      s.cron,
      async () => {
        logger.info('Schedule fired', { name: s.name, cron: s.cron });
        try {
          await runOnce(s.difficulty, bot);
        } catch (err) {
          logger.error('Schedule failed', { name: s.name, error: String(err) });
        }
      },
      { timezone: config.timezone },
    );
    registered += 1;
    logger.info('Schedule registered', {
      name: s.name,
      cron: s.cron,
      timezone: config.timezone,
    });
  }
  return registered;
}
