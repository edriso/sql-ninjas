import type { Question } from '../types';

/**
 * Hard SQL questions. Goal: the things juniors quietly avoid because
 * they look intimidating, until one day they need to ship them at
 * work: self-joins, correlated subqueries, window functions,
 * NULL traps inside NOT IN, CTEs, and so on. Each question is built
 * around a real task someone would actually be asked to do.
 *
 * Authoring rules (enforced by scripts/audit-questions.ts):
 *  - exactly 4 options, each <= 200 characters (rendered in the
 *    context message, not the poll itself)
 *  - explanation <= 200 characters (Telegram quiz poll limit)
 *  - correctIndex is 0..3
 *  - id starts with "hard-" and is unique
 */
export const hardQuestions: readonly Question[] = [
  {
    id: 'hard-self-join-manager',
    difficulty: 'hard',
    topic: 'Self-join',
    scenario:
      'An org chart query needs each employee’s name next to their manager’s name. The CEO has no manager and should still appear in the result.',
    schema: `employees (
  id         INTEGER,
  name       TEXT,
  manager_id INTEGER
)`,
    prompt: 'Which query returns employee name and manager name, with NULL when the employee has no manager?',
    hint: 'Two copies of the same table need two different aliases. Pick the join type that keeps rows without a match.',
    options: [
      `SELECT e.name, m.name FROM employees e JOIN employees m ON e.manager_id = m.id;`,
      `SELECT e.name, m.name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;`,
      `SELECT name, manager_id FROM employees;`,
      `SELECT e.name, e.manager_id FROM employees e JOIN employees ON e.id = e.manager_id;`,
    ],
    correctIndex: 1,
    explanation:
      "A drops the CEO because INNER JOIN needs a match. C returns the id, not the name. D joins on the wrong condition. LEFT JOIN keeps every employee.",
  },

  {
    id: 'hard-above-average',
    difficulty: 'hard',
    topic: 'Scalar subquery in WHERE',
    scenario:
      'HR wants every employee whose salary is strictly above the company-wide average salary.',
    schema: `employees (
  id     INTEGER,
  name   TEXT,
  salary NUMERIC
)`,
    prompt: 'Which query returns those employees?',
    hint: 'WHERE runs row by row and cannot call an aggregate directly. A subquery can compute the average first.',
    options: [
      `SELECT name FROM employees WHERE salary > AVG(salary);`,
      `SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);`,
      `SELECT name FROM employees HAVING salary > AVG(salary);`,
      `SELECT name FROM employees WHERE salary IN (SELECT MAX(salary) FROM employees);`,
    ],
    correctIndex: 1,
    explanation:
      "A WHERE clause cannot use an aggregate directly; wrap it in a scalar subquery. HAVING needs GROUP BY context. D returns only the single top earner.",
  },

  {
    id: 'hard-top-per-group',
    difficulty: 'hard',
    topic: 'Window function: ROW_NUMBER',
    scenario:
      'A reporting query needs the single highest-paid employee in each department, with name and salary.',
    schema: `employees (
  id      INTEGER,
  name    TEXT,
  dept_id INTEGER,
  salary  NUMERIC
)`,
    prompt: 'Which query returns one row per department: the top earner?',
    hint: 'PARTITION BY restarts the row number inside each department. Then keep the row where the number is 1.',
    options: [
      `SELECT name, dept_id FROM employees ORDER BY salary DESC LIMIT 1;`,
      `SELECT name, dept_id FROM employees GROUP BY dept_id HAVING MAX(salary);`,
      `WITH r AS (SELECT name, dept_id, ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn FROM employees) SELECT name, dept_id FROM r WHERE rn = 1;`,
      `SELECT name, dept_id, MAX(salary) FROM employees GROUP BY dept_id;`,
    ],
    correctIndex: 2,
    explanation:
      "ROW_NUMBER OVER PARTITION BY gives a 1-per-group ranking. A returns one row total. D returns dept totals but not the name of the top earner.",
  },

  {
    id: 'hard-rank-vs-dense',
    difficulty: 'hard',
    topic: 'RANK vs DENSE_RANK vs ROW_NUMBER',
    scenario:
      'A leaderboard wants ties to share a rank, and the next player after a tie to take the next consecutive number (not skip). So a tie for 1st means the next player is 2nd, not 3rd.',
    schema: `scores (
  player TEXT,
  points INTEGER
)`,
    prompt: 'Which ranking function gives that behaviour?',
    hint: 'Of the three ranking functions, only one closes the gap that ties would otherwise create.',
    options: [
      `ROW_NUMBER() OVER (ORDER BY points DESC)`,
      `RANK() OVER (ORDER BY points DESC)`,
      `DENSE_RANK() OVER (ORDER BY points DESC)`,
      `COUNT(*) OVER (ORDER BY points DESC)`,
    ],
    correctIndex: 2,
    explanation:
      "DENSE_RANK gives ties the same rank and then uses the next number. RANK skips numbers after a tie. ROW_NUMBER never ties. COUNT does not rank.",
  },

  {
    id: 'hard-case-buckets',
    difficulty: 'hard',
    topic: 'CASE WHEN',
    scenario:
      'A category page needs every product tagged as Cheap (< 10), Mid (10 to 50), or Premium (> 50) based on its price.',
    schema: `products (
  id    INTEGER,
  name  TEXT,
  price NUMERIC
)`,
    prompt: 'Which query produces those buckets correctly using portable SQL?',
    hint: 'CASE checks conditions top to bottom and stops at the first match. ELSE catches the rest.',
    options: [
      `SELECT name, CASE WHEN price < 10 THEN 'Cheap' WHEN price <= 50 THEN 'Mid' ELSE 'Premium' END AS tier FROM products;`,
      `SELECT name, IIF(price < 10, 'Cheap', 'Premium') FROM products;`,
      `SELECT name, CASE price WHEN < 10 THEN 'Cheap' WHEN <= 50 THEN 'Mid' ELSE 'Premium' END FROM products;`,
      `SELECT name, CASE WHEN price<10 'Cheap' WHEN price<=50 'Mid' 'Premium' END FROM products;`,
    ],
    correctIndex: 0,
    explanation:
      "Standard CASE: WHEN <cond> THEN <val> ELSE <fallback> END. IIF is SQL Server only and skips Mid. C and D have invalid CASE syntax.",
  },

  {
    id: 'hard-exists',
    difficulty: 'hard',
    topic: 'EXISTS vs IN',
    scenario:
      'A query lists customers who have placed at least one order. The team is debating EXISTS vs IN.',
    schema: `customers (id INTEGER, name TEXT)
orders    (id INTEGER, customer_id INTEGER)`,
    prompt: 'Which statement is true about the two queries below?',
    hint: 'Read both queries carefully. Think about correctness first, then performance.',
    options: [
      `Only EXISTS returns the right rows; IN returns duplicates.`,
      `Only IN returns the right rows; EXISTS returns NULLs.`,
      `Both return the same customers; EXISTS often plans better for large subqueries.`,
      `Both are syntactically invalid; you must use a JOIN.`,
    ],
    correctIndex: 2,
    explanation:
      "EXISTS and IN return the same customers here. EXISTS stops at the first match per outer row, which often plans better. A JOIN would add duplicates.",
  },

  {
    id: 'hard-not-in-null',
    difficulty: 'hard',
    topic: 'NULL in NOT IN',
    scenario:
      'A team writes "WHERE id NOT IN (SELECT manager_id FROM employees)" to find people who are not anyone’s manager. The result is empty, even though many employees are clearly not managers. One row in employees has manager_id NULL.',
    schema: `employees (
  id         INTEGER,
  name       TEXT,
  manager_id INTEGER
)`,
    prompt: 'What is going on?',
    hint: 'Think about how NULL behaves inside a list. Compare value = NULL and value <> NULL.',
    options: [
      `NOT IN requires the subquery to return a single column. The subquery already does, so this is fine.`,
      `One value in the list is NULL. NOT IN evaluates to UNKNOWN, which behaves like FALSE, so no rows survive.`,
      `NOT IN does not work on integer columns in standard SQL.`,
      `The subquery must be wrapped in DISTINCT for NOT IN to work.`,
    ],
    correctIndex: 1,
    explanation:
      "If the NOT IN list contains any NULL, the test is UNKNOWN, which is treated as FALSE. Use NOT EXISTS, or filter NULLs out of the subquery.",
  },

  {
    id: 'hard-monthly-revenue',
    difficulty: 'hard',
    topic: 'Date grouping',
    scenario:
      'A finance dashboard needs total revenue per month for the year 2026: twelve rows, one per month, in order.',
    schema: `orders (
  id         INTEGER,
  total      NUMERIC,
  ordered_at TIMESTAMP
)`,
    prompt: 'Which query returns the right twelve rows?',
    hint: 'Pull just the month out of the timestamp, group by it, and filter by the year separately.',
    options: [
      `SELECT EXTRACT(MONTH FROM ordered_at) AS m, SUM(total) FROM orders WHERE EXTRACT(YEAR FROM ordered_at)=2026 GROUP BY m ORDER BY m;`,
      `SELECT MONTH(ordered_at), SUM(total) FROM orders WHERE ordered_at LIKE '2026%';`,
      `SELECT ordered_at, SUM(total) FROM orders GROUP BY ordered_at;`,
      `SELECT SUM(total) FROM orders WHERE ordered_at = 2026 GROUP BY MONTH;`,
    ],
    correctIndex: 0,
    explanation:
      "EXTRACT(field FROM timestamp) is standard SQL and groups cleanly. B has no GROUP BY and LIKEs a timestamp. C groups by every distinct timestamp. D is invalid.",
  },

  {
    id: 'hard-union-all',
    difficulty: 'hard',
    topic: 'UNION vs UNION ALL',
    scenario:
      'Two tables, orders_current and orders_archived, share the same columns. A query needs every order from both. The id ranges do not overlap, so duplicates are impossible. The tables are huge.',
    schema: `orders_current  (id INTEGER, total NUMERIC)
orders_archived (id INTEGER, total NUMERIC)`,
    prompt: 'Which query is correct AND the most efficient?',
    hint: 'UNION removes duplicates by sorting. UNION ALL just stacks the rows.',
    options: [
      `SELECT * FROM orders_current UNION SELECT * FROM orders_archived;`,
      `SELECT * FROM orders_current UNION ALL SELECT * FROM orders_archived;`,
      `SELECT * FROM orders_current, orders_archived;`,
      `SELECT * FROM orders_current JOIN orders_archived ON 1=1;`,
    ],
    correctIndex: 1,
    explanation:
      "UNION ALL stacks rows without the dedup sort, so it is faster and identical when duplicates are impossible. UNION pays for a sort you do not need.",
  },

  {
    id: 'hard-find-duplicates',
    difficulty: 'hard',
    topic: 'GROUP BY and HAVING',
    scenario:
      'An audit needs every email address that appears more than once in the users table, so duplicates can be cleaned up.',
    schema: `users (
  id    INTEGER,
  email TEXT
)`,
    prompt: 'Which query returns those repeated emails?',
    hint: 'Group by the column you suspect, then keep only the groups that have more than one row.',
    options: [
      `SELECT email FROM users WHERE COUNT(*) > 1 GROUP BY email;`,
      `SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1;`,
      `SELECT DISTINCT email FROM users;`,
      `SELECT u.email FROM users u JOIN users u2 ON u.email = u2.email;`,
    ],
    correctIndex: 1,
    explanation:
      "HAVING filters groups, so HAVING COUNT(*) > 1 keeps emails that repeat. WHERE cannot use aggregates. DISTINCT does the opposite. The self-join returns every pair.",
  },

  {
    id: 'hard-nth-highest',
    difficulty: 'hard',
    topic: 'Nth highest value',
    scenario:
      'HR wants the third-highest salary in the company. Ties for the same salary should count as one rank (so two people tied for 1st means 3rd is the next distinct salary).',
    schema: `employees (
  id     INTEGER,
  name   TEXT,
  salary NUMERIC
)`,
    prompt: 'Which query returns the right value?',
    hint: 'When ties matter, ranking functions are clearer than LIMIT/OFFSET. Pick the one that treats ties as the same rank.',
    options: [
      `SELECT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2;`,
      `SELECT salary FROM employees ORDER BY salary DESC LIMIT 3;`,
      `SELECT DISTINCT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) r FROM employees) t WHERE r = 3;`,
      `SELECT MAX(salary) FROM employees WHERE salary < MAX(salary);`,
    ],
    correctIndex: 2,
    explanation:
      "DENSE_RANK keeps tied salaries on the same rank, so the third rank is the third distinct salary. A skips by row, not by rank. D is invalid (MAX inside WHERE).",
  },

  {
    id: 'hard-running-total',
    difficulty: 'hard',
    topic: 'Running total with window SUM',
    scenario:
      'A finance team wants daily revenue plus the cumulative running total to date, ordered by date, in one query.',
    schema: `orders (
  ordered_on DATE,
  total      NUMERIC
)`,
    prompt: 'Which query produces both columns?',
    hint: 'SUM as a window function with ORDER BY gives a running total. Use it alongside the daily SUM.',
    options: [
      `SELECT ordered_on, SUM(total) AS day_total, SUM(SUM(total)) OVER (ORDER BY ordered_on) AS running FROM orders GROUP BY ordered_on ORDER BY ordered_on;`,
      `SELECT ordered_on, SUM(total), RUNNING TOTAL(total) FROM orders;`,
      `SELECT ordered_on, total, SUM(total) FROM orders GROUP BY ordered_on;`,
      `SELECT ordered_on, SUM(total) AS day_total FROM orders GROUP BY ordered_on ORDER BY ordered_on;`,
    ],
    correctIndex: 0,
    explanation:
      "SUM() OVER (ORDER BY date) is a running total. When GROUP BY is in play you can nest an aggregate inside the window aggregate, summing day totals into a cumulative line.",
  },

  {
    id: 'hard-join-multi-condition',
    difficulty: 'hard',
    topic: 'JOIN on multiple columns',
    scenario:
      'A participants table is keyed on (event_id, participant_id) together (a composite key). A query needs to join events to participants on both columns.',
    schema: `events       (event_id INTEGER, id INTEGER, name TEXT)
participants (event_id INTEGER, participant_id INTEGER, role TEXT)`,
    prompt: 'Which JOIN clause is correct?',
    hint: 'An ON clause is a boolean expression. Combine conditions the same way you would in a WHERE.',
    options: [
      `... ON e.event_id = p.event_id, e.id = p.participant_id`,
      `... ON e.event_id = p.event_id AND e.id = p.participant_id`,
      `... ON e.event_id = p.event_id WHERE e.id = p.participant_id`,
      `... ON (e.event_id, e.id) IN (p.event_id, p.participant_id)`,
    ],
    correctIndex: 1,
    explanation:
      "An ON clause is a boolean expression; chain conditions with AND. The comma is for column lists, not booleans. C splits the join across ON and WHERE; D misuses IN.",
  },

  {
    id: 'hard-recursive-cte',
    difficulty: 'hard',
    topic: 'Recursive CTE',
    scenario:
      'An employees table is self-referencing through manager_id. A query needs every direct and indirect report of the CEO (id = 1): the whole subtree, not just one level.',
    schema: `employees (
  id         INTEGER,
  name       TEXT,
  manager_id INTEGER
)`,
    prompt: 'Which query returns the entire subtree under the CEO?',
    hint: 'Recursion has two parts: a seed row and a step that produces the next layer from the previous one.',
    options: [
      `WITH RECURSIVE r AS (SELECT id, name, manager_id FROM employees WHERE id = 1 UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN r ON e.manager_id = r.id) SELECT * FROM r;`,
      `SELECT * FROM employees WHERE manager_id = 1;`,
      `SELECT * FROM employees e JOIN employees m ON e.id = m.manager_id;`,
      `SELECT * FROM employees WHERE manager_id IN (1, 2, 3, 4);`,
    ],
    correctIndex: 0,
    explanation:
      "WITH RECURSIVE pairs a seed (the CEO) with a step (everyone reporting to anyone already in r). B gets only the first level; C and D are static and miss deeper layers.",
  },

  {
    id: 'hard-update-subquery',
    difficulty: 'hard',
    topic: 'UPDATE with correlated subquery',
    scenario:
      'Every customer needs their last_order_total column set to the total of their most recent order, from the orders table.',
    schema: `customers (id INTEGER, last_order_total NUMERIC)
orders    (id INTEGER, customer_id INTEGER, total NUMERIC, ordered_at TIMESTAMP)`,
    prompt: 'Which UPDATE statement is portable and correct?',
    hint: 'A correlated scalar subquery returns one value per outer row. The subquery’s ORDER BY plus LIMIT picks "the most recent" cleanly.',
    options: [
      `UPDATE customers c SET last_order_total = (SELECT total FROM orders o WHERE o.customer_id = c.id ORDER BY o.ordered_at DESC LIMIT 1);`,
      `UPDATE customers SET last_order_total = MAX(total) FROM orders;`,
      `UPDATE customers SET last_order_total = orders.total WHERE id = orders.customer_id;`,
      `UPDATE c.last_order_total FROM customers c, orders o WHERE o.customer_id = c.id;`,
    ],
    correctIndex: 0,
    explanation:
      "A correlated scalar subquery returns one value per outer row. B uses non-standard UPDATE FROM. C references orders without a join. D is not valid syntax.",
  },

  {
    id: 'hard-group-by-multi',
    difficulty: 'hard',
    topic: 'GROUP BY with multiple columns',
    scenario:
      'A sales dashboard needs revenue per (region, year): one row per region-year pair, with the total.',
    schema: `orders (
  id         INTEGER,
  region     TEXT,
  total      NUMERIC,
  ordered_at DATE
)`,
    prompt: 'Which query is correct in standard SQL?',
    hint: 'GROUP BY accepts a comma-separated list, just like ORDER BY does.',
    options: [
      `SELECT region, EXTRACT(YEAR FROM ordered_at) AS y, SUM(total) FROM orders GROUP BY region, EXTRACT(YEAR FROM ordered_at);`,
      `SELECT region, EXTRACT(YEAR FROM ordered_at), SUM(total) FROM orders GROUP BY region;`,
      `SELECT region, EXTRACT(YEAR FROM ordered_at), SUM(total) FROM orders;`,
      `SELECT region, EXTRACT(YEAR FROM ordered_at), SUM(total) FROM orders GROUP BY ALL;`,
    ],
    correctIndex: 0,
    explanation:
      "Group by both grouping expressions. B groups by region only, so the year column is undefined. C has no grouping. GROUP BY ALL is non-standard.",
  },

  {
    id: 'hard-cross-join',
    difficulty: 'hard',
    topic: 'Comma-join trap',
    scenario:
      'A junior dev writes "FROM customers, orders" with 1,000 customers and 1,000 orders and is surprised to see 1,000,000 rows in the result.',
    schema: `customers (id INTEGER, name TEXT)
orders    (id INTEGER, customer_id INTEGER, total NUMERIC)`,
    prompt: 'What is happening?',
    hint: 'Without a join condition, the engine pairs every row with every row.',
    options: [
      `SQL infers an INNER JOIN automatically by matching columns called id.`,
      `Comma in FROM is a CROSS JOIN. With no ON or WHERE linking the tables, every pair is returned.`,
      `Comma in FROM is a syntax error in most engines.`,
      `The optimizer turned the query into a JOIN using a guessed FOREIGN KEY.`,
    ],
    correctIndex: 1,
    explanation:
      "Comma in FROM is CROSS JOIN. Add WHERE c.id = o.customer_id to make it INNER, or better, use the explicit JOIN ... ON syntax to keep intent obvious.",
  },
];
