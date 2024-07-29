-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INCOME CATEGORY TABLE
CREATE TABLE IF NOT EXISTS incomeCategory (
    income_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255)
);

-- EXPENSE CATEGORY TABLE
CREATE TABLE IF NOT EXISTS expenseCategory (
    expense_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255)
);

-- INCOME BUDGET TABLE
CREATE TABLE IF NOT EXISTS incomeBudget (
    income_budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    income_category_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_id) REFERENCES incomeCategory(income_category_id) ON DELETE CASCADE
);

-- EXPENSE BUDGET TABLE
CREATE TABLE IF NOT EXISTS expenseBudget (
    expense_budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expense_category_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expenseCategory(expense_category_id) ON DELETE CASCADE
);

-- INCOME TRANSACTION TABLE
CREATE TABLE IF NOT EXISTS income (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    income_category_id INTEGER,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_id) REFERENCES incomeCategory(income_category_id) ON DELETE SET NULL
);

-- EXPENSE TRANSACTION TABLE
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expense_category_id INTEGER,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expenseCategory(expense_category_id) ON DELETE SET NULL
);

-- Enter sample data
-- INSERT USERS
INSERT INTO users (firstName, email, password) VALUES ('user1', 'user1@example.com', 'abc');
INSERT INTO users (firstName, email, password) VALUES ('user2', 'user2@example.com', '123');

-- INSERT INCOME CATEGORIES
INSERT INTO incomeCategory (name, description, icon) VALUES ('Salary', 'regular income from employment', 'fa-briefcase');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Freelance', 'earnings from running a business / providing freelance services', 'fa-laptop-code');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Investment', 'dividends, interest and capital gains from stocks, bonds and mutual funds', 'fa-chart-line');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Rental Income', 'earnings from leasing out properties', 'fa-home');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Pension', 'retirement income from employer-sponsored pension plans', 'fa-piggy-bank');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Side Job', 'income from part-time work, seasonal jobs, etc.', 'fa-handshake');
INSERT INTO incomeCategory (name, description, icon) VALUES ('Other', 'other miscellaneous income', 'fa-ellipsis-h');

-- INSERT EXPENSE CATEGORIES
INSERT INTO expenseCategory (name, description, icon) VALUES ('Housing', 'rent, mortgage payments, property taxes and home maintenance', 'fa-home');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Utilities', 'electricity, water, gas, internet and phone services', 'fa-bolt');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Groceries', 'food and household supplies', 'fa-shopping-cart');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Food', 'meals and dining expenses', 'fa-utensils');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Transportation', 'car payments, fuel, maintenance, public transit fares and insurance', 'fa-car');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Healthcare', 'insurance premiums, medical bills, prescriptions and dental care', 'fa-medkit');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Insurance', 'health, auto, home and life insurance premiums', 'fa-shield-alt');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Debt Payments', 'credit card bills, personal loans and student loan payments', 'fa-credit-card');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Savings', 'contributions to savings accounts and retirement funds', 'fa-piggy-bank');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Investments', 'contributions to investment accounts', 'fa-chart-line');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Entertainment', 'dining out, movies, concerts, subscriptions', 'fa-film');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Personal Care', 'clothing, personal hygiene products, grooming, and beauty services', 'fa-user');
INSERT INTO expenseCategory (name, description, icon) VALUES ('Other', 'other miscellaneous expenses', 'fa-ellipsis-h');

-- INSERT INCOME BUDGETS
INSERT INTO incomeBudget (user_id, income_category_id, amount) VALUES (1, 1, 2500);
INSERT INTO incomeBudget (user_id, income_category_id, amount) VALUES (1, 1, 1000);

-- INSERT EXPENSE BUDGETS
INSERT INTO expenseBudget (user_id, expense_category_id, amount) VALUES (1, 1, 1500);
INSERT INTO expenseBudget (user_id, expense_category_id, amount) VALUES (1, 3, 1000);
INSERT INTO expenseBudget (user_id, expense_category_id, amount) VALUES (1, 4, 500);

-- INSERT INCOME
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 4, 'Client XYZ', 1000, '2024-05-02 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 1, 'Company ABC', 3000, '2024-05-04 00:00:00');

-- INSERT EXPENSES
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 4, 'Cafe 123', 50, '2024-05-01 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 3, 'Supermarket', 800, '2024-05-03 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 1, 'Rent', 1500, '2024-05-06 00:00:00');

COMMIT;