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
    description VARCHAR(255)
);

-- EXPENSE CATEGORY TABLE
CREATE TABLE IF NOT EXISTS expenseCategory (
    expense_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
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
INSERT INTO incomeCategory (name, description) VALUES ('Salary', 'regular income from employment');
INSERT INTO incomeCategory (name, description) VALUES ('Freelance', 'earnings from running a business / providing freelance services');
INSERT INTO incomeCategory (name, description) VALUES ('Investment', 'dividends, interest and capital gains from stocks, bonds and mutual funds');
INSERT INTO incomeCategory (name, description) VALUES ('Rental Income', 'earnings from leasing out properties');
INSERT INTO incomeCategory (name, description) VALUES ('Pension', 'retirement income from employer-sponsored pension plans');
INSERT INTO incomeCategory (name, description) VALUES ('Side Job', 'income from part-time work, seasonal jobs, etc.');
INSERT INTO incomeCategory (name, description) VALUES ('Other', 'other miscellaneous income');

-- INSERT EXPENSE CATEGORIES
INSERT INTO expenseCategory (name, description) VALUES ('Housing', 'rent, mortgage payments, property taxes and home maintenance');
INSERT INTO expenseCategory (name, description) VALUES ('Utilities', 'electricity, water, gas, internet and phone services');
INSERT INTO expenseCategory (name, description) VALUES ('Groceries', 'food and household supplies');
INSERT INTO expenseCategory (name, description) VALUES ('Transportation', 'car payments, fuel, maintenance, public transit fares and insurance');
INSERT INTO expenseCategory (name, description) VALUES ('Healthcare', 'insurance premiums, medical bills, presciptions and dental care');
INSERT INTO expenseCategory (name, description) VALUES ('Insurance', 'health, auto, home and life insurance premiums');
INSERT INTO expenseCategory (name, description) VALUES ('Debt Payments', 'credit card bills, personal loans and student loan payments');
INSERT INTO expenseCategory (name, description) VALUES ('Savings', 'contributions to savings accounts and retirement funds');
INSERT INTO expenseCategory (name, description) VALUES ('Investments', 'contributions to investment accounts');
INSERT INTO expenseCategory (name, description) VALUES ('Entertainment', 'dining out, movies, concerts, subscriptions');
INSERT INTO expenseCategory (name, description) VALUES ('Personal Care', 'clothing, personal hygiene products, grooming, and beauty services');
INSERT INTO expenseCategory (name, description) VALUES ('Other', 'other miscellaneous expenses');

-- INSERT INCOME
INSERT INTO income (user_id, income_category_id, source, amount) VALUES (1, 1, 'Salary from Company ABC', 2500);
INSERT INTO income (user_id, income_category_id, source, amount) VALUES (1, 4, 'Rent from Client XYZ', 1000);

-- INSERT EXPENSES
INSERT INTO expenses (user_id, expense_category_id, source, amount) VALUES (1, 3, 'Groceries for May', 800);
INSERT INTO expenses (user_id, expense_category_id, source, amount) VALUES (1, 10, 'Movie Night', 100);

COMMIT;