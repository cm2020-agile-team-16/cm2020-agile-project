-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;


-- Create tables:
-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INCOME TABLE
CREATE TABLE IF NOT EXISTS income (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'income' or 'expense'
    description VARCHAR(255)
);


-- Enter sample data
-- INSERT USER
INSERT INTO users (firstName, email, password) VALUES ('user1', 'user1@example.com', 'abc');
INSERT INTO users (firstName, email, password) VALUES ('user2', 'user2@example.com', '123');

-- INSERT CATEGORIES
INSERT INTO categories (name, type, description) VALUES ('Salary', 'income', 'regular income from employment');
INSERT INTO categories (name, type, description) VALUES ('Freelance', 'income', 'earnings from running a business / providing freelance services');
INSERT INTO categories (name, type, description) VALUES ('Investment', 'income', 'dividends, interest and capital gains from stocks, bonds and mutual funds');
INSERT INTO categories (name, type, description) VALUES ('Rental Income', 'income', 'earnings from leasing out properties');
INSERT INTO categories (name, type, description) VALUES ('Pension', 'income', 'retirement income from employer-sponsored pension plans');
INSERT INTO categories (name, type, description) VALUES ('Side Job', 'income', 'income from part-time work, seasonal jobs, etc.');
INSERT INTO categories (name, type, description) VALUES ('Other', 'income', 'other miscellaneous income');
INSERT INTO categories (name, type, description) VALUES ('Housing', 'expense', 'rent, mortgage payments, property taxes and home maintenance');
INSERT INTO categories (name, type, description) VALUES ('Utilities', 'expense', 'electricity, water, gas, internet and phone services');
INSERT INTO categories (name, type, description) VALUES ('Groceries', 'expense', 'food and household supplies');
INSERT INTO categories (name, type, description) VALUES ('Transportation', 'expense', 'car payments, fuel, maintenance, public transit fares and insurance');
INSERT INTO categories (name, type, description) VALUES ('Healthcare', 'expense', 'insurance premiums, medical bills, presciptions and dental care');
INSERT INTO categories (name, type, description) VALUES ('Insurance', 'expense', 'health, auto, home and life insurance premiums');
INSERT INTO categories (name, type, description) VALUES ('Debt Payments', 'expense', 'credit card bills, personal loans and student loan payments');
INSERT INTO categories (name, type, description) VALUES ('Savings', 'expense', 'contributions to savings accounts and retirement funds');
INSERT INTO categories (name, type, description) VALUES ('Investments', 'expense', 'contributions to investment accounts');
INSERT INTO categories (name, type, description) VALUES ('Entertainment', 'expense', 'dining out, movies, concerts, subscriptions');
INSERT INTO categories (name, type, description) VALUES ('Personal Care', 'expense', 'clothing, personal hygiene products, grooming, and beauty services');
INSERT INTO categories (name, type, description) VALUES ('Other', 'expense', 'other miscellaneous expenses');

-- INSERT INCOME
INSERT INTO income (user_id, category_id, source, amount) VALUES (1, 1, 'Salary from Company ABC', 2500);
INSERT INTO income (user_id, category_id, source, amount) VALUES (1, 2, 'Rent from Client XYZ', 1000);

-- INSERT EXPENSES
INSERT INTO expenses (user_id, category_id, source, amount) VALUES (1, 9, 'Groceries for May', 800);
INSERT INTO expenses (user_id, category_id, source, amount) VALUES (1, 16, 'Movie Night', 100);

COMMIT;