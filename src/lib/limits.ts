/**
 * Single source of truth for question-content limits. Imported by the
 * audit script and the test suite so they cannot drift apart, and by
 * docs that mention numbers (which still need a manual sync if these
 * change).
 *
 * Why these numbers:
 *  - OPTION_MAX_CHARS: options are rendered inside the channel message,
 *    not the poll. The 100-char poll limit does not apply because the
 *    poll itself only shows the letters A B C D. 400 gives hard
 *    questions room for CTE chains while still being legible in chat.
 *  - EXPLANATION_MAX_CHARS: Telegram's quiz-poll explanation field hard
 *    limit (per Bot API). Exceeding it makes sendPoll 400.
 *  - PROMPT_MAX_CHARS: defensive upper bound; the real ceiling is the
 *    overall 4096-char message limit, enforced separately by the test
 *    that sums every text field.
 *  - MESSAGE_BUDGET_CHARS: scenario + schema + prompt + hint + options
 *    must stay under this so the rendered HTML message fits under
 *    Telegram's 4096-char sendMessage cap with comfortable headroom.
 */
export const OPTION_MAX_CHARS = 400;
export const EXPLANATION_MAX_CHARS = 200;
export const PROMPT_MAX_CHARS = 1000;
export const MESSAGE_BUDGET_CHARS = 3500;
