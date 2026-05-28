import type { Question } from '../types';

/**
 * Easy SQL questions. Goal: bread-and-butter SELECT, WHERE, JOIN,
 * GROUP BY, NULL handling, and the small syntax traps every junior
 * trips on at least once. Each scenario is something a real team
 * could ask in a stand-up.
 *
 * Authoring rules (enforced by scripts/audit-questions.ts):
 *  - exactly 4 options, each <= 100 characters
 *  - explanation <= 200 characters (Telegram quiz poll limit)
 *  - correctIndex is 0..3
 *  - id starts with "easy-" and is unique
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
];
