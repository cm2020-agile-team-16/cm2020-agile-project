import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const router = express.Router();

/**
 * @desc API endpoint for fetching list of valid months/years based on user's income history.
 */
router.get('/income-months', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const incomesQuery = `
        SELECT date
        FROM income I
        JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
        WHERE I.user_id = ?
        ORDER BY date DESC
    `;

    const dateToMonthYear = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return { month, year };
    };

    try {
        const incomeDates = await db.all(incomesQuery, [userId]);
        const monthYears = incomeDates.map(incomeDate => {
            const date = new Date(incomeDate.date);
            return dateToMonthYear(date);
        });
        const uniqueMonthYears = monthYears.reduce((accumulator, monthYear) => {
            if (!accumulator.some(my => my.month === monthYear.month && my.year === monthYear.year)) {
                accumulator.push(monthYear);
            }
            return accumulator;
        }, []);
        res.json(uniqueMonthYears.length ? uniqueMonthYears : [dateToMonthYear(new Date())]);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching user's transactions for a given month.
 */
router.get('/transactions', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const incomesQuery = `
        SELECT * FROM (
            SELECT 'income' AS type, source, amount, date, IC.name AS category, IC.icon AS icon
            FROM income I
            JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
            WHERE I.user_id = ?
            AND substr(date, 1, 4) = ?
            AND substr(date, 6, 2) = ?
        )
        ORDER BY date DESC
    `;

    const expensesQuery = `
        SELECT * FROM (
            SELECT 'expense' AS type, source, amount, date, EC.name AS category, EC.icon AS icon
            FROM expenses E
            JOIN expenseCategory EC ON E.expense_category_id = EC.expense_category_id
            WHERE E.user_id = ?
            AND substr(date, 1, 4) = ?
            AND substr(date, 6, 2) = ?
        )
        ORDER BY date DESC
    `;

    const month = req.query.month;
    const year = req.query.year;

    try {
        const incomes = await db.all(incomesQuery, [userId, year, month]);
        const expenses = await db.all(expensesQuery, [userId, year, month]);
        res.json({ incomes, expenses });
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching all income categories.
 */
router.get('/income-categories', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const incomeCategoriesQuery = `SELECT name FROM incomeCategory`;

    try {
        const incomeCategories = (await db.all(incomeCategoriesQuery));
        res.json(incomeCategories);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

router.get('/budgeted-income', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const budgetedIncomeQuery = `
        SELECT
        COALESCE(SUM(amount), 0) AS budgetedIncome
        FROM incomeBudget
        WHERE user_id = ?
        AND substr(month, 1, 4) = ?
        AND substr(month, 6, 2) = ?
    `;

    const month = req.query.month;
    const year = req.query.year;

    try {
        const budgetedIncome = await db.get(budgetedIncomeQuery, [userId, year, month]);
        res.json(budgetedIncome);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});
