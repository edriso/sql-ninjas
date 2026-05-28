import type { Question } from '../types';

/**
 * Easy SQL questions. Goal: bread-and-butter SELECT, WHERE, JOIN,
 * GROUP BY, NULL handling, and the small syntax traps every junior
 * trips on at least once. Each scenario is something a real team
 * could ask in a stand-up.
 *
 * Authoring rules (enforced by scripts/audit-questions.ts):
 *  - exactly 4 options, each <= OPTION_MAX_CHARS (see src/lib/limits.ts)
 *  - explanation <= EXPLANATION_MAX_CHARS (Telegram quiz poll limit)
 *  - correctIndex is 0..3
 *  - id starts with "easy-" and is unique
 *  - if leetcodeNumber/leetcodeSlug are set, both must be set
 */
export const easyQuestions: readonly Question[] = [
  {
    id: 'easy-where-quotes',
    difficulty: 'easy',
    topic: 'WHERE and string literals',
    scenario:
      'A small online bookstore wants to email customers who live in London about a local in-store event.',
    schema: `customers (
  id    INTEGER,
  name  TEXT,
  city  TEXT,
  email TEXT
)`,
    prompt: 'Which query returns the email of every customer who lives in London?',
    hint: 'Text values are wrapped in a specific quote character in standard SQL. The other quote means something different.',
    options: [
      `SELECT email FROM customers WHERE city = London;`,
      `SELECT email FROM customers WHERE city = "London";`,
      `SELECT email FROM customers WHERE city = 'London';`,
      `SELECT email FROM customers WHERE city == 'London';`,
    ],
    correctIndex: 2,
    explanation:
      "Single quotes mark a text value. Double quotes mean an identifier in standard SQL, and == is not valid SQL anywhere.",
  },

  {
    id: 'easy-is-null',
    difficulty: 'easy',
    topic: 'NULL handling',
    scenario:
      'The HR team is preparing the next round of manager assignments and wants the list of employees who do not have a manager yet.',
    schema: `employees (
  id         INTEGER,
  name       TEXT,
  manager_id INTEGER
)`,
    prompt: 'Which query returns those employees?',
    hint: 'NULL means "unknown" and is never equal to anything, not even to another NULL.',
    options: [
      `SELECT name FROM employees WHERE manager_id = NULL;`,
      `SELECT name FROM employees WHERE manager_id IS NULL;`,
      `SELECT name FROM employees WHERE manager_id != 0;`,
      `SELECT name FROM employees WHERE NOT manager_id;`,
    ],
    correctIndex: 1,
    explanation:
      "NULL is never equal to anything, so = NULL always returns no rows. Use IS NULL (or IS NOT NULL) to test for missing values.",
  },

  {
    id: 'easy-order-limit',
    difficulty: 'easy',
    topic: 'ORDER BY and LIMIT',
    scenario:
      'A product manager is preparing a promo banner and asks for the 5 most expensive items in the catalog, most expensive first.',
    schema: `products (
  id    INTEGER,
  name  TEXT,
  price NUMERIC
)`,
    prompt: 'Which query returns those 5 products in the right order?',
    hint: 'You sort the rows first, then take the top of the sorted list. The clauses go in a fixed order.',
    options: [
      `SELECT name FROM products LIMIT 5 ORDER BY price DESC;`,
      `SELECT name FROM products ORDER BY price ASC LIMIT 5;`,
      `SELECT name FROM products ORDER BY price DESC LIMIT 5;`,
      `SELECT TOP 5 name FROM products WHERE price > 100;`,
    ],
    correctIndex: 2,
    explanation:
      "ORDER BY always comes before LIMIT. DESC puts the largest values first. SELECT TOP is a SQL Server dialect and not standard.",
  },

  {
    id: 'easy-group-count',
    difficulty: 'easy',
    topic: 'GROUP BY with COUNT',
    scenario:
      'A school principal wants to see how many students are enrolled in each class so she can balance the timetable.',
    schema: `students (
  id       INTEGER,
  name     TEXT,
  class_id INTEGER
)`,
    prompt: 'Which query returns each class_id with the number of students in it?',
    hint: 'Group by the column you want to count by. Counting by id would count every row separately.',
    options: [
      `SELECT class_id, COUNT(*) FROM students;`,
      `SELECT class_id, COUNT(*) FROM students GROUP BY id;`,
      `SELECT class_id, COUNT(*) FROM students GROUP BY class_id;`,
      `SELECT class_id, COUNT(class_id) FROM students ORDER BY class_id;`,
    ],
    correctIndex: 2,
    explanation:
      "GROUP BY the same column you select next to the aggregate. Without GROUP BY (option A) many engines reject the query.",
  },

  {
    id: 'easy-left-join-anti',
    difficulty: 'easy',
    topic: 'LEFT JOIN for anti-joins',
    scenario:
      'A SaaS team wants to send a "we miss you" email to customers who have never placed an order on their store.',
    schema: `customers (id INTEGER, name TEXT)
orders    (id INTEGER, customer_id INTEGER, total NUMERIC)`,
    prompt: 'Which query returns customers who have no orders at all?',
    hint: 'A LEFT JOIN keeps every customer; the order side is NULL when there is no match.',
    options: [
      `SELECT c.name FROM customers c JOIN orders o ON c.id = o.customer_id;`,
      `SELECT c.name FROM customers c LEFT JOIN orders o ON c.id=o.customer_id WHERE o.id IS NULL;`,
      `SELECT c.name FROM customers c LEFT JOIN orders o ON c.id=o.customer_id WHERE o.id = 0;`,
      `SELECT c.name FROM customers c WHERE c.id NOT IN orders;`,
    ],
    correctIndex: 1,
    explanation:
      "LEFT JOIN keeps every customer. Customers with no orders show NULL on the orders side, so IS NULL filters them out. This is the anti-join pattern.",
    leetcodeNumber: 183,
    leetcodeSlug: 'customers-who-never-order',
  },

  {
    id: 'easy-distinct',
    difficulty: 'easy',
    topic: 'DISTINCT',
    scenario:
      'A marketing analyst wants the list of cities the company sells to, with each city appearing only once.',
    schema: `customers (
  id   INTEGER,
  name TEXT,
  city TEXT
)`,
    prompt: 'Which query returns each city only once?',
    hint: 'There is one keyword that removes duplicate rows from a SELECT result.',
    options: [
      `SELECT city FROM customers;`,
      `SELECT UNIQUE city FROM customers;`,
      `SELECT DISTINCT city FROM customers;`,
      `SELECT city FROM customers GROUP BY name;`,
    ],
    correctIndex: 2,
    explanation:
      "DISTINCT removes duplicate rows from the result. UNIQUE is a constraint name, not a SELECT modifier in standard SQL.",
  },

  {
    id: 'easy-like',
    difficulty: 'easy',
    topic: 'LIKE patterns',
    scenario:
      'A support engineer needs every user whose email ends with @gmail.com so the team can investigate a delivery issue.',
    schema: `users (
  id    INTEGER,
  email TEXT
)`,
    prompt: 'Which query returns those users?',
    hint: '% matches any number of characters, including zero. = is an exact match, not a pattern.',
    options: [
      `SELECT email FROM users WHERE email = '%@gmail.com';`,
      `SELECT email FROM users WHERE email LIKE '%@gmail.com';`,
      `SELECT email FROM users WHERE email LIKE '@gmail.com%';`,
      `SELECT email FROM users WHERE email LIKE '*@gmail.com';`,
    ],
    correctIndex: 1,
    explanation:
      "LIKE plus % matches anything before @gmail.com. The * wildcard is for shells and regex, not SQL LIKE. = treats % as a literal character.",
  },

  {
    id: 'easy-between-dates',
    difficulty: 'easy',
    topic: 'BETWEEN and dates',
    scenario:
      'An accountant is closing the books for March 2026 and needs every invoice issued in that month.',
    schema: `invoices (
  id          INTEGER,
  customer_id INTEGER,
  issued_on   DATE,
  total       NUMERIC
)`,
    prompt: 'Which query returns invoices issued in March 2026?',
    hint: 'BETWEEN is inclusive on both ends. Pay attention to the first and last day of the month.',
    options: [
      `SELECT * FROM invoices WHERE issued_on BETWEEN '2026-03-01' AND '2026-03-31';`,
      `SELECT * FROM invoices WHERE issued_on > '2026-03-01' AND issued_on < '2026-03-31';`,
      `SELECT * FROM invoices WHERE issued_on IN ('2026-03-01', '2026-03-31');`,
      `SELECT * FROM invoices WHERE issued_on = 'March 2026';`,
    ],
    correctIndex: 0,
    explanation:
      "BETWEEN includes both endpoints, so March 1 and 31 are both covered. Option B skips the endpoints; C matches only those two days; D is not a real date.",
  },

  {
    id: 'easy-in-clause',
    difficulty: 'easy',
    topic: 'IN clause',
    scenario:
      'A delivery firm wants orders going to one of three cities: Cairo, Dubai, or Doha, so it can plan the next van load.',
    schema: `orders (
  id    INTEGER,
  city  TEXT,
  total NUMERIC
)`,
    prompt: 'Which query is the cleanest way to filter by those three cities?',
    hint: 'There is one list keyword that does the work of many ORs against the same column.',
    options: [
      `SELECT * FROM orders WHERE city='Cairo' AND city='Dubai' AND city='Doha';`,
      `SELECT * FROM orders WHERE city = 'Cairo,Dubai,Doha';`,
      `SELECT * FROM orders WHERE city IN ('Cairo', 'Dubai', 'Doha');`,
      `SELECT * FROM orders WHERE city LIKE 'Cairo|Dubai|Doha';`,
    ],
    correctIndex: 2,
    explanation:
      "IN is shorthand for many ORs over the same column. Option A uses AND so it would never match any row. B and D treat the whole list as one string.",
  },

  {
    id: 'easy-inner-join',
    difficulty: 'easy',
    topic: 'INNER JOIN',
    scenario:
      'A reporter wants a list of orders with the buyer’s name and the total amount. Orders with no matching customer can be skipped.',
    schema: `customers (id INTEGER, name TEXT)
orders    (id INTEGER, customer_id INTEGER, total NUMERIC)`,
    prompt: 'Which query returns order id, customer name, and total?',
    hint: 'INNER JOIN keeps rows that match on both sides. It needs a condition to tell SQL how to match.',
    options: [
      `SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id;`,
      `SELECT o.id, c.name, o.total FROM orders o, customers c;`,
      `SELECT o.id, c.name, o.total FROM orders o LEFT JOIN customers c;`,
      `SELECT o.id, c.name, o.total FROM orders o JOIN customers c;`,
    ],
    correctIndex: 0,
    explanation:
      "INNER JOIN needs an ON clause to match rows. B is a cross join (every pair). C and D miss the ON and most engines will reject them.",
  },

  {
    id: 'easy-update-where',
    difficulty: 'easy',
    topic: 'UPDATE with WHERE',
    scenario:
      'A clerk wants to mark order number 42 as paid in the orders table. The rest of the table must not change.',
    schema: `orders (
  id     INTEGER,
  status TEXT
)`,
    prompt: 'Which UPDATE statement does only that?',
    hint: 'Without one specific clause, an UPDATE silently changes every row in the table.',
    options: [
      `UPDATE orders SET status = 'paid';`,
      `UPDATE orders SET status = 'paid' WHERE id = 42;`,
      `UPDATE orders WHERE id = 42 SET status = 'paid';`,
      `UPDATE orders SET status = 'paid' AND id = 42;`,
    ],
    correctIndex: 1,
    explanation:
      "WHERE goes after SET in an UPDATE. Without WHERE (option A) every row in the table changes. C has the wrong clause order; D ANDs the value, breaking it.",
  },

  {
    id: 'easy-insert',
    difficulty: 'easy',
    topic: 'INSERT',
    scenario:
      'The catalog team is adding a new product called "Notebook" with a price of 12.50.',
    schema: `products (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC NOT NULL
)`,
    prompt: 'Which INSERT statement adds it correctly?',
    hint: 'The order of values must match the order of columns you name. Naming the columns is the safe habit.',
    options: [
      `INSERT INTO products (name, price) VALUES ('Notebook', 12.50);`,
      `INSERT INTO products VALUES ('Notebook', 12.50);`,
      `INSERT INTO products SET name = 'Notebook', price = 12.50;`,
      `INSERT INTO products (price, name) VALUES ('Notebook', 12.50);`,
    ],
    correctIndex: 0,
    explanation:
      "Naming columns is the portable, safe form. B relies on column order and breaks when the table changes. C is MySQL-only. D would store 'Notebook' as the price.",
  },

  {
    id: 'easy-count-null',
    difficulty: 'easy',
    topic: 'COUNT and NULL',
    scenario:
      'A team wants to know how many employees have a phone number on file. Employees with no phone should not be counted.',
    schema: `employees (
  id    INTEGER,
  name  TEXT,
  phone TEXT
)`,
    prompt: 'Which query returns the right number?',
    hint: 'COUNT(*) counts every row. COUNT(column) treats NULL specially.',
    options: [
      `SELECT COUNT(*) FROM employees;`,
      `SELECT COUNT(phone) FROM employees;`,
      `SELECT COUNT(DISTINCT id) FROM employees WHERE phone = NULL;`,
      `SELECT SUM(phone) FROM employees;`,
    ],
    correctIndex: 1,
    explanation:
      "COUNT(column) skips NULL values, so it counts only employees who have a phone. COUNT(*) counts everyone, and = NULL never matches anything.",
  },

  {
    id: 'easy-having',
    difficulty: 'easy',
    topic: 'HAVING vs WHERE',
    scenario:
      'A category manager wants the categories that contain more than 10 products so she can rebalance shelf space.',
    schema: `products (
  id       INTEGER,
  name     TEXT,
  category TEXT
)`,
    prompt: 'Which query returns those categories?',
    hint: 'WHERE filters rows before grouping. HAVING filters groups, so aggregates belong there.',
    options: [
      `SELECT category FROM products WHERE COUNT(*) > 10 GROUP BY category;`,
      `SELECT category FROM products GROUP BY category HAVING COUNT(*) > 10;`,
      `SELECT category, COUNT(*) FROM products HAVING COUNT(*) > 10;`,
      `SELECT category FROM products WHERE category > 10 GROUP BY category;`,
    ],
    correctIndex: 1,
    explanation:
      "Aggregates like COUNT belong in HAVING because WHERE runs before groups are formed. Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.",
  },

  {
    id: 'easy-order-multi',
    difficulty: 'easy',
    topic: 'ORDER BY with multiple columns',
    scenario:
      'A teacher wants students grouped by class, and within each class sorted by score from highest to lowest.',
    schema: `students (
  id       INTEGER,
  name     TEXT,
  class_id INTEGER,
  score    NUMERIC
)`,
    prompt: 'Which ORDER BY clause does that?',
    hint: 'ORDER BY accepts a comma-separated list. ASC or DESC applies to only the column it sits next to.',
    options: [
      `ORDER BY class_id, score DESC`,
      `ORDER BY class_id DESC, score`,
      `ORDER BY class_id AND score DESC`,
      `ORDER BY class_id ASC AND score DESC`,
    ],
    correctIndex: 0,
    explanation:
      "ORDER BY sorts by class_id first (ASC by default), then by score DESC within ties. AND is for boolean logic, not for joining sort columns.",
  },

  {
    id: 'easy-aliasing',
    difficulty: 'easy',
    topic: 'Column aliases',
    scenario:
      'A finance report needs the total of every order labeled clearly in the result as total_revenue.',
    schema: `orders (
  id    INTEGER,
  total NUMERIC
)`,
    prompt: 'Which query returns the sum with that column name?',
    hint: 'There is one short keyword for renaming a column in the result.',
    options: [
      `SELECT SUM(total) = total_revenue FROM orders;`,
      `SELECT SUM(total) AS total_revenue FROM orders;`,
      `SELECT SUM(total) -> total_revenue FROM orders;`,
      `SELECT total_revenue: SUM(total) FROM orders;`,
    ],
    correctIndex: 1,
    explanation:
      "AS gives a column an alias in the output. = compares values, -> is a path operator in some engines, and : is not aliasing syntax in standard SQL.",
  },

  {
    id: 'easy-and-or-precedence',
    difficulty: 'easy',
    topic: 'AND / OR precedence',
    scenario:
      'A marketer wants active customers who live in London or Paris. A typo in operator precedence almost shipped to production.',
    schema: `customers (
  id     INTEGER,
  name   TEXT,
  city   TEXT,
  active BOOLEAN
)`,
    prompt: 'Which WHERE clause filters them correctly?',
    hint: 'AND binds tighter than OR. Without parentheses, the engine groups AND first.',
    options: [
      `WHERE active = TRUE AND city = 'London' OR city = 'Paris'`,
      `WHERE active = TRUE AND (city = 'London' OR city = 'Paris')`,
      `WHERE active = TRUE OR city = 'London' OR city = 'Paris'`,
      `WHERE active = TRUE AND city IN 'London', 'Paris'`,
    ],
    correctIndex: 1,
    explanation:
      "AND binds tighter than OR, so option A matches every Paris customer even if inactive. Parentheses make the intent explicit. D has invalid IN syntax.",
  },

  // ============================================================
  // LeetCode-mirrored questions follow. Each one points at a free
  // LeetCode problem so the reader can solve it freehand and earn
  // points there too. Scenarios and schemas are rewritten in our
  // own words; only the underlying SQL idea is borrowed.
  // ============================================================

  {
    id: 'easy-combine-two-tables',
    difficulty: 'easy',
    topic: 'LEFT JOIN keeps everyone',
    scenario:
      'A directory report joins a Person table with an Address table. Some people have not given their address yet, but they should still appear in the result with NULL for city and state.',
    schema: `Person  (personId INTEGER, firstName TEXT, lastName TEXT)
Address (addressId INTEGER, personId INTEGER, city TEXT, state TEXT)`,
    prompt: 'Which query returns firstName, lastName, city, state for every person?',
    hint: 'Some people have no Address row but still need to appear. Pick the join type that keeps every row on the left.',
    options: [
      `SELECT firstName, lastName, city, state FROM Person JOIN Address USING(personId);`,
      `SELECT firstName, lastName, city, state FROM Person LEFT JOIN Address USING(personId);`,
      `SELECT firstName, lastName, city, state FROM Person, Address;`,
      `SELECT firstName, lastName, NULL AS city, NULL AS state FROM Person;`,
    ],
    correctIndex: 1,
    explanation:
      "LEFT JOIN keeps every person, even those without an address row. INNER JOIN drops them. The comma form is a cross join; D ignores Address entirely.",
    leetcodeNumber: 175,
    leetcodeSlug: 'combine-two-tables',
  },

  {
    id: 'easy-employees-earning-more-than-managers',
    difficulty: 'easy',
    topic: 'Self-join with comparison',
    scenario:
      'List every employee whose salary is higher than their direct manager. Manager and employee share the same Employee table.',
    schema: `Employee (id INTEGER, name TEXT, salary NUMERIC, managerId INTEGER)`,
    prompt: 'Which query returns those employees?',
    hint: 'Two aliases on the same table let you compare an employee row to their manager row.',
    options: [
      `SELECT e.name FROM Employee e JOIN Employee m ON e.managerId=m.id WHERE e.salary>m.salary;`,
      `SELECT name FROM Employee WHERE salary>managerId;`,
      `SELECT e.name FROM Employee e WHERE e.salary > (SELECT salary FROM Employee);`,
      `SELECT name FROM Employee GROUP BY managerId HAVING salary>MAX(salary);`,
    ],
    correctIndex: 0,
    explanation:
      "Self-join with two aliases connects each employee to their manager. B compares salary to an id. C's subquery returns many rows. D mixes group and row contexts.",
    leetcodeNumber: 181,
    leetcodeSlug: 'employees-earning-more-than-their-managers',
  },

  {
    id: 'easy-duplicate-emails',
    difficulty: 'easy',
    topic: 'GROUP BY plus HAVING',
    scenario:
      'A signup form created duplicate accounts during an outage. Find every email that appears more than once in the Person table so the team can dedupe.',
    schema: `Person (id INTEGER, email TEXT)`,
    prompt: 'Which query returns the repeated emails?',
    hint: 'Group by the column you suspect, then filter groups that contain more than one row.',
    options: [
      `SELECT email FROM Person WHERE COUNT(*)>1;`,
      `SELECT email FROM Person GROUP BY email HAVING COUNT(*)>1;`,
      `SELECT email FROM Person GROUP BY id HAVING COUNT(*)>1;`,
      `SELECT DISTINCT email FROM Person;`,
    ],
    correctIndex: 1,
    explanation:
      "HAVING filters groups, so HAVING COUNT(*) > 1 keeps emails that repeat. WHERE cannot use aggregates. Grouping by id makes every group size 1.",
    leetcodeNumber: 182,
    leetcodeSlug: 'duplicate-emails',
  },

  {
    id: 'easy-rising-temperature',
    difficulty: 'easy',
    topic: 'Self-join on a date offset',
    scenario:
      'A weather log records one temperature per day. Return the id of every day whose temperature was higher than the day before. Dates can have gaps.',
    schema: `Weather (id INTEGER, recordDate DATE, temperature INTEGER)`,
    prompt: 'Which query returns those ids?',
    hint: 'Pair each row with the row whose recordDate is exactly one day earlier.',
    options: [
      `SELECT w.id FROM Weather w JOIN Weather y ON w.recordDate = y.recordDate + INTERVAL '1 day' WHERE w.temperature > y.temperature;`,
      `SELECT id FROM Weather WHERE temperature > temperature;`,
      `SELECT id FROM Weather ORDER BY recordDate;`,
      `SELECT id FROM Weather GROUP BY recordDate HAVING MAX(temperature) > MIN(temperature);`,
    ],
    correctIndex: 0,
    explanation:
      "Self-join with a +1 day offset pairs each row with the previous day. The gap-tolerant version uses date arithmetic, not id arithmetic.",
    leetcodeNumber: 197,
    leetcodeSlug: 'rising-temperature',
  },

  {
    id: 'easy-big-countries',
    difficulty: 'easy',
    topic: 'WHERE with OR and >=',
    scenario:
      'A reference page wants every country that is at least 3 million km^2 OR has at least 25 million people.',
    schema: `World (
  name TEXT,
  continent TEXT,
  area BIGINT,
  population BIGINT,
  gdp BIGINT
)`,
    prompt: 'Which query returns name, population, area for those countries?',
    hint: 'The problem says "at least", so include the threshold value. Two conditions joined with OR.',
    options: [
      `SELECT name, population, area FROM World WHERE area>=3000000 OR population>=25000000;`,
      `SELECT name, population, area FROM World WHERE area>=3000000 AND population>=25000000;`,
      `SELECT name, population, area FROM World WHERE area>3000000 OR population>25000000;`,
      `SELECT name FROM World WHERE area + population > 3025000000;`,
    ],
    correctIndex: 0,
    explanation:
      "Either condition qualifies, so OR. >= includes countries hitting the threshold exactly. > would skip them; D adds two unrelated quantities.",
    leetcodeNumber: 595,
    leetcodeSlug: 'big-countries',
  },

  {
    id: 'easy-not-boring-movies',
    difficulty: 'easy',
    topic: 'Filter and sort',
    scenario:
      'A cinema wants every movie with an odd id and a description that is not "boring", sorted by rating from highest to lowest.',
    schema: `Cinema (id INTEGER, movie TEXT, description TEXT, rating NUMERIC)`,
    prompt: 'Which query returns the matching rows in the right order?',
    hint: 'id % 2 = 1 picks odd ids. ORDER BY DESC sorts highest first.',
    options: [
      `SELECT * FROM Cinema WHERE id%2=1 AND description!='boring' ORDER BY rating DESC;`,
      `SELECT * FROM Cinema WHERE id%2=0 AND description!='boring' ORDER BY rating;`,
      `SELECT * FROM Cinema WHERE id%2=1 OR description!='boring';`,
      `SELECT * FROM Cinema WHERE id IS ODD AND description<>'boring';`,
    ],
    correctIndex: 0,
    explanation:
      "Two conditions joined with AND: odd id AND not boring. DESC puts the top rating first. SQL has no IS ODD keyword.",
    leetcodeNumber: 620,
    leetcodeSlug: 'not-boring-movies',
  },

  {
    id: 'easy-find-customer-referee',
    difficulty: 'easy',
    topic: 'NULL inside a not-equal',
    scenario:
      'Each customer was either referred by another customer or signed up directly (referee_id is NULL). Find every customer NOT referred by customer #2. The NULL rows should be included.',
    schema: `Customer (id INTEGER, name TEXT, referee_id INTEGER)`,
    prompt: 'Which query returns those names?',
    hint: 'referee_id <> 2 is NULL (not TRUE) when the value is NULL. NULL acts like FALSE in a WHERE clause.',
    options: [
      `SELECT name FROM Customer WHERE referee_id<>2;`,
      `SELECT name FROM Customer WHERE referee_id<>2 OR referee_id IS NULL;`,
      `SELECT name FROM Customer WHERE NOT referee_id=2;`,
      `SELECT name FROM Customer WHERE referee_id!=2 AND referee_id IS NOT NULL;`,
    ],
    correctIndex: 1,
    explanation:
      "A NULL referee_id makes <> 2 evaluate to UNKNOWN, which acts like FALSE. Adding OR referee_id IS NULL brings those rows back into the result.",
    leetcodeNumber: 584,
    leetcodeSlug: 'find-customer-referee',
  },

  {
    id: 'easy-swap-salary',
    difficulty: 'easy',
    topic: 'CASE inside UPDATE',
    scenario:
      'A column sex holds the character m or f. Flip every m to f and every f to m, in one statement, with no temp value and no second pass.',
    schema: `Salary (id INTEGER, name TEXT, sex CHAR(1), salary NUMERIC)`,
    prompt: 'Which query is the cleanest portable way?',
    hint: 'A CASE inside SET decides per row in a single pass. Two sequential UPDATEs will flip the same row twice.',
    options: [
      `UPDATE Salary SET sex = CASE sex WHEN 'm' THEN 'f' WHEN 'f' THEN 'm' END;`,
      `UPDATE Salary SET sex='f' WHERE sex='m'; UPDATE Salary SET sex='m' WHERE sex='f';`,
      `UPDATE Salary SET sex = REVERSE(sex);`,
      `UPDATE Salary SET sex='m' WHERE sex='f' AND sex='m';`,
    ],
    correctIndex: 0,
    explanation:
      "The CASE expression flips each row in one shot. B's second UPDATE re-flips every row back. REVERSE on a single character is a no-op.",
    leetcodeNumber: 627,
    leetcodeSlug: 'swap-sex-of-employees',
  },

  {
    id: 'easy-article-views-i',
    difficulty: 'easy',
    topic: 'DISTINCT plus ORDER BY',
    scenario:
      'An article-views log has viewer_id, author_id, and view_date. Find every author who has viewed at least one of their own articles. Return the ids sorted ascending, no duplicates.',
    schema: `Views (article_id INTEGER, author_id INTEGER, viewer_id INTEGER, view_date DATE)`,
    prompt: 'Which query returns those ids?',
    hint: 'An author views themselves when author_id and viewer_id match.',
    options: [
      `SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id;`,
      `SELECT author_id FROM Views WHERE author_id = viewer_id;`,
      `SELECT DISTINCT viewer_id FROM Views WHERE author_id <> viewer_id;`,
      `SELECT author_id FROM Views GROUP BY author_id HAVING viewer_id = author_id;`,
    ],
    correctIndex: 0,
    explanation:
      "Filter where the two ids match, DISTINCT to dedupe, ORDER BY for the sort. B leaves duplicates; C inverts the condition; D mixes group and row scope.",
    leetcodeNumber: 1148,
    leetcodeSlug: 'article-views-i',
  },

  {
    id: 'easy-recyclable-low-fat',
    difficulty: 'easy',
    topic: 'AND across two flag columns',
    scenario:
      'A grocery catalogue marks every product with low_fats and recyclable, each Y or N. List the ids of products that are BOTH low fat AND recyclable.',
    schema: `Products (product_id INTEGER, low_fats CHAR(1), recyclable CHAR(1))`,
    prompt: 'Which query is correct?',
    hint: 'Both columns must be Y, so combine the conditions with AND.',
    options: [
      `SELECT product_id FROM Products WHERE low_fats='Y' AND recyclable='Y';`,
      `SELECT product_id FROM Products WHERE low_fats='Y' OR recyclable='Y';`,
      `SELECT product_id FROM Products WHERE low_fats=recyclable;`,
      `SELECT product_id FROM Products WHERE low_fats AND recyclable;`,
    ],
    correctIndex: 0,
    explanation:
      "AND because both conditions must hold. C also matches when both are N. D treats CHAR columns as booleans, which is not valid SQL.",
    leetcodeNumber: 1757,
    leetcodeSlug: 'recyclable-and-low-fat-products',
  },

  {
    id: 'easy-patients-condition',
    difficulty: 'easy',
    topic: 'LIKE with token boundaries',
    scenario:
      'Each patient has a conditions string with space-separated codes like "DIAB100 ABC203". Find patients whose conditions include any code that STARTS with "DIAB1" (start of any token, not anywhere inside).',
    schema: `Patients (patient_id INTEGER, patient_name TEXT, conditions TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'A code starts a token when it sits at position 1 of the string OR right after a space.',
    options: [
      `SELECT * FROM Patients WHERE conditions LIKE 'DIAB1%';`,
      `SELECT * FROM Patients WHERE conditions LIKE '%DIAB1%';`,
      `SELECT * FROM Patients WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%';`,
      `SELECT * FROM Patients WHERE conditions IN ('DIAB1');`,
    ],
    correctIndex: 2,
    explanation:
      "We need DIAB1 either at the very start or after a space. %DIAB1% matches inside other tokens too. A misses mid-string tokens.",
    leetcodeNumber: 1527,
    leetcodeSlug: 'patients-with-a-condition',
  },

  {
    id: 'easy-find-followers-count',
    difficulty: 'easy',
    topic: 'COUNT per group',
    scenario:
      'A Followers table has one row per (user_id, follower_id) pair. Return each user_id with their follower count, sorted by user_id.',
    schema: `Followers (user_id INTEGER, follower_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Group by user_id, count the rows in each group.',
    options: [
      `SELECT user_id, COUNT(follower_id) AS followers_count FROM Followers GROUP BY user_id ORDER BY user_id;`,
      `SELECT user_id, COUNT(*) FROM Followers ORDER BY user_id;`,
      `SELECT user_id, COUNT(*) FROM Followers GROUP BY follower_id ORDER BY user_id;`,
      `SELECT DISTINCT user_id, follower_id FROM Followers;`,
    ],
    correctIndex: 0,
    explanation:
      "Group by user_id, count followers per group. B is missing GROUP BY; C groups by the wrong column; D returns pairs, not counts.",
    leetcodeNumber: 1729,
    leetcodeSlug: 'find-followers-count',
  },

  {
    id: 'easy-invalid-tweets',
    difficulty: 'easy',
    topic: 'String length',
    scenario:
      'A Tweets table has a content column. Find every tweet whose content is longer than 15 characters.',
    schema: `Tweets (tweet_id INTEGER, content TEXT)`,
    prompt: 'Which query returns the ids of those tweets?',
    hint: 'There is a standard SQL function for string length. Different engines also have aliases.',
    options: [
      `SELECT tweet_id FROM Tweets WHERE CHAR_LENGTH(content)>15;`,
      `SELECT tweet_id FROM Tweets WHERE content>15;`,
      `SELECT tweet_id FROM Tweets WHERE COUNT(content)>15;`,
      `SELECT tweet_id FROM Tweets WHERE SIZE(content)>15;`,
    ],
    correctIndex: 0,
    explanation:
      "CHAR_LENGTH is the standard SQL function for character count (LENGTH works in many engines too). COUNT is for rows; SIZE is not a standard SQL function.",
    leetcodeNumber: 1683,
    leetcodeSlug: 'invalid-tweets',
  },

  {
    id: 'easy-customer-largest-orders',
    difficulty: 'easy',
    topic: 'Group, sort, top one',
    scenario:
      'Return the customer_number that placed the largest number of orders in the Orders table. Assume there is one clear leader.',
    schema: `Orders (order_number INTEGER, customer_number INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Group by customer, sort by the per-group count descending, take the top.',
    options: [
      `SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;`,
      `SELECT customer_number FROM Orders ORDER BY COUNT(*) DESC LIMIT 1;`,
      `SELECT MAX(COUNT(*)) FROM Orders GROUP BY customer_number;`,
      `SELECT customer_number FROM Orders GROUP BY order_number ORDER BY COUNT(*) DESC LIMIT 1;`,
    ],
    correctIndex: 0,
    explanation:
      "Group by customer_number, ORDER BY COUNT(*) DESC, take 1. B has no GROUP BY; C returns the count value; D groups by the wrong key.",
    leetcodeNumber: 586,
    leetcodeSlug: 'customer-placing-the-largest-number-of-orders',
  },

  {
    id: 'easy-triangle-judgement',
    difficulty: 'easy',
    topic: 'CASE WHEN with multiple conditions',
    scenario:
      'Each row in Triangle has three side lengths x, y, z. Add a column that says Yes when the three sides can form a triangle, No otherwise.',
    schema: `Triangle (x INTEGER, y INTEGER, z INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Triangle inequality: every pair must sum strictly above the third side.',
    options: [
      `SELECT x, y, z, IF(x+y>z AND y+z>x AND x+z>y, 'Yes', 'No') AS triangle FROM Triangle;`,
      `SELECT x, y, z, CASE WHEN x+y>z AND y+z>x AND x+z>y THEN 'Yes' ELSE 'No' END AS triangle FROM Triangle;`,
      `SELECT x, y, z, 'Yes' AS triangle FROM Triangle WHERE x+y+z>0;`,
      `SELECT x, y, z, CASE WHEN x+y>z OR y+z>x OR x+z>y THEN 'Yes' ELSE 'No' END FROM Triangle;`,
    ],
    correctIndex: 1,
    explanation:
      "All three inequalities must hold (AND, not OR). IF is MySQL only; CASE WHEN is the portable choice.",
    leetcodeNumber: 610,
    leetcodeSlug: 'triangle-judgement',
  },

  {
    id: 'easy-employee-bonus',
    difficulty: 'easy',
    topic: 'LEFT JOIN with NULL or low value',
    scenario:
      'Two tables: Employee and Bonus. List every employee whose bonus is less than 1000, including employees with no bonus row at all (treat missing as 0).',
    schema: `Employee (empId INTEGER, name TEXT, supervisor INTEGER, salary NUMERIC)
Bonus    (empId INTEGER, bonus NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'LEFT JOIN keeps employees with no Bonus row; you also need to let those NULLs pass the < 1000 test.',
    options: [
      `SELECT e.name, b.bonus FROM Employee e JOIN Bonus b ON e.empId=b.empId WHERE b.bonus<1000;`,
      `SELECT e.name, b.bonus FROM Employee e LEFT JOIN Bonus b ON e.empId=b.empId WHERE b.bonus<1000 OR b.bonus IS NULL;`,
      `SELECT name, bonus FROM Employee, Bonus WHERE bonus<1000;`,
      `SELECT name, bonus FROM Employee WHERE bonus<1000;`,
    ],
    correctIndex: 1,
    explanation:
      "LEFT JOIN preserves employees with no bonus row. Add OR IS NULL because NULL < 1000 is UNKNOWN, not TRUE.",
    leetcodeNumber: 577,
    leetcodeSlug: 'employee-bonus',
  },

  {
    id: 'easy-classes-more-than-5',
    difficulty: 'easy',
    topic: 'COUNT DISTINCT with HAVING',
    scenario:
      'A Courses table has (student, class). Return every class that has at least 5 distinct students enrolled. Some students appear in the same class twice; do not double-count them.',
    schema: `Courses (student TEXT, class TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'COUNT(*) would double-count duplicate (student, class) pairs. Use DISTINCT inside COUNT.',
    options: [
      `SELECT class FROM Courses GROUP BY class HAVING COUNT(DISTINCT student)>=5;`,
      `SELECT class FROM Courses GROUP BY class HAVING COUNT(*)>=5;`,
      `SELECT class FROM Courses WHERE COUNT(DISTINCT student)>=5 GROUP BY class;`,
      `SELECT DISTINCT class FROM Courses WHERE student>=5;`,
    ],
    correctIndex: 0,
    explanation:
      "COUNT(DISTINCT student) makes duplicate enrolment rows safe. WHERE cannot use aggregates; D treats a name like a number.",
    leetcodeNumber: 596,
    leetcodeSlug: 'classes-with-at-least-5-students',
  },

  {
    id: 'easy-user-activity-30-days',
    difficulty: 'easy',
    topic: 'BETWEEN, GROUP BY date, distinct count',
    scenario:
      'For each day in the 30-day window ending 2026-04-15 inclusive, return the day and the number of distinct users that were active.',
    schema: `Activity (user_id INTEGER, session_id INTEGER, activity_date DATE, activity_type TEXT)`,
    prompt: 'Which query returns one row per day with the active user count?',
    hint: 'BETWEEN gives an inclusive window. COUNT DISTINCT prevents the same user being counted twice for multiple sessions in a day.',
    options: [
      `SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM Activity WHERE activity_date BETWEEN '2026-03-17' AND '2026-04-15' GROUP BY activity_date;`,
      `SELECT activity_date, COUNT(*) FROM Activity GROUP BY activity_date;`,
      `SELECT activity_date, COUNT(user_id) FROM Activity WHERE activity_date BETWEEN '2026-03-17' AND '2026-04-15';`,
      `SELECT activity_date, COUNT(DISTINCT session_id) FROM Activity GROUP BY user_id;`,
    ],
    correctIndex: 0,
    explanation:
      "Bound the window with BETWEEN, group by date, count distinct users. B is missing the filter; C is missing GROUP BY; D groups by the wrong key.",
    leetcodeNumber: 1141,
    leetcodeSlug: 'user-activity-for-the-past-30-days-i',
  },

  {
    id: 'easy-latest-login-2020',
    difficulty: 'easy',
    topic: 'MAX in a year window',
    scenario:
      'A Logins table records each user login. For each user_id, return the most recent login that happened in 2020. Users with no 2020 logins do not appear.',
    schema: `Logins (user_id INTEGER, time_stamp TIMESTAMP)`,
    prompt: 'Which query is correct?',
    hint: 'Filter the year first, group by user, take MAX of the timestamp.',
    options: [
      `SELECT user_id, MAX(time_stamp) AS last_stamp FROM Logins WHERE EXTRACT(YEAR FROM time_stamp)=2020 GROUP BY user_id;`,
      `SELECT user_id, MAX(time_stamp) FROM Logins WHERE time_stamp='2020';`,
      `SELECT user_id, time_stamp FROM Logins WHERE EXTRACT(YEAR FROM time_stamp)=2020;`,
      `SELECT user_id, time_stamp FROM Logins ORDER BY time_stamp DESC LIMIT 1;`,
    ],
    correctIndex: 0,
    explanation:
      "Filter to 2020, then MAX per user. B compares a timestamp to a 4-character string. C returns every 2020 row. D returns one row globally.",
    leetcodeNumber: 1890,
    leetcodeSlug: 'the-latest-login-in-2020',
  },

  {
    id: 'easy-replace-employee-id',
    difficulty: 'easy',
    topic: 'LEFT JOIN to attach optional id',
    scenario:
      'Each employee MAY have a row in EmployeeUNI mapping to a unique_id. Return name and unique_id for every employee; unique_id is NULL when the mapping is missing.',
    schema: `Employees   (id INTEGER, name TEXT)
EmployeeUNI (id INTEGER, unique_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'LEFT JOIN preserves employees without a mapping. INNER JOIN drops them.',
    options: [
      `SELECT eu.unique_id, e.name FROM Employees e LEFT JOIN EmployeeUNI eu ON e.id=eu.id;`,
      `SELECT eu.unique_id, e.name FROM Employees e JOIN EmployeeUNI eu ON e.id=eu.id;`,
      `SELECT unique_id, name FROM Employees, EmployeeUNI;`,
      `SELECT e.name FROM Employees e WHERE e.id IN (SELECT id FROM EmployeeUNI);`,
    ],
    correctIndex: 0,
    explanation:
      "LEFT JOIN keeps every employee. INNER drops the unmapped ones. C is a cross join. D returns only the mapped employees.",
    leetcodeNumber: 1378,
    leetcodeSlug: 'replace-employee-id-with-the-unique-identifier',
  },

  {
    id: 'easy-product-sales-i',
    difficulty: 'easy',
    topic: 'INNER JOIN basic',
    scenario:
      'Join Sales to Product to get the name, year, and price for each sale. Every Sales row has a real product (foreign key).',
    schema: `Sales   (sale_id INTEGER, product_id INTEGER, year INTEGER, quantity INTEGER, price NUMERIC)
Product (product_id INTEGER, product_name TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'Inner join on product_id is enough because every sale points to a product.',
    options: [
      `SELECT p.product_name, s.year, s.price FROM Sales s JOIN Product p ON s.product_id=p.product_id;`,
      `SELECT product_name, year, price FROM Sales JOIN Product USING(price);`,
      `SELECT s.product_id, s.year, s.price FROM Sales s, Product p WHERE s.product_id<>p.product_id;`,
      `SELECT p.product_name, s.year, s.price FROM Sales s RIGHT JOIN Product p ON s.product_id=p.product_id;`,
    ],
    correctIndex: 0,
    explanation:
      "Join on the foreign key product_id. B joins on the wrong column. C inverts the join condition. D adds rows for products with no sales.",
    leetcodeNumber: 1068,
    leetcodeSlug: 'product-sales-analysis-i',
  },

  {
    id: 'easy-first-login',
    difficulty: 'easy',
    topic: 'MIN per group',
    scenario:
      'For every player in the Activity table, find the first day they logged in.',
    schema: `Activity (player_id INTEGER, device_id INTEGER, event_date DATE, games_played INTEGER)`,
    prompt: 'Which query returns player_id and first_login?',
    hint: 'One row per player, smallest event_date.',
    options: [
      `SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;`,
      `SELECT player_id, event_date FROM Activity ORDER BY event_date LIMIT 1;`,
      `SELECT player_id, event_date FROM Activity GROUP BY player_id;`,
      `SELECT player_id, MAX(event_date) FROM Activity GROUP BY player_id;`,
    ],
    correctIndex: 0,
    explanation:
      "MIN(event_date) per player is the first login. B returns one global row. C picks an arbitrary date. D returns the LAST login.",
    leetcodeNumber: 511,
    leetcodeSlug: 'game-play-analysis-i',
  },

  {
    id: 'easy-fix-names',
    difficulty: 'easy',
    topic: 'String case normalization',
    scenario:
      'User names are stored in any case (jOHN, MARY, sara). Normalize them: first letter uppercase, rest lowercase. Return user_id and the fixed name, sorted by user_id.',
    schema: `Users (user_id INTEGER, name TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'UPPER the first character, LOWER the rest, glue them back.',
    options: [
      `SELECT user_id, CONCAT(UPPER(LEFT(name,1)), LOWER(SUBSTRING(name,2))) AS name FROM Users ORDER BY user_id;`,
      `SELECT user_id, INITCAP(name) FROM Users;`,
      `SELECT user_id, UPPER(name) FROM Users;`,
      `SELECT user_id, LOWER(name) FROM Users;`,
    ],
    correctIndex: 0,
    explanation:
      "CONCAT of UPPER(first char) and LOWER(rest) is portable. INITCAP exists in Postgres but is not standard SQL. C and D do not match the spec on their own.",
    leetcodeNumber: 1667,
    leetcodeSlug: 'fix-names-in-a-table',
  },

  {
    id: 'easy-customer-no-transactions',
    difficulty: 'easy',
    topic: 'LEFT JOIN anti-join with a date filter',
    scenario:
      'Some customers visited the shop but did not buy anything. Return each such customer_id with the number of times they visited without a transaction.',
    schema: `Visits       (visit_id INTEGER, customer_id INTEGER)
Transactions (transaction_id INTEGER, visit_id INTEGER, amount NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'A visit with no Transactions row is a visit with no purchase. LEFT JOIN plus IS NULL captures that.',
    options: [
      `SELECT v.customer_id, COUNT(*) AS count_no_trans FROM Visits v LEFT JOIN Transactions t ON v.visit_id=t.visit_id WHERE t.transaction_id IS NULL GROUP BY v.customer_id;`,
      `SELECT customer_id, COUNT(*) FROM Visits GROUP BY customer_id;`,
      `SELECT v.customer_id, COUNT(*) FROM Visits v JOIN Transactions t ON v.visit_id=t.visit_id GROUP BY v.customer_id;`,
      `SELECT customer_id FROM Visits WHERE visit_id NOT IN (SELECT visit_id FROM Transactions);`,
    ],
    correctIndex: 0,
    explanation:
      "LEFT JOIN keeps every visit. Visits with no transaction row have NULL on the right; IS NULL filters them. C counts visits that DID have a transaction.",
    leetcodeNumber: 1581,
    leetcodeSlug: 'customer-who-visited-but-did-not-make-any-transactions',
  },

  {
    id: 'easy-coalesce-fallback',
    difficulty: 'easy',
    topic: 'COALESCE for fallback',
    scenario:
      'Return each user with a display name. Prefer the nickname; if missing, fall back to the full name; if both missing, use the literal string "Anonymous".',
    schema: `users (id INTEGER, nickname TEXT, full_name TEXT)`,
    prompt: 'Which query is correct in standard SQL?',
    hint: 'There is one function that returns the first non-NULL argument from any number of inputs.',
    options: [
      `SELECT id, COALESCE(nickname, full_name, 'Anonymous') AS display FROM users;`,
      `SELECT id, NVL(nickname, full_name) FROM users;`,
      `SELECT id, ISNULL(nickname, full_name) FROM users;`,
      `SELECT id, nickname OR full_name OR 'Anonymous' FROM users;`,
    ],
    correctIndex: 0,
    explanation:
      "COALESCE is standard SQL and accepts any number of arguments. NVL is Oracle, ISNULL is SQL Server (2 args only). OR is boolean logic, not a fallback chain.",
  },

  {
    id: 'easy-positive-revenue-year',
    difficulty: 'easy',
    topic: 'Per-customer SUM with HAVING',
    scenario:
      'A finance team wants every customer whose total revenue in 2026 is strictly positive (so a refund-only customer is excluded).',
    schema: `Orders (id INTEGER, customer_id INTEGER, ordered_at TIMESTAMP, revenue NUMERIC)`,
    prompt: 'Which query returns those customer ids?',
    hint: 'Per-customer totals: group, sum, HAVING.',
    options: [
      `SELECT customer_id FROM Orders WHERE revenue>0 GROUP BY customer_id;`,
      `SELECT customer_id FROM Orders WHERE EXTRACT(YEAR FROM ordered_at)=2026 GROUP BY customer_id HAVING SUM(revenue)>0;`,
      `SELECT customer_id FROM Orders WHERE SUM(revenue)>0 AND EXTRACT(YEAR FROM ordered_at)=2026;`,
      `SELECT DISTINCT customer_id FROM Orders WHERE revenue>0;`,
    ],
    correctIndex: 1,
    explanation:
      "Filter the year in WHERE; aggregate per customer; HAVING filters totals. A and D ignore refunds; C tries to put SUM in WHERE, which fails.",
  },

  {
    id: 'easy-percentage-attended-contest',
    difficulty: 'easy',
    topic: 'Percentage of total via scalar subquery',
    scenario:
      'For each contest, return the percentage of users (out of all registered users in the Users table) who joined that contest. Round to 2 decimals. Sort by percentage descending, then contest_id ascending.',
    schema: `Users    (user_id INTEGER, user_name TEXT)
Register (contest_id INTEGER, user_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'Numerator: distinct users per contest. Denominator: total users via a scalar subquery.',
    options: [
      `SELECT contest_id, ROUND(COUNT(DISTINCT user_id)*100.0/(SELECT COUNT(*) FROM Users),2) AS percentage FROM Register GROUP BY contest_id ORDER BY percentage DESC, contest_id;`,
      `SELECT contest_id, COUNT(*)/(SELECT COUNT(*) FROM Users) FROM Register;`,
      `SELECT contest_id, COUNT(user_id)/COUNT(*)*100 FROM Register GROUP BY contest_id;`,
      `SELECT contest_id, AVG(user_id) FROM Register GROUP BY contest_id;`,
    ],
    correctIndex: 0,
    explanation:
      "Numerator counts distinct users in the contest. Denominator is the total user count via a scalar subquery. ROUND to 2 dp; two-column ORDER BY.",
    leetcodeNumber: 1633,
    leetcodeSlug: 'percentage-of-users-attended-a-contest',
  },

  {
    id: 'easy-employees-missing-info',
    difficulty: 'easy',
    topic: 'UNION of anti-joins',
    scenario:
      'Two tables: Employees (id, name) and Salaries (id, salary). Return every employee_id that is missing on AT LEAST one side, sorted ascending.',
    schema: `Employees (employee_id INTEGER, name TEXT)
Salaries  (employee_id INTEGER, salary NUMERIC)`,
    prompt: 'Which query is correct?',
    hint: 'A row is missing on the other side when it does not appear in the other table. Two anti-join sets, then UNION.',
    options: [
      `SELECT employee_id FROM Employees WHERE employee_id NOT IN (SELECT employee_id FROM Salaries) UNION SELECT employee_id FROM Salaries WHERE employee_id NOT IN (SELECT employee_id FROM Employees) ORDER BY employee_id;`,
      `SELECT employee_id FROM Employees, Salaries WHERE Employees.employee_id<>Salaries.employee_id;`,
      `SELECT employee_id FROM Employees JOIN Salaries USING(employee_id);`,
      `SELECT employee_id FROM Employees LEFT JOIN Salaries USING(employee_id) WHERE salary IS NOT NULL;`,
    ],
    correctIndex: 0,
    explanation:
      "Two anti-joins (employees missing salary, salaries missing employee) combined with UNION. C is the intersection, the opposite of what we want.",
    leetcodeNumber: 1965,
    leetcodeSlug: 'employees-with-missing-information',
  },

  {
    id: 'easy-primary-department',
    difficulty: 'easy',
    topic: 'UNION across two cases',
    scenario:
      'Each employee may belong to multiple departments. The primary one is flagged Y. Return employee_id and their primary department_id. If an employee has exactly one row, that row is their primary (no flag needed).',
    schema: `Employee (employee_id INTEGER, department_id INTEGER, primary_flag CHAR(1))`,
    prompt: 'Which query is correct?',
    hint: 'Two cases: flagged Y rows OR employees with a single row total.',
    options: [
      `SELECT employee_id, department_id FROM Employee WHERE primary_flag='Y' UNION SELECT employee_id, department_id FROM Employee GROUP BY employee_id HAVING COUNT(*)=1;`,
      `SELECT employee_id, department_id FROM Employee WHERE primary_flag='Y';`,
      `SELECT employee_id, MAX(department_id) FROM Employee GROUP BY employee_id;`,
      `SELECT employee_id, department_id FROM Employee ORDER BY primary_flag DESC;`,
    ],
    correctIndex: 0,
    explanation:
      "UNION the two cases: explicit Y flag, and employees with a single row total. B alone misses the single-row case where no flag is set.",
    leetcodeNumber: 1789,
    leetcodeSlug: 'primary-department-for-each-employee',
  },

  {
    id: 'easy-unique-subjects-per-teacher',
    difficulty: 'easy',
    topic: 'COUNT DISTINCT per group',
    scenario:
      'A Teacher table has (teacher_id, subject_id, dept_id). Return each teacher_id with the number of distinct subjects they teach.',
    schema: `Teacher (teacher_id INTEGER, subject_id INTEGER, dept_id INTEGER)`,
    prompt: 'Which query is correct?',
    hint: 'A subject taught in two departments is one subject, not two.',
    options: [
      `SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt FROM Teacher GROUP BY teacher_id;`,
      `SELECT teacher_id, COUNT(*) FROM Teacher GROUP BY teacher_id;`,
      `SELECT teacher_id, COUNT(subject_id) FROM Teacher;`,
      `SELECT teacher_id, COUNT(DISTINCT dept_id) FROM Teacher GROUP BY teacher_id;`,
    ],
    correctIndex: 0,
    explanation:
      "COUNT(DISTINCT subject_id) avoids double-counting when a subject is taught in multiple departments. C is missing GROUP BY; D counts departments.",
    leetcodeNumber: 2356,
    leetcodeSlug: 'number-of-unique-subjects-taught-by-each-teacher',
  },

  {
    id: 'easy-confirmation-rate',
    difficulty: 'easy',
    topic: 'AVG of a boolean expression',
    scenario:
      'For each user in the Signups table, return the confirmation rate: number of confirmed messages divided by total messages. Users with no rows in Confirmations get 0.',
    schema: `Signups       (user_id INTEGER, time_stamp TIMESTAMP)
Confirmations (user_id INTEGER, time_stamp TIMESTAMP, action TEXT)`,
    prompt: 'Which query is correct?',
    hint: 'AVG of a boolean expression returns the fraction of TRUE rows. LEFT JOIN preserves users with no confirmations.',
    options: [
      `SELECT s.user_id, ROUND(COALESCE(AVG(CASE WHEN c.action='confirmed' THEN 1 ELSE 0 END),0),2) AS confirmation_rate FROM Signups s LEFT JOIN Confirmations c USING(user_id) GROUP BY s.user_id;`,
      `SELECT user_id, AVG(action='confirmed') FROM Confirmations GROUP BY user_id;`,
      `SELECT user_id, COUNT(action='confirmed')/COUNT(*) FROM Confirmations GROUP BY user_id;`,
      `SELECT user_id, SUM(CASE WHEN action='confirmed' THEN 1 END) FROM Signups;`,
    ],
    correctIndex: 0,
    explanation:
      "LEFT JOIN keeps users with no confirmations; the AVG over a 1/0 expression gives the rate; COALESCE turns the no-rows NULL into 0.",
    leetcodeNumber: 1934,
    leetcodeSlug: 'confirmation-rate',
  },
];
