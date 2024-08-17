/**
 * user.js
 * These are routes for user management
 */

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const router = express.Router();

// middleware to set headers to prevent caching
router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

/**
 * @desc Renders the user dashboard
 */
router.get('/dashboard', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve user's first name
    const firstNameQuery = `SELECT firstName FROM users WHERE user_id = ?`;

    // create query to retrieve user's total income
    const totalIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ? AND substr(date, 1, 4) = ? AND substr(date, 6, 2) = ?`;

    // create query to retrieve user's total expenses
    const totalExpensesQuery = `SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ? AND substr(date, 1, 4) = ? AND substr(date, 6, 2) = ?`;

    // create query to retrieve user's budgeted income
    const budgetedIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS budgetedIncome FROM incomeBudget WHERE user_id = ?`;

    // create query to retrieve user's budgeted expenses
    const budgetedExpensesQuery = `SELECT COALESCE(SUM(amount), 0) AS budgetedExpenses FROM expenseBudget WHERE user_id = ?`;

    // create query to retrieve user's recent transactions
    const recentTransactionsQuery = `
        SELECT * FROM (
            SELECT 'income' AS type, source, amount, date, IC.name AS category, IC.icon AS icon
            FROM income I
            JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
            WHERE I.user_id = ?
            UNION
            SELECT 'expense' AS type, source, amount, date, EC.name AS category, EC.icon AS icon
            FROM expenses E
            JOIN expenseCategory EC ON E.expense_category_id = EC.expense_category_id
            WHERE E.user_id = ?
        )
        ORDER BY date DESC LIMIT 10
    `;

    let recentTransactions;
    let firstName;
    let balance;
    let totalIncome;
    let totalExpenses;
    let budgetedIncome;
    let budgetedExpenses;

    let most_recent_date = new Date();
    let year = most_recent_date.toLocaleString("en-US", { year: "numeric" });

    try {
        recentTransactions = await db.all(recentTransactionsQuery, [userId, userId]);
        // Determine which month we're in by looking at most recent transaction date
        if (recentTransactions) {
            most_recent_date = new Date(recentTransactions[0].date);
        }
        const paddedMonth = (most_recent_date.getMonth() + 1).toString().padStart(2, "0");
        year = most_recent_date.toLocaleString("en-US", { year: "numeric" })

        firstName = (await db.get(firstNameQuery, [userId])).firstName;
        totalIncome = (await db.get(totalIncomeQuery, [userId, year, paddedMonth])).totalIncome;
        totalExpenses = (await db.get(totalExpensesQuery, [userId, year, paddedMonth])).totalExpenses;
        balance = totalIncome - totalExpenses;
        budgetedIncome = (await db.get(budgetedIncomeQuery, [userId])).budgetedIncome;
        budgetedExpenses = (await db.get(budgetedExpensesQuery, [userId])).budgetedExpenses;
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }

    const month = most_recent_date.toLocaleString("en-US", { month: "long" });

    // if there are no errors, load the user's dashboard
    res.render('dashboard', {
        firstName,
        balance,
        month,
        year,
        totalIncome,
        totalExpenses,
        budgetedIncome,
        budgetedExpenses,
        recentTransactions
    });
});

/**
 * @desc Renders the income page
 */
router.get('/income', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve user's total income
    const totalIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ? AND substr(date, 1, 4) = ? AND substr(date, 6, 2) = ?`;

    // create query to retrieve user's budgeted income
    const budgetedIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS budgetedIncome FROM incomeBudget WHERE user_id = ?`;

    // create query to retrieve user's recent transactions
    const incomesQuery = `
        SELECT * FROM (
        SELECT 'income' AS type, source, amount, date, IC.name AS category, IC.icon AS icon
        FROM income I
        JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
        WHERE I.user_id = ?
        )
        ORDER BY date DESC
    `;

    const incomeCategoriesQuery = `SELECT name FROM incomeCategory`;

    let incomes;
    let totalIncome;
    let budgetedIncome;
    let incomeCategories;

    let most_recent_date = new Date();
    let year = most_recent_date.toLocaleString("en-US", { year: "numeric" });

    try {
        incomes = await db.all(incomesQuery, [userId]);
        // Determine which month we're in by looking at most recent transaction date
        if (incomes) {
            most_recent_date = new Date(incomes[0].date);
        }
        const paddedMonth = (most_recent_date.getMonth() + 1).toString().padStart(2, "0");
        year = most_recent_date.toLocaleString("en-US", { year: "numeric" })

        totalIncome = (await db.get(totalIncomeQuery, [userId, year, paddedMonth])).totalIncome;
        budgetedIncome = (await db.get(budgetedIncomeQuery, [userId])).budgetedIncome;
        incomeCategories = (await db.all(incomeCategoriesQuery))
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }

    const month = most_recent_date.toLocaleString("en-US", { month: "long" });

    // if there are no errors, load the user's dashboard
    res.render('income', {
        month,
        year,
        totalIncome,
        budgetedIncome,
        incomes,
        incomeCategories,
    });
});

router.get('/summary', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve the last 3 months of transactions
    const last3MonthsQuery = `
        SELECT month
        FROM (
            SELECT DISTINCT SUBSTR(date, 1, 7) AS month
            FROM (
                SELECT date
                FROM income
                WHERE user_id = ?
                UNION
                SELECT date
                FROM expenses
                WHERE user_id = ?
            ) AS combined_dates
            ORDER BY month DESC
            LIMIT 3
        ) AS last3
        ORDER BY month ASC;
    `;

    const last3BalancesAndSavingsRateQuery = `
        SELECT incomeData.month, 
            IFNULL(totalIncome, 0) - IFNULL(totalExpenses, 0) AS balance,
            CASE 
                WHEN IFNULL(totalIncome, 0) != 0 
                THEN ROUND(((CAST(IFNULL(totalIncome, 0) - IFNULL(totalExpenses, 0) AS FLOAT) / IFNULL(totalIncome, 0)) * 100), 2)
                ELSE 0 
            END AS savingsRate
        FROM (
            -- Subquery for total income by month
            SELECT SUBSTR(date, 1, 7) AS month, SUM(amount) AS totalIncome
            FROM income 
            WHERE user_id = ?
            AND SUBSTR(date, 1, 7) IN (?, ?, ?)
            GROUP BY month
        ) AS incomeData
        LEFT JOIN (
            -- Subquery for total expenses by month
            SELECT SUBSTR(date, 1, 7) AS month, SUM(amount) AS totalExpenses
            FROM expenses
            WHERE user_id = ?
            AND SUBSTR(date, 1, 7) IN (?, ?, ?)
            GROUP BY month
        ) AS expenseData
        ON incomeData.month = expenseData.month
        ORDER BY incomeData.month ASC;
    `;

    const topIncomeCategoriesQuery = `
        SELECT ic.name AS categoryName, SUM(i.amount) AS totalAmount, ic.under_budget_tips AS tips
        FROM income i
        JOIN incomeCategory ic ON i.income_category_id = ic.income_category_id
        WHERE i.user_id = ? 
        AND SUBSTR(i.date, 1, 7) = ?
        GROUP BY ic.name, ic.under_budget_tips
        ORDER BY totalAmount DESC
        LIMIT 3;
    `;

    const topExpenseCategoriesQuery = `
        SELECT ec.name AS categoryName, SUM(e.amount) AS totalAmount, ec.over_budget_tips AS tips
        FROM expenses e
        JOIN expenseCategory ec ON e.expense_category_id = ec.expense_category_id
        WHERE e.user_id = ? 
        AND SUBSTR(e.date, 1, 7) = ?
        GROUP BY ec.name, ec.over_budget_tips
        ORDER BY totalAmount DESC
        LIMIT 3;
    `;

    const incomeCategoriesUnderBudgetQuery = `
        SELECT ic.name AS categoryName, 
               ib.amount AS budgetedAmount,
               i.total_income AS actualAmount,
               ic.under_budget_tips AS tips
        FROM incomeCategory ic
        JOIN (
            SELECT income_category_id, 
                   SUM(amount) AS total_income
            FROM income 
            WHERE user_id = ? 
            AND SUBSTR(date, 1, 7) = ?
            GROUP BY income_category_id
        ) i ON ic.income_category_id = i.income_category_id
        JOIN incomeBudget ib ON ic.income_category_id = ib.income_category_id
        WHERE i.total_income < ib.amount
          AND ib.month = ?;
    `;

    const expenseCategoriesOverBudgetQuery = `
        SELECT ec.name AS categoryName, 
               ec.over_budget_tips AS tips,
               eb.amount AS budgetedAmount,
               e.total_expenses AS actualAmount
        FROM expenseCategory ec
        JOIN (
            SELECT expense_category_id, 
                   SUM(amount) AS total_expenses
            FROM expenses
            WHERE user_id = ? 
            AND SUBSTR(date, 1, 7) = ?
            GROUP BY expense_category_id
        ) e ON ec.expense_category_id = e.expense_category_id
        JOIN expenseBudget eb ON ec.expense_category_id = eb.expense_category_id
        WHERE e.total_expenses > eb.amount
          AND eb.month = ?;
    `;

    let last3Months = [];
    let last3Balances = [];
    let last3SavingsRates = [];
    let topIncomeCategories = [];
    let topExpenseCategories = [];
    let incomeCategoriesUnderBudget = [];
    let expenseCategoriesOverBudget = [];

    try {
        const months = await db.all(last3MonthsQuery, [userId, userId]);
        last3Months = months.map(row => row.month);
        const balancesAndSavingsRates = await db.all(last3BalancesAndSavingsRateQuery, [
            userId, ...last3Months,
            userId, ...last3Months 
        ]);

        last3Balances = balancesAndSavingsRates.map(row => ({ month: row.month, balance: row.balance }));

        last3SavingsRates = balancesAndSavingsRates.map(row => ({ month: row.month, savingsRate: row.savingsRate }));

        if (last3Months.length > 0) {
            const latestMonth = last3Months[last3Months.length - 1];
            topIncomeCategories = await db.all(topIncomeCategoriesQuery, [userId, latestMonth]);
            topExpenseCategories = await db.all(topExpenseCategoriesQuery, [userId, latestMonth]);
            incomeCategoriesUnderBudget = await db.all(incomeCategoriesUnderBudgetQuery, [userId, latestMonth, latestMonth]);
            expenseCategoriesOverBudget = await db.all(expenseCategoriesOverBudgetQuery, [userId, latestMonth, latestMonth]);
        }
    } catch (error) {
        console.error(error.message);
    }

    // if there are no errors, load the user's dashboard
    res.render('summary', {
        last3Balances,
        last3SavingsRates,
        topIncomeCategories,
        topExpenseCategories,
        incomeCategoriesUnderBudget,
        expenseCategoriesOverBudget
    });
});

// /**
//  * @desc Adds a new income record
//  */
// router.post('/income', (req, res) => {
//     const { userId, category, source, amount } = req.body;
//     const query = "INSERT INTO income (user_id, income_category_id, source, amount) VALUES (?, ?, ?, ?)";

//     db.run(query, [userId, category, source, amount], function (err) {
//         if (err) {
//             console.error(err.message);
//             return res.sendStatus(500);
//         }
//         res.redirect('/dashboard');
//     });
// });

// /**
//  * @desc Adds a new expense record
//  */
// router.post('/expenses', (req, res) => {
//     const { userId, category, source, amount } = req.body;
//     const query = "INSERT INTO expenses (user_id, expense_category_id, source, amount) VALUES (?, ?, ?, ?)";

//     db.run(query, [userId, category, source, amount], function (err) {
//         if (err) {
//             console.error(err.message);
//             return res.sendStatus(500);
//         }
//         res.redirect('/dashboard');
//     });
// });

// /**
//  * @desc Adds a new income budget record
//  */
// router.post('/income-budget', (req, res) => {
//     const { userId, category, amount } = req.body;
//     const query = "INSERT INTO incomeBudget (user_id, income_category_id, amount) VALUES (?, ?, ?)";

//     db.run(query, [userId, category, amount], function (err) {
//         if (err) {
//             console.error(err.message);
//             return res.sendStatus(500);
//         }
//         res.redirect('/dashboard');
//     });
// });

// /**
//  * @desc Adds a new expense budget record
//  */
// router.post('/expense-budget', (req, res) => {
//     const { userId, category, amount } = req.body;
//     const query = "INSERT INTO expenseBudget (user_id, expense_category_id, amount) VALUES (?, ?, ?)";

//     db.run(query, [userId, category, amount], function (err) {
//         if (err) {
//             console.error(err.message);
//             return res.sendStatus(500);
//         }
//         res.redirect('/dashboard');
//     });
// });


/**
 * @desc Renders the expenses page
 */
router.get('/expenses', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const totalIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ? AND substr(date, 1, 4) = ? AND substr(date, 6, 2) = ?`;

    const totalExpensesQuery = `SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ? AND substr(date, 1, 4) = ? AND substr(date, 6, 2) = ?`;

    const budgetedExpensesQuery = `SELECT COALESCE(SUM(amount), 0) AS budgetedExpenses FROM expenseBudget WHERE user_id = ?`;

    // create query to retrieve user's budgeted income
    const budgetedIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS budgetedIncome FROM incomeBudget WHERE user_id = ?`;

    const recentTransactionsQuery = `
    SELECT * FROM (
    SELECT 'income' AS type, source, amount, date, IC.name AS category, IC.icon AS icon
    FROM income I
    JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
    WHERE I.user_id = ?
    UNION
    SELECT 'expense' AS type, source, amount, date, EC.name AS category, EC.icon AS icon
    FROM expenses E
    JOIN expenseCategory EC ON E.expense_category_id = EC.expense_category_id
    WHERE E.user_id = ?
)
ORDER BY date DESC LIMIT 10`;

    let recentTransactions;
    let totalExpenses;
    let budgetedExpenses;
    let totalIncome;
    let budgetedIncome;

    let most_recent_date = new Date();
    let year = most_recent_date.toLocaleString("en-US", { year: "numeric" });

    try {
        recentTransactions = await db.all(recentTransactionsQuery, [userId, userId]);
        // Determine which month we're in by looking at most recent transaction date
        if (recentTransactions) {
            most_recent_date = new Date(recentTransactions[0].date);
        }
        const paddedMonth = (most_recent_date.getMonth() + 1).toString().padStart(2, "0");
        year = most_recent_date.toLocaleString("en-US", { year: "numeric" });
        totalIncome = (await db.get(totalIncomeQuery, [userId, year, paddedMonth])).totalIncome;
        totalExpenses = (await db.get(totalExpensesQuery, [userId, year, paddedMonth])).totalExpenses;
        budgetedIncome = (await db.get(budgetedIncomeQuery, [userId])).budgetedIncome;
        budgetedExpenses = (await db.get(budgetedExpensesQuery, [userId])).budgetedExpenses;
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }

    const isPartOfCurrentDate = (transaction) => {
        const transactionDate = new Date(transaction.date);
        const isCurrentMonth = transactionDate.getMonth() === most_recent_date.getMonth();
        const isCurrentYear = transactionDate.getFullYear() === most_recent_date.getFullYear();
        return isCurrentMonth && isCurrentYear;
    };
    
    const monthlyExpenses = recentTransactions.filter(transaction => transaction.type === "expense").filter(isPartOfCurrentDate);
    const month = most_recent_date.toLocaleString("en-US", { month: "long" });

    res.render('expenses', {
        budgetedExpenses,
        budgetedIncome,
        totalExpenses,
        totalIncome,
        year,
        month,
        monthlyExpenses
    });
});