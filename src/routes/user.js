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
    
    // create query to retrieve user's balance (totalIncome - totalExpenses)
    const balanceQuery = `SELECT (SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id = ?) - (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ?) AS balance`;
    
    // create query to retrieve user's total income
    const totalIncomeQuery = `SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ?`;

    // create query to retrieve user's total expenses
    const totalExpensesQuery = `SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?`;

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
ORDER BY date DESC LIMIT 5`;

    let firstName;
    let balance;
    let totalIncome;
    let totalExpenses;
    let budgetedIncome;
    let budgetedExpenses;
    let recentTransactions;

    try {
        firstName = (await db.get(firstNameQuery, [userId])).firstName;
        balance = (await db.get(balanceQuery, [userId, userId])).balance;
        totalIncome = (await db.get(totalIncomeQuery, [userId])).totalIncome;
        totalExpenses = (await db.get(totalExpensesQuery, [userId])).totalExpenses;
        budgetedIncome = (await db.get(budgetedIncomeQuery, [userId])).budgetedIncome;
        budgetedExpenses = (await db.get(budgetedExpensesQuery, [userId])).budgetedExpenses;
        recentTransactions = await db.all(recentTransactionsQuery, [userId, userId]);
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }

    // if there are no errors, load the user's dashboard
    res.render('dashboard', {
        firstName,
        balance,
        totalIncome,
        totalExpenses,
        budgetedIncome,
        budgetedExpenses,
        recentTransactions
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
