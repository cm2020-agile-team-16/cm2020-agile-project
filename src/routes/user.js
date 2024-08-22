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
        res.redirect('/account/login');
        return
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve user's first name
    const firstNameQuery = `SELECT firstName FROM users WHERE user_id = ?`;

    let firstName;

    try {
        firstName = (await db.get(firstNameQuery, [userId])).firstName;
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
        return 
    }

    res.render('dashboard', { firstName });
});

/**
 * @desc Renders the income page
 */
router.get('/income', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login');
        res.redirect('/account/login');
        return;
    }

    res.render('income', {});
});

/**
 * @desc Renders the expenses page
 */
router.get('/expenses', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login');
        res.redirect('/account/login');
        return;
    }

    res.render('expenses', {});
});

/**
 * @desc Renders the summary page
 */
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
