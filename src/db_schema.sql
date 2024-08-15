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
    icon VARCHAR(255),
    promote_tips VARCHAR(255),
    under_budget_tips VARCHAR(255)
);

-- EXPENSE CATEGORY TABLE
CREATE TABLE IF NOT EXISTS expenseCategory (
    expense_category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255),
    reduce_expense_tips VARCHAR(255),
    over_budget_tips VARCHAR(255)
);

-- INCOME BUDGET TABLE
CREATE TABLE IF NOT EXISTS incomeBudget (
    income_budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    income_category_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (income_category_id) REFERENCES incomeCategory(income_category_id) ON DELETE CASCADE,
    UNIQUE (user_id, income_category_id, month)
);

-- EXPENSE BUDGET TABLE
CREATE TABLE IF NOT EXISTS expenseBudget (
    expense_budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expense_category_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_category_id) REFERENCES expenseCategory(expense_category_id) ON DELETE CASCADE,
    UNIQUE (user_id, expense_category_id, month) 
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
INSERT INTO users (firstName, lastName, email, password) VALUES ('user', 'example', 'user@example.com', 'abc');

-- INSERT INCOME CATEGORIES
INSERT INTO incomeCategory (name, description, icon, promote_tips, under_budget_tips) VALUES 
('Salary', 'regular income from employment', 'fa-briefcase', 
 'Consider asking for a raise or taking on extra shifts.', 
 'Review your current job market to explore other opportunities.'),

('Freelance', 'earnings from running a business / providing freelance services', 'fa-laptop-code', 
 'Expand your client base through networking or marketing.', 
 'Offer discounts or packages to attract more clients.'),

('Investment', 'dividends, interest and capital gains from stocks, bonds and mutual funds', 'fa-chart-line', 
 'Diversify your portfolio to increase income streams.', 
 'Consider rebalancing your investments to align with your goals.'),

('Rental Income', 'earnings from leasing out properties', 'fa-home', 
 'Explore short-term rental platforms to maximize income.', 
 'Review rental agreements and adjust rates if necessary.'),

('Pension', 'retirement income from employer-sponsored pension plans', 'fa-piggy-bank', 
 'Consider additional retirement savings or part-time work.', 
 'Review your retirement plan contributions and options.'),

('Side Job', 'income from part-time work, seasonal jobs, etc.', 'fa-handshake', 
 'Look for high-demand side gigs or seasonal opportunities.', 
 'Re-evaluate the time spent on side jobs for better income.'),

('Other', 'other miscellaneous income', 'fa-ellipsis-h', 
 'Identify and explore additional income sources.', 
 'Consider tracking irregular income sources more carefully.');

-- INSERT EXPENSE CATEGORIES
INSERT INTO expenseCategory (name, description, icon, reduce_expense_tips, over_budget_tips) VALUES 
('Housing', 'rent, mortgage payments, property taxes and home maintenance', 'fa-home', 
 'Consider refinancing or moving to a more affordable location.', 
 'Review utility usage and maintenance costs for potential savings.'),

('Utilities', 'electricity, water, gas, internet and phone services', 'fa-bolt', 
 'Reduce energy usage and consider switching providers.', 
 'Examine utility bills for unnecessary charges.'),

('Groceries', 'food and household supplies', 'fa-shopping-cart', 
 'Plan meals and buy in bulk to save money.', 
 'Avoid impulse purchases and use a shopping list.'),

('Food', 'meals and dining expenses', 'fa-utensils', 
 'Cook at home more often and reduce dining out.', 
 'Look for discounts or meal plans that fit your budget.'),

('Transportation', 'car payments, fuel, maintenance, public transit fares and insurance', 'fa-car', 
 'Use public transit or carpool to reduce costs.', 
 'Maintain your vehicle regularly to avoid costly repairs.'),

('Healthcare', 'insurance premiums, medical bills, prescriptions and dental care', 'fa-medkit', 
 'Compare healthcare plans and services for better rates.', 
 'Take preventive measures to avoid costly medical expenses.'),

('Insurance', 'health, auto, home and life insurance premiums', 'fa-shield-alt', 
 'Shop around for better insurance rates.', 
 'Review and adjust your coverage to avoid over-insurance.'),

('Debt Payments', 'credit card bills, personal loans and student loan payments', 'fa-credit-card', 
 'Consider debt consolidation to reduce interest rates.', 
 'Prioritize paying off high-interest debt first.'),

('Savings', 'contributions to savings accounts and retirement funds', 'fa-piggy-bank', 
 'Automate savings contributions to stay on track.', 
 'Review your savings goals and adjust if necessary.'),

('Investments', 'contributions to investment accounts', 'fa-chart-line', 
 'Set up automatic contributions to investment accounts.', 
 'Rebalance your portfolio to stay aligned with your goals.'),

('Entertainment', 'dining out, movies, concerts, subscriptions', 'fa-film', 
 'Look for free or low-cost entertainment options.', 
 'Limit subscriptions and unnecessary entertainment expenses.'),

('Personal Care', 'clothing, personal hygiene products, grooming, and beauty services', 'fa-user', 
 'Consider DIY options for grooming and beauty.', 
 'Shop for clothing and personal care items during sales.'),

('Other', 'other miscellaneous expenses', 'fa-ellipsis-h', 
 'Identify and eliminate unnecessary miscellaneous expenses.', 
 'Review and categorize your miscellaneous expenses regularly.');

-- INSERT INCOME BUDGETS
INSERT INTO incomeBudget (user_id, income_category_id, amount, month) VALUES (1, 1, 2500, '2024-05');
INSERT INTO incomeBudget (user_id, income_category_id, amount, month) VALUES (1, 4, 1000, '2024-05');

-- INSERT EXPENSE BUDGETS
INSERT INTO expenseBudget (user_id, expense_category_id, amount, month) VALUES (1, 1, 1500, '2024-05');
INSERT INTO expenseBudget (user_id, expense_category_id, amount, month) VALUES (1, 3, 1000, '2024-05');
INSERT INTO expenseBudget (user_id, expense_category_id, amount, month) VALUES (1, 4, 500, '2024-05');

-- INSERT INCOME
-- > MAY
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 4, 'Client XYZ', 1000, '2024-05-02 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 1, 'Company ABC', 3000, '2024-05-04 00:00:00');
-- > JUNE
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 4, 'Tenant A', 900, '2024-06-05 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 1, 'Company ABC', 2500, '2024-06-04 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 2, 'Freelance Project', 1200, '2024-06-12 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 3, 'Dividend Payment', 400, '2024-06-18 00:00:00');
-- > JULY
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 1, 'Company ABC', 2500, '2024-07-02 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 4, 'Tenant A', 900, '2024-07-05 00:00:00');
INSERT INTO income (user_id, income_category_id, source, amount, date) VALUES (1, 3, 'Dividend Payment', 350, '2024-07-18 00:00:00');

-- INSERT EXPENSES
-- > MAY
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 4, 'Cafe 123', 50, '2024-05-01 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 3, 'Supermarket', 800, '2024-05-03 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 1, 'Rent', 1500, '2024-05-06 00:00:00');
-- > JUNE
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 4, 'BBQ Palace', 35, '2024-06-07 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 4, 'YumYum Bar', 25, '2024-06-29 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 1, 'Rent', 1500, '2024-06-01 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 3, 'Supermarket', 950, '2024-06-05 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 2, 'Electricity Bill', 120, '2024-06-07 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 5, 'Doctor Visit', 200, '2024-06-15 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 12, 'Netflix Subscription', 15, '2024-06-20 00:00:00');
-- > JULY
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 1, 'Rent', 1500, '2024-07-01 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 3, 'Supermarket', 850, '2024-07-03 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 5, 'Dental Checkup', 180, '2024-07-05 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 7, 'Life Insurance Premium', 300, '2024-07-08 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 2, 'Fuel for Car', 100, '2024-07-10 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 11, 'Concert Tickets', 120, '2024-07-12 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 8, 'Credit Card Payment', 200, '2024-07-15 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 4, 'Fine Dining', 75, '2024-07-18 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 2, 'Internet Bill', 60, '2024-07-22 00:00:00');
INSERT INTO expenses (user_id, expense_category_id, source, amount, date) VALUES (1, 13, 'Haircut', 35, '2024-07-25 00:00:00');

COMMIT;