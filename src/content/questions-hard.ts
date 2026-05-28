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

  // ============================================================
  // LeetCode-mirrored hard questions follow. Each one points at a
  // free LeetCode problem so the reader can solve it freehand in
  // the LeetCode editor and earn points there too. Our scenarios
  // are rewritten; only the underlying SQL idea is borrowed.
  // ============================================================

  {
    id: 'hard-second-highest-salary',
    difficulty: 'hard',
    topic: 'Second highest distinct value',
    scenario:
      'Return the second highest DISTINCT salary in the Employee table. If there is no second one (every employee earns the same, or there is only one row), return NULL as a single row of output.',
    schema: `Employee (id INTEGER, salary NUMERIC)`,
    prompt: 'Which query satisfies BOTH the value and the "always return one row, even when null" requirement?',
    hint: 'A bare LIMIT/OFFSET returns no rows when the value does not exist. Wrap it in a subquery (or use MAX of a subquery) to always produce one row.',
    options: [
      `SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary;`,
      `SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;`,
      `SELECT salary FROM Employee ORDER BY salary DESC LIMIT 2;`,
      `SELECT salary FROM Employee GROUP BY salary HAVING COUNT(*)=1;`,
    ],
    correctIndex: 0,
    explanation:
      "Wrapping the LIMIT/OFFSET in a SELECT scalar subquery turns 0 rows into one NULL row. The bare form (B) returns nothing when there is no second salary.",
    leetcodeNumber: 176,
    leetcodeSlug: 'second-highest-salary',
  },

  {
    id: 'hard-nth-highest-salary-dense',
    difficulty: 'hard',
    topic: 'Nth highest with DENSE_RANK',
    scenario:
      'Generalize: return the Nth highest DISTINCT salary in the Employee table. Ties on the same salary share a rank (so the 3rd distinct value is the 3rd rank, regardless of duplicates). Return NULL when no Nth value exists.',
    schema: `Employee (id INTEGER, salary NUMERIC)`,
    prompt: 'Which CTE-based approach is portable and correct?',
    hint: 'DENSE_RANK gives a rank per distinct value, with no gaps. MAX over an empty set is one NULL row.',
    options: [
      `WITH r AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rn FROM Employee) SELECT MAX(salary) FROM r WHERE rn = N;`,
      `SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET N-1;`,
      `SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);`,
      `SELECT salary FROM Employee GROUP BY salary HAVING COUNT(*) = N;`,
    ],
    correctIndex: 0,
    explanation:
      "DENSE_RANK ranks distinct values. MAX over an empty result still returns one NULL row, satisfying the spec. B fails with ties; C only does N=2.",
    leetcodeNumber: 177,
    leetcodeSlug: 'nth-highest-salary',
  },

  {
    id: 'hard-rank-scores-dense',
    difficulty: 'hard',
    topic: 'Ranking with no gaps',
    scenario:
      'A leaderboard query needs each score with its rank, ties sharing a rank, with NO gaps after a tie. Sort by score descending.',
    schema: `Scores (id INTEGER, score NUMERIC)`,
    prompt: 'Which query gives that exact behaviour?',
    hint: 'Three ranking functions exist. Only one ranks ties together without skipping numbers.',
    options: [
      `SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS "rank" FROM Scores ORDER BY score DESC;`,
      `SELECT score, RANK() OVER (ORDER BY score DESC) AS "rank" FROM Scores ORDER BY score DESC;`,
      `SELECT score, ROW_NUMBER() OVER (ORDER BY score DESC) AS "rank" FROM Scores ORDER BY score DESC;`,
      `SELECT score, COUNT(DISTINCT score) FROM Scores GROUP BY score;`,
    ],
    correctIndex: 0,
    explanation:
      "DENSE_RANK never skips numbers after a tie. RANK skips; ROW_NUMBER never ties; D counts distincts but does not rank.",
    leetcodeNumber: 178,
    leetcodeSlug: 'rank-scores',
  },

  {
    id: 'hard-department-highest-salary',
    difficulty: 'hard',
    topic: 'Top per group with ties',
    scenario:
      'Return one row per department for the top earner. Ties: include EVERY employee whose salary equals the department maximum.',
    schema: `Employee   (id INTEGER, name TEXT, salary NUMERIC, departmentId INTEGER)
Department (id INTEGER, name TEXT)`,
    prompt: 'Which query handles ties correctly?',
    hint: 'A correlated subquery comparing to the department MAX returns every tied row.',
    options: [
      `SELECT d.name AS Department, e.name AS Employee, e.salary FROM Employee e JOIN Department d ON e.departmentId=d.id WHERE e.salary = (SELECT MAX(salary) FROM Employee WHERE departmentId = e.departmentId);`,
      `SELECT d.name, e.name, MAX(e.salary) FROM Employee e JOIN Department d ON e.departmentId=d.id GROUP BY d.id;`,
      `SELECT d.name, e.name, e.salary FROM Employee e JOIN Department d ON e.departmentId=d.id ORDER BY e.salary DESC LIMIT 1;`,
      `SELECT d.name, e.name, e.salary FROM Employee e JOIN Department d ON e.departmentId=d.id WHERE e.salary = (SELECT MAX(salary) FROM Employee);`,
    ],
    correctIndex: 0,
    explanation:
      "Correlated subquery filters per department and lets ties through. B mixes aggregates with row-level columns. C returns one global row. D uses the global max.",
    leetcodeNumber: 184,
    leetcodeSlug: 'department-highest-salary',
  },

  {
    id: 'hard-department-top-three',
    difficulty: 'hard',
    topic: 'Top N per group',
    scenario:
      'List the three highest DISTINCT salaries in each department, with the employees who earn them. Ties share a rank (so a 3-way tie at rank 1 fills the slot, no rank 4 is shown).',
    schema: `Employee   (id INTEGER, name TEXT, salary NUMERIC, departmentId INTEGER)
Department (id INTEGER, name TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'DENSE_RANK partitioned by department gives a per-department rank that handles ties.',
    options: [
      `WITH r AS (SELECT e.*, DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) AS rnk FROM Employee e) SELECT d.name AS Department, r.name AS Employee, r.salary FROM r JOIN Department d ON r.departmentId=d.id WHERE r.rnk<=3;`,
      `SELECT name, salary FROM Employee ORDER BY salary DESC LIMIT 3;`,
      `SELECT e.* FROM Employee e WHERE e.salary IN (SELECT salary FROM Employee ORDER BY salary DESC LIMIT 3);`,
      `SELECT name, MAX(salary) FROM Employee GROUP BY departmentId LIMIT 3;`,
    ],
    correctIndex: 0,
    explanation:
      "DENSE_RANK partitioned by department handles ties and per-department limits cleanly. B and C ignore the department; D collapses each department to one row.",
    leetcodeNumber: 185,
    leetcodeSlug: 'department-top-three-salaries',
  },

  {
    id: 'hard-consecutive-numbers',
    difficulty: 'hard',
    topic: 'Self-join for runs',
    scenario:
      'A Logs table has rows (id, num). The ids are sequential. Find every num that appears in at least three consecutive rows.',
    schema: `Logs (id INTEGER, num INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Three rows in a row means the same num at id, id+1, id+2.',
    options: [
      `SELECT DISTINCT l1.num AS ConsecutiveNums FROM Logs l1 JOIN Logs l2 ON l1.id+1=l2.id AND l1.num=l2.num JOIN Logs l3 ON l1.id+2=l3.id AND l1.num=l3.num;`,
      `SELECT num FROM Logs GROUP BY num HAVING COUNT(*)>=3;`,
      `SELECT DISTINCT num FROM Logs WHERE num IN (SELECT num FROM Logs GROUP BY num HAVING COUNT(*)=3);`,
      `SELECT num FROM Logs WHERE id BETWEEN 1 AND 3;`,
    ],
    correctIndex: 0,
    explanation:
      "A triple self-join on id+1 and id+2 with the same num is the textbook consecutive-rows pattern. B/C count total occurrences, ignoring the consecutive part.",
    leetcodeNumber: 180,
    leetcodeSlug: 'consecutive-numbers',
  },

  {
    id: 'hard-tree-node',
    difficulty: 'hard',
    topic: 'Three-way CASE classification',
    scenario:
      'A Tree table holds a node hierarchy with (id, p_id) where p_id is the parent id. Classify every node as Root (no parent), Inner (has parent AND appears as someone else parent), or Leaf (has parent, no children).',
    schema: `Tree (id INTEGER, p_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Three cases. Root: p_id IS NULL. Inner: id appears as a p_id somewhere. Leaf: everything else.',
    options: [
      `SELECT id, CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT DISTINCT p_id FROM Tree WHERE p_id IS NOT NULL) THEN 'Inner' ELSE 'Leaf' END AS type FROM Tree;`,
      `SELECT id, CASE WHEN p_id IS NULL THEN 'Root' ELSE 'Leaf' END FROM Tree;`,
      `SELECT id, 'Inner' AS type FROM Tree;`,
      `SELECT id, CASE WHEN p_id=id THEN 'Root' WHEN p_id=0 THEN 'Inner' ELSE 'Leaf' END FROM Tree;`,
    ],
    correctIndex: 0,
    explanation:
      "Three branches in the right order: Root first, then Inner via a parent-side lookup, then Leaf as the default.",
    leetcodeNumber: 608,
    leetcodeSlug: 'tree-node',
  },

  {
    id: 'hard-trips-and-users',
    difficulty: 'hard',
    topic: 'Filter banned users on both sides of a join',
    scenario:
      'Compute the daily cancellation rate of trips for October 1-3, 2013, considering only trips where BOTH the rider and the driver are unbanned. A cancellation is any status that is not "completed". Round to 2 decimals.',
    schema: `Trips (id INTEGER, client_id INTEGER, driver_id INTEGER, city_id INTEGER, status TEXT, request_at DATE)
Users (users_id INTEGER, banned TEXT, role TEXT)`,
    prompt: 'Which approach is correct?',
    hint: 'Join Users twice (once per role) and filter both banned flags to "No".',
    options: [
      `SELECT t.request_at AS Day, ROUND(AVG(CASE WHEN t.status<>'completed' THEN 1.0 ELSE 0 END),2) AS rate FROM Trips t JOIN Users c ON t.client_id=c.users_id JOIN Users d ON t.driver_id=d.users_id WHERE c.banned='No' AND d.banned='No' AND t.request_at BETWEEN '2013-10-01' AND '2013-10-03' GROUP BY t.request_at;`,
      `SELECT request_at, COUNT(*) FROM Trips GROUP BY request_at;`,
      `SELECT request_at, AVG(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) FROM Trips WHERE request_at BETWEEN '2013-10-01' AND '2013-10-03';`,
      `SELECT t.request_at, AVG(CASE WHEN status='completed' THEN 1 ELSE 0 END) FROM Trips t JOIN Users c ON t.client_id=c.users_id WHERE c.banned='No' GROUP BY t.request_at;`,
    ],
    correctIndex: 0,
    explanation:
      "Two joins, one per role, both filtered to banned='No'. AVG of a 1/0 expression yields the cancellation fraction. Other options miss a side or miscount status.",
    leetcodeNumber: 262,
    leetcodeSlug: 'trips-and-users',
  },

  {
    id: 'hard-managers-five-reports',
    difficulty: 'hard',
    topic: 'Filter by aggregate from a subquery',
    scenario:
      'List the names of every manager who has at least 5 direct reports in the Employee table.',
    schema: `Employee (id INTEGER, name TEXT, department TEXT, managerId INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Aggregate the reports per managerId first, then look up the manager names.',
    options: [
      `SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);`,
      `SELECT name FROM Employee WHERE managerId >= 5;`,
      `SELECT name FROM Employee GROUP BY name HAVING COUNT(*) >= 5;`,
      `SELECT name FROM Employee WHERE COUNT(managerId) >= 5;`,
    ],
    correctIndex: 0,
    explanation:
      "Inner query: managers with >= 5 reports. Outer: their names. WHERE cannot use COUNT directly; B and C compare the id, not the report count.",
    leetcodeNumber: 570,
    leetcodeSlug: 'managers-with-at-least-5-direct-reports',
  },

  {
    id: 'hard-exchange-seats',
    difficulty: 'hard',
    topic: 'CASE on parity',
    scenario:
      'A Seat table holds (id, student). Swap adjacent pairs: odd id swaps with the next even id. If the highest id is odd, that last seat stays where it is.',
    schema: `Seat (id INTEGER, student TEXT)`,
    prompt: 'Which query returns the swapped order, sorted by id?',
    hint: 'Three branches: the last odd seat stays; other odds become +1; evens become -1.',
    options: [
      `SELECT CASE WHEN id%2=1 AND id=(SELECT MAX(id) FROM Seat) THEN id WHEN id%2=1 THEN id+1 ELSE id-1 END AS id, student FROM Seat ORDER BY id;`,
      `SELECT id, student FROM Seat ORDER BY id DESC;`,
      `SELECT id+1 AS id, student FROM Seat;`,
      `SELECT id, student FROM Seat ORDER BY id%2;`,
    ],
    correctIndex: 0,
    explanation:
      "Three CASE branches handle the last-odd, other-odd, and even cases. ORDER BY id after the rename puts the swapped seats in order.",
    leetcodeNumber: 626,
    leetcodeSlug: 'exchange-seats',
  },

  {
    id: 'hard-reformat-department',
    difficulty: 'hard',
    topic: 'Pivot via conditional aggregation',
    scenario:
      'A Department table holds (id, revenue, month CHAR(3)). Pivot it: one row per id, twelve columns named Jan_Revenue, Feb_Revenue, ..., Dec_Revenue.',
    schema: `Department (id INTEGER, revenue NUMERIC, month CHAR(3))`,
    prompt: 'Which approach is the portable pivot?',
    hint: 'SUM of a CASE WHEN month = "Jan" produces the Jan column. Non-matching rows are NULL and ignored.',
    options: [
      `SELECT id, SUM(CASE WHEN month='Jan' THEN revenue END) AS Jan_Revenue, SUM(CASE WHEN month='Feb' THEN revenue END) AS Feb_Revenue, SUM(CASE WHEN month='Dec' THEN revenue END) AS Dec_Revenue FROM Department GROUP BY id;`,
      `SELECT * FROM Department PIVOT_ON month;`,
      `SELECT id, MONTH(revenue) FROM Department GROUP BY id;`,
      `SELECT id, month, revenue FROM Department ORDER BY id, month;`,
    ],
    correctIndex: 0,
    explanation:
      "Conditional aggregation is the portable pivot pattern. SUM (or MAX) of a CASE collapses by id; non-matching rows are NULL and skipped by SUM.",
    leetcodeNumber: 1179,
    leetcodeSlug: 'reformat-department-table',
  },

  {
    id: 'hard-restaurant-3day-moving',
    difficulty: 'hard',
    topic: 'Trailing window with ROWS BETWEEN',
    scenario:
      'A Customer table records (customer_id, name, visited_on, amount) with daily totals already aggregated per date. For every day from the third day onwards, return the 3-day moving sum (today plus the two previous days) and the 3-day moving average, rounded to 2 decimals.',
    schema: `Customer (customer_id INTEGER, name TEXT, visited_on DATE, amount NUMERIC)`,
    prompt: 'Which window-function frame is correct for the sum?',
    hint: 'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is the trailing 3-row window.',
    options: [
      `SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`,
      `SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING)`,
      `SUM(amount) OVER (PARTITION BY visited_on)`,
      `SUM(amount) OVER ()`,
    ],
    correctIndex: 0,
    explanation:
      "A trailing 3-day window is current row plus two PRECEDING rows. OVER () is the grand total. OVER (PARTITION BY visited_on) gives just today.",
    leetcodeNumber: 1321,
    leetcodeSlug: 'restaurant-growth',
  },

  {
    id: 'hard-market-analysis-i',
    difficulty: 'hard',
    topic: 'LEFT JOIN with filter inside ON',
    scenario:
      'For every user, return user_id, join_date, and the number of orders placed in 2019. Users who placed zero 2019 orders should appear with 0.',
    schema: `Users  (user_id INTEGER, join_date DATE)
Orders (order_id INTEGER, order_date DATE, item_id INTEGER, buyer_id INTEGER, seller_id INTEGER)`,
    prompt: 'Which query preserves users with zero 2019 orders?',
    hint: 'Putting the year filter in WHERE silently turns a LEFT JOIN into an INNER JOIN.',
    options: [
      `SELECT u.user_id AS buyer_id, u.join_date, COUNT(o.order_id) AS orders_in_2019 FROM Users u LEFT JOIN Orders o ON u.user_id=o.buyer_id AND EXTRACT(YEAR FROM o.order_date)=2019 GROUP BY u.user_id, u.join_date;`,
      `SELECT u.user_id, u.join_date, COUNT(o.order_id) FROM Users u JOIN Orders o ON u.user_id=o.buyer_id WHERE EXTRACT(YEAR FROM o.order_date)=2019 GROUP BY u.user_id, u.join_date;`,
      `SELECT user_id, join_date, COUNT(*) FROM Users GROUP BY user_id, join_date;`,
      `SELECT u.user_id, u.join_date, COUNT(o.order_id) FROM Users u LEFT JOIN Orders o ON u.user_id=o.buyer_id WHERE EXTRACT(YEAR FROM o.order_date)=2019 GROUP BY u.user_id, u.join_date;`,
    ],
    correctIndex: 0,
    explanation:
      "Putting the year filter in ON keeps the LEFT JOIN semantics. The same filter in WHERE drops users with no matching orders because their year column is NULL.",
    leetcodeNumber: 1158,
    leetcodeSlug: 'market-analysis-i',
  },

  {
    id: 'hard-capital-gain-loss',
    difficulty: 'hard',
    topic: 'Signed conditional sum',
    scenario:
      'A Stocks table records (stock_name, operation Buy or Sell, operation_date, price). For each stock_name, return the total profit: total Sell amount minus total Buy amount.',
    schema: `Stocks (stock_name TEXT, operation TEXT, operation_date DATE, price NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'A signed sum: Sell counts positive, Buy counts negative.',
    options: [
      `SELECT stock_name, SUM(CASE WHEN operation='Sell' THEN price ELSE -price END) AS capital_gain_loss FROM Stocks GROUP BY stock_name;`,
      `SELECT stock_name, SUM(price) FROM Stocks GROUP BY stock_name;`,
      `SELECT stock_name, MAX(price)-MIN(price) FROM Stocks GROUP BY stock_name;`,
      `SELECT stock_name, AVG(CASE WHEN operation='Sell' THEN price END) - AVG(CASE WHEN operation='Buy' THEN price END) FROM Stocks GROUP BY stock_name;`,
    ],
    correctIndex: 0,
    explanation:
      "Signed sum: Sell positive, Buy negative, totals up to net profit. B ignores direction; D averages, losing position size.",
    leetcodeNumber: 1393,
    leetcodeSlug: 'capital-gainloss',
  },

  {
    id: 'hard-last-person-on-bus',
    difficulty: 'hard',
    topic: 'Running sum threshold',
    scenario:
      'A Queue (person_id, person_name, weight, turn) lists riders in boarding order. A bus has a 1000 kg limit. Return the LAST person whose cumulative weight (in turn order) is still at or below 1000.',
    schema: `Queue (person_id INTEGER, person_name TEXT, weight NUMERIC, turn INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'A running sum ordered by turn lets you keep rows where the total is at most 1000, then pick the one with the largest total.',
    options: [
      `WITH r AS (SELECT person_name, SUM(weight) OVER (ORDER BY turn) AS total FROM Queue) SELECT person_name FROM r WHERE total <= 1000 ORDER BY total DESC LIMIT 1;`,
      `SELECT person_name FROM Queue WHERE weight <= 1000 ORDER BY turn DESC LIMIT 1;`,
      `SELECT person_name FROM Queue ORDER BY turn DESC LIMIT 1;`,
      `SELECT person_name FROM Queue GROUP BY person_name HAVING SUM(weight) <= 1000;`,
    ],
    correctIndex: 0,
    explanation:
      "Running cumulative sum ordered by turn. Keep rows where the running total fits, then pick the one with the largest running total (the last to safely board).",
    leetcodeNumber: 1204,
    leetcodeSlug: 'last-person-to-fit-in-the-bus',
  },

  {
    id: 'hard-game-play-analysis-iv',
    difficulty: 'hard',
    topic: 'Day-after-first-login fraction',
    scenario:
      'Find the fraction of players who logged in on the day right after their first login. Round to 2 decimals.',
    schema: `Activity (player_id INTEGER, device_id INTEGER, event_date DATE, games_played INTEGER)`,
    prompt: 'Which approach is correct?',
    hint: 'Per-player first login via MIN, then check if first_login + 1 day exists in the table.',
    options: [
      `WITH f AS (SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id) SELECT ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM f), 2) AS fraction FROM f WHERE (player_id, first_login + INTERVAL '1 day') IN (SELECT player_id, event_date FROM Activity);`,
      `SELECT COUNT(DISTINCT player_id) / COUNT(*) FROM Activity;`,
      `SELECT player_id, MIN(event_date) FROM Activity GROUP BY player_id;`,
      `SELECT AVG(games_played) FROM Activity;`,
      ],
    correctIndex: 0,
    explanation:
      "Per-player first login plus an existence check for the next-day row. Numerator: matches. Denominator: total players from f.",
    leetcodeNumber: 550,
    leetcodeSlug: 'game-play-analysis-iv',
  },

  {
    id: 'hard-most-friends',
    difficulty: 'hard',
    topic: 'UNION ALL across symmetric pairs',
    scenario:
      'A RequestAccepted table records (requester_id, accepter_id, accept_date). A friendship is bidirectional: each accepted request connects both sides. Find the person with the largest number of friends.',
    schema: `RequestAccepted (requester_id INTEGER, accepter_id INTEGER, accept_date DATE)`,
    prompt: 'Which approach is correct?',
    hint: 'Both columns count as a person. Stack them with UNION ALL, then group and count.',
    options: [
      `WITH p AS (SELECT requester_id AS id FROM RequestAccepted UNION ALL SELECT accepter_id FROM RequestAccepted) SELECT id, COUNT(*) AS num FROM p GROUP BY id ORDER BY num DESC LIMIT 1;`,
      `SELECT requester_id FROM RequestAccepted GROUP BY requester_id ORDER BY COUNT(*) DESC LIMIT 1;`,
      `SELECT accepter_id FROM RequestAccepted GROUP BY accepter_id ORDER BY COUNT(*) DESC LIMIT 1;`,
      `SELECT requester_id, accepter_id FROM RequestAccepted LIMIT 1;`,
    ],
    correctIndex: 0,
    explanation:
      "A friendship adds 1 to BOTH sides. UNION ALL unifies the two columns into one count per person. B and C only count one side.",
    leetcodeNumber: 602,
    leetcodeSlug: 'friend-requests-ii-who-has-the-most-friends',
  },

  {
    id: 'hard-calls-between-persons',
    difficulty: 'hard',
    topic: 'Normalize undirected pairs',
    scenario:
      'A Calls table has (from_id, to_id, duration). Return each unordered pair (person1 = smaller id, person2 = larger id) with the total call count and total duration between them.',
    schema: `Calls (from_id INTEGER, to_id INTEGER, duration INTEGER)`,
    prompt: 'Which query normalizes direction and aggregates correctly?',
    hint: 'LEAST and GREATEST collapse both directions into a canonical (smaller, larger) pair.',
    options: [
      `SELECT LEAST(from_id, to_id) AS person1, GREATEST(from_id, to_id) AS person2, COUNT(*) AS call_count, SUM(duration) AS total_duration FROM Calls GROUP BY person1, person2;`,
      `SELECT from_id, to_id, COUNT(*) FROM Calls GROUP BY from_id, to_id;`,
      `SELECT from_id, to_id, SUM(duration) FROM Calls;`,
      `SELECT CONCAT(from_id, to_id), COUNT(*) FROM Calls GROUP BY 1;`,
    ],
    correctIndex: 0,
    explanation:
      "LEAST and GREATEST turn (A,B) and (B,A) into the same canonical pair. Group by the canonical columns and aggregate.",
    leetcodeNumber: 1699,
    leetcodeSlug: 'number-of-calls-between-two-persons',
  },

  // ------------------------------------------------------------
  // Custom hard questions (no LeetCode link). These cover deeper
  // patterns that pair well with the LeetCode-mirrored set.
  // ------------------------------------------------------------

  {
    id: 'hard-median-window',
    difficulty: 'hard',
    topic: 'Median via window functions',
    scenario:
      'Return the median salary across all employees. The query should handle both odd and even total row counts: odd takes the middle, even averages the two middles.',
    schema: `Employees (id INTEGER, salary NUMERIC)`,
    prompt: 'Which query gives the median in portable SQL?',
    hint: 'For total count N, the median rows are at positions floor((N+1)/2) and floor((N+2)/2). When N is odd both pick the same row.',
    options: [
      `WITH r AS (SELECT salary, ROW_NUMBER() OVER (ORDER BY salary) AS rn, COUNT(*) OVER () AS cnt FROM Employees) SELECT AVG(salary) FROM r WHERE rn IN ((cnt+1)/2, (cnt+2)/2);`,
      `SELECT salary FROM Employees ORDER BY salary LIMIT 1 OFFSET (SELECT COUNT(*)/2 FROM Employees);`,
      `SELECT MEDIAN(salary) FROM Employees;`,
      `SELECT AVG(MAX(salary), MIN(salary)) FROM Employees;`,
    ],
    correctIndex: 0,
    explanation:
      "Pick the one or two middle rows by ROW_NUMBER and total count, then average. MEDIAN is not standard SQL; D mixes per-row and aggregate scope.",
  },

  {
    id: 'hard-lag-delta',
    difficulty: 'hard',
    topic: 'LAG for row-to-row deltas',
    scenario:
      'A Sales table lists (sale_date, amount) for each day. Return each date with the difference from the previous date amount. The first date has NULL.',
    schema: `Sales (sale_date DATE, amount NUMERIC)`,
    prompt: 'Which window function is correct?',
    hint: 'LAG returns the value from the previous row in the ordered window. LEAD looks forward, the wrong direction here.',
    options: [
      `SELECT sale_date, amount - LAG(amount) OVER (ORDER BY sale_date) AS delta FROM Sales;`,
      `SELECT sale_date, amount - LEAD(amount) OVER (ORDER BY sale_date) AS delta FROM Sales;`,
      `SELECT sale_date, amount - amount FROM Sales;`,
      `SELECT sale_date, SUM(amount) OVER () - amount FROM Sales;`,
    ],
    correctIndex: 0,
    explanation:
      "LAG fetches the previous row in the ordering. LEAD fetches the next, giving today minus tomorrow. The first row has no previous value, so the LAG returns NULL.",
  },

  {
    id: 'hard-ntile-quartile',
    difficulty: 'hard',
    topic: 'NTILE bucketing',
    scenario:
      'Split employees into four salary quartiles where quartile 1 contains the highest earners. Return employee_id and quartile.',
    schema: `Employees (employee_id INTEGER, salary NUMERIC)`,
    prompt: 'Which window function fits exactly?',
    hint: 'NTILE(N) divides the ordered rows into N evenly sized buckets.',
    options: [
      `SELECT employee_id, NTILE(4) OVER (ORDER BY salary DESC) AS quartile FROM Employees;`,
      `SELECT employee_id, salary / 4 AS quartile FROM Employees;`,
      `SELECT employee_id, COUNT(*) OVER () / 4 FROM Employees;`,
      `SELECT employee_id, RANK() OVER (ORDER BY salary DESC) AS quartile FROM Employees;`,
    ],
    correctIndex: 0,
    explanation:
      "NTILE(4) drops each row into one of four equally sized buckets. ORDER BY salary DESC makes bucket 1 the top earners. RANK numbers each row, not in fours.",
  },

  {
    id: 'hard-jsonb-extract-postgres',
    difficulty: 'hard',
    topic: 'JSON extraction in Postgres',
    scenario:
      'A Postgres profiles table has a JSONB column data shaped like {"city": "Cairo", "age": 31}. Return every row where data.city equals Cairo. Use plain text comparison.',
    schema: `profiles (id INTEGER, data JSONB)`,
    prompt: 'Which query is correct?',
    hint: 'In Postgres, -> returns a JSON value, ->> returns the value as plain text. A text comparison needs ->>.',
    options: [
      `SELECT * FROM profiles WHERE data->>'city' = 'Cairo';`,
      `SELECT * FROM profiles WHERE data->'city' = 'Cairo';`,
      `SELECT * FROM profiles WHERE data = 'Cairo';`,
      `SELECT * FROM profiles WHERE data.city = 'Cairo';`,
    ],
    correctIndex: 0,
    explanation:
      "->> extracts the value as text, suitable for the string comparison. -> keeps it as JSON, so the comparison fails. D is not Postgres syntax.",
  },

  {
    id: 'hard-not-exists-anti-join',
    difficulty: 'hard',
    topic: 'NOT EXISTS over NOT IN',
    scenario:
      'Return every customer who has placed no orders. The orders.customer_id column is nullable, which means the classic NOT IN form is risky.',
    schema: `customers (id INTEGER)
orders    (id INTEGER, customer_id INTEGER)`,
    prompt: 'Which form is the safest portable choice?',
    hint: 'NOT EXISTS is unaffected by NULLs inside the subquery; NOT IN silently returns empty when any list value is NULL.',
    options: [
      `SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);`,
      `SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);`,
      `SELECT c.id FROM customers c LEFT JOIN orders o ON c.id=o.customer_id WHERE o.id <> NULL;`,
      `SELECT id FROM customers EXCEPT SELECT id FROM orders;`,
    ],
    correctIndex: 0,
    explanation:
      "NOT EXISTS is safe against NULLs in the subquery. NOT IN silently fails when a NULL is in the list. <> NULL is never true. D compares to orders.id, not customer_id.",
  },

  {
    id: 'hard-update-correlated-flag',
    difficulty: 'hard',
    topic: 'UPDATE with correlated NOT EXISTS',
    scenario:
      'Mark a customer as "inactive" when they have not placed any order in the last 365 days. Only the status column should change.',
    schema: `customers (id INTEGER, status TEXT)
orders    (id INTEGER, customer_id INTEGER, ordered_at TIMESTAMP)`,
    prompt: 'Which UPDATE is correct in standard SQL?',
    hint: 'A correlated NOT EXISTS scoped to the recency window flips the right rows.',
    options: [
      `UPDATE customers c SET status = 'inactive' WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.ordered_at >= CURRENT_DATE - INTERVAL '365 days');`,
      `UPDATE customers SET status = 'inactive' WHERE id NOT IN (SELECT customer_id FROM orders);`,
      `UPDATE customers SET status = 'inactive' WHERE last_order_date < NOW() - 365;`,
      `UPDATE customers SET status = 'inactive';`,
    ],
    correctIndex: 0,
    explanation:
      "NOT EXISTS scoped to the recency window flips only customers with no recent orders. B ignores time; C references a column that does not exist; D wipes everyone.",
  },

  {
    id: 'hard-pivot-conditional',
    difficulty: 'hard',
    topic: 'Conditional aggregation as a pivot',
    scenario:
      'A single row should show paid_total, pending_total, and refunded_total from the orders table.',
    schema: `orders (id INTEGER, status TEXT, total NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'SUM of a CASE WHEN per category. No GROUP BY since you want one row.',
    options: [
      `SELECT SUM(CASE WHEN status='paid' THEN total ELSE 0 END) AS paid_total, SUM(CASE WHEN status='pending' THEN total ELSE 0 END) AS pending_total, SUM(CASE WHEN status='refunded' THEN total ELSE 0 END) AS refunded_total FROM orders;`,
      `SELECT status, SUM(total) FROM orders GROUP BY status;`,
      `SELECT SUM(total) FROM orders WHERE status IN ('paid','pending','refunded');`,
      `SELECT SUM(total) FROM orders PIVOT BY status;`,
    ],
    correctIndex: 0,
    explanation:
      "Conditional SUM produces one column per category. B is a tall result, not wide. D is non-standard.",
  },

  {
    id: 'hard-share-of-category',
    difficulty: 'hard',
    topic: 'Window with PARTITION BY for share-of-group',
    scenario:
      'For each product, return its share of its category total revenue (between 0 and 1).',
    schema: `products (id INTEGER, category TEXT, revenue NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'SUM(revenue) OVER (PARTITION BY category) gives the per-category total alongside each row.',
    options: [
      `SELECT id, category, revenue * 1.0 / SUM(revenue) OVER (PARTITION BY category) AS share FROM products;`,
      `SELECT id, category, revenue * 1.0 / SUM(revenue) FROM products;`,
      `SELECT id, category, revenue * 1.0 / SUM(revenue) OVER () FROM products;`,
      `SELECT id, category, AVG(revenue) FROM products GROUP BY category;`,
    ],
    correctIndex: 0,
    explanation:
      "PARTITION BY category recomputes the SUM per category alongside the row. Without PARTITION, you get the grand total instead.",
  },

  {
    id: 'hard-yoy-growth',
    difficulty: 'hard',
    topic: 'Year-over-year growth with LAG',
    scenario:
      'For each year in the orders table, return total revenue and the percentage change versus the previous year. The first year has NULL pct_change.',
    schema: `orders (id INTEGER, total NUMERIC, ordered_at DATE)`,
    prompt: 'Which query is correct?',
    hint: 'Build a per-year CTE, then LAG to get last year, then compute (this minus last) / last * 100.',
    options: [
      `WITH y AS (SELECT EXTRACT(YEAR FROM ordered_at) AS yr, SUM(total) AS rev FROM orders GROUP BY 1) SELECT yr, rev, ROUND((rev - LAG(rev) OVER (ORDER BY yr)) * 100.0 / LAG(rev) OVER (ORDER BY yr), 2) AS pct_change FROM y;`,
      `SELECT EXTRACT(YEAR FROM ordered_at), SUM(total) FROM orders GROUP BY 1;`,
      `SELECT yr, rev - LEAD(rev) OVER (ORDER BY yr) FROM y;`,
      `SELECT yr, rev / LAG(rev) OVER (ORDER BY yr) FROM y;`,
    ],
    correctIndex: 0,
    explanation:
      "Per-year totals plus LAG for last year, then (now - last) / last * 100 with rounding. LEAD looks at next year, wrong direction.",
  },

  {
    id: 'hard-two-level-self-join',
    difficulty: 'hard',
    topic: 'Two-level self-join',
    scenario:
      'Return every employee with their manager name AND their grandboss name (their manager manager). When either is missing, the value should be NULL.',
    schema: `employees (id INTEGER, name TEXT, manager_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Two LEFT JOINs of employees onto itself, each stepping one level up.',
    options: [
      `SELECT e.name, m.name AS manager, g.name AS grandboss FROM employees e LEFT JOIN employees m ON e.manager_id=m.id LEFT JOIN employees g ON m.manager_id=g.id;`,
      `SELECT e.name, m.name FROM employees e JOIN employees m ON e.manager_id=m.id;`,
      `SELECT name, name, name FROM employees;`,
      `SELECT name, manager_id, manager_id FROM employees;`,
    ],
    correctIndex: 0,
    explanation:
      "Two LEFT JOINs of employees onto itself walk two steps up the tree, keeping rows even when a manager or grandboss is missing.",
  },

  {
    id: 'hard-gaps-and-islands',
    difficulty: 'hard',
    topic: 'Gaps and islands group key',
    scenario:
      'A logins table has one row per (user_id, login_date). To find each user longest streak of consecutive daily logins, the classic trick is to subtract a row counter from the date so consecutive days collapse to the same key.',
    schema: `logins (user_id INTEGER, login_date DATE)`,
    prompt: 'Which group key gives one value per run of consecutive days?',
    hint: 'Subtract a per-user row number (one per day) from the date. Consecutive days drop to a constant.',
    options: [
      `login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)) * INTERVAL '1 day'`,
      `login_date - LAG(login_date) OVER (ORDER BY login_date)`,
      `ROW_NUMBER() OVER ()`,
      `SUM(1) OVER (PARTITION BY login_date)`,
    ],
    correctIndex: 0,
    explanation:
      "Subtracting the row number (one per day) from the date gives a constant per run of consecutive days. Group by that key to find the runs.",
  },

  {
    id: 'hard-cross-join-triangles',
    difficulty: 'hard',
    topic: 'CROSS JOIN for Cartesian filter',
    scenario:
      'A Sides table has one column value (integer side lengths). Return every combination of three sides (a, b, c) that satisfies the triangle inequality.',
    schema: `Sides (value INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Three independent copies via CROSS JOIN, then filter by the triangle rule.',
    options: [
      `SELECT a.value, b.value, c.value FROM Sides a CROSS JOIN Sides b CROSS JOIN Sides c WHERE a.value+b.value>c.value AND b.value+c.value>a.value AND a.value+c.value>b.value;`,
      `SELECT * FROM Sides a, Sides b WHERE a.value<b.value;`,
      `SELECT * FROM Sides a JOIN Sides b USING(value);`,
      `SELECT * FROM Sides a JOIN Sides b ON a.value+b.value>0;`,
    ],
    correctIndex: 0,
    explanation:
      "Three CROSS JOINs produce the full Cartesian product. The triangle rule then filters down to valid triples.",
  },

  {
    id: 'hard-intersect',
    difficulty: 'hard',
    topic: 'INTERSECT set operation',
    scenario:
      'Return every user_id present in BOTH the premium table AND the verified table. Both tables have the same single user_id column.',
    schema: `premium  (user_id INTEGER)
verified (user_id INTEGER)`,
    prompt: 'Which query is correct in standard SQL?',
    hint: 'There is a set operator whose result is rows present in both inputs.',
    options: [
      `SELECT user_id FROM premium INTERSECT SELECT user_id FROM verified;`,
      `SELECT user_id FROM premium UNION SELECT user_id FROM verified;`,
      `SELECT user_id FROM premium AND verified;`,
      `SELECT user_id FROM premium JOIN verified;`,
    ],
    correctIndex: 0,
    explanation:
      "INTERSECT keeps rows present in both result sets. UNION keeps either side. AND is not a table operator. D is missing the ON clause.",
  },

  {
    id: 'hard-dedup-keep-latest',
    difficulty: 'hard',
    topic: 'Keep latest per (user, field)',
    scenario:
      'A users_audit table records every change as (user_id, changed_at, field, new_value). For each (user_id, field), return only the most recent change, with new_value and changed_at attached.',
    schema: `users_audit (user_id INTEGER, changed_at TIMESTAMP, field TEXT, new_value TEXT)`,
    prompt: 'Which window-function approach keeps the right rows?',
    hint: 'ROW_NUMBER partitioned by (user_id, field) ordered by changed_at DESC. Keep rn = 1.',
    options: [
      `WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id, field ORDER BY changed_at DESC) AS rn FROM users_audit) SELECT user_id, field, new_value, changed_at FROM r WHERE rn = 1;`,
      `SELECT DISTINCT user_id, field, new_value FROM users_audit;`,
      `SELECT user_id, field, MAX(changed_at) FROM users_audit GROUP BY user_id, field;`,
      `SELECT * FROM users_audit ORDER BY changed_at DESC LIMIT 1;`,
    ],
    correctIndex: 0,
    explanation:
      "ROW_NUMBER partitioned by the dedup key lets you select the actual row, not just MAX(changed_at). C gives the date but loses the new_value tied to it.",
  },

  {
    id: 'hard-lateral-postgres',
    difficulty: 'hard',
    topic: 'LATERAL JOIN for per-row subquery',
    scenario:
      'In Postgres, return each customer name with their three most recent orders (id and ordered_at).',
    schema: `customers (id INTEGER, name TEXT)
orders    (id INTEGER, customer_id INTEGER, ordered_at TIMESTAMP)`,
    prompt: 'Which query is correct?',
    hint: 'LATERAL lets the right-hand subquery reference outer columns. CROSS JOIN LATERAL re-runs it per outer row.',
    options: [
      `SELECT c.name, o.id, o.ordered_at FROM customers c CROSS JOIN LATERAL (SELECT id, ordered_at FROM orders WHERE customer_id=c.id ORDER BY ordered_at DESC LIMIT 3) o;`,
      `SELECT c.name, o.id, o.ordered_at FROM customers c JOIN orders o ON c.id=o.customer_id ORDER BY o.ordered_at DESC LIMIT 3;`,
      `SELECT c.name, (SELECT id FROM orders WHERE customer_id=c.id LIMIT 3) FROM customers c;`,
      `SELECT c.name, ROW_NUMBER() OVER (ORDER BY o.ordered_at DESC) FROM customers c JOIN orders o ON c.id=o.customer_id;`,
    ],
    correctIndex: 0,
    explanation:
      "LATERAL re-runs the subquery per outer row, naturally giving 3 per customer. B returns 3 rows globally. C errors: a scalar subquery cannot return 3 rows.",
  },
];
