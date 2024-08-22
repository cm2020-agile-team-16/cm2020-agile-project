import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const router = express.Router();

/**
 * @desc API endpoint for fetching list of valid months/years based on user's income history.
 */
router.get('/income-month-years', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const incomeDatesQuery = `
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
        const incomeDates = await db.all(incomeDatesQuery, [userId]);
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
 * @desc API endpoint for fetching list of valid months/years based on user's expenses history.
 */
router.get('/expenses-month-years', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const expensesDatesQuery = `
        SELECT date
        FROM expenses E
        JOIN expenseCategory EC ON E.expense_category_id = EC.expense_category_id
        WHERE E.user_id = ?
        ORDER BY date DESC
    `;

    const dateToMonthYear = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return { month, year };
    };

    try {
        const expensesDates = await db.all(expensesDatesQuery, [userId]);
        const monthYears = expensesDates.map(expenseDate => {
            const date = new Date(expenseDate.date);
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

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const incomeCategoriesQuery = `SELECT income_category_id AS id, name FROM incomeCategory`;

    try {
        const incomeCategories = (await db.all(incomeCategoriesQuery));
        res.json(incomeCategories);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching all expense categories.
 */
router.get('/expense-categories', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const expenseCategoriesQuery = `SELECT expense_category_id AS id, name FROM expenseCategory`;

    try {
        const expenseCategories = (await db.all(expenseCategoriesQuery));
        res.json(expenseCategories);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching a user's budgeted income.
 */
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
            ic.name AS category,
            ib.amount
        FROM incomeBudget ib
        JOIN incomeCategory ic 
        ON ib.income_category_id = ic.income_category_id
        WHERE ib.user_id = ?
        AND substr(ib.month, 1, 4) = ?
        AND substr(ib.month, 6, 2) = ?
    `;

    const month = req.query.month;
    const year = req.query.year;

    try {
        const budgetedIncome = await db.all(budgetedIncomeQuery, [userId, year, month]);
        res.json(budgetedIncome);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching a user's budgeted expenses.
 */
router.get('/expense-limits', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const budgetedExpensesQuery = `
        SELECT
            ec.name AS category,
            eb.amount
        FROM expenseBudget eb
        JOIN expenseCategory ec
        ON eb.expense_category_id = ec.expense_category_id
        WHERE user_id = ?
        AND substr(month, 1, 4) = ?
        AND substr(month, 6, 2) = ?
    `;

    const month = req.query.month;
    const year = req.query.year;

    try {
        const budgetedExpenses = await db.all(budgetedExpensesQuery, [userId, year, month]);
        res.json(budgetedExpenses);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for adding an income for a user.
 */
router.post('/add-income', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const addIncomeQuery = `
        INSERT INTO income
        (user_id,   income_category_id, source, amount, date)
        VALUES
        (?,         ?,                  ?,      ?,      ?)
    `;

    const { category, source, amount } = req.body;

    const d = new Date();
    const paddedMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const paddedDay = (d.getDate()).toString().padStart(2, '0');
    const date = `${d.getFullYear()}-${paddedMonth}-${paddedDay} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    try {
        await db.run(addIncomeQuery, [userId, category, source, amount, date]);
        res.redirect(req.headers.referer);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for adding an expense for a user.
 */
router.post('/add-expense', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const addExpenseQuery = `
        INSERT INTO expenses
        (user_id,   expense_category_id, source, amount, date)
        VALUES
        (?,         ?,                  ?,      ?,      ?)
    `;

    const { category, source, amount } = req.body;

    const d = new Date();
    const paddedMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const paddedDay = (d.getDate()).toString().padStart(2, '0');
    const date = `${d.getFullYear()}-${paddedMonth}-${paddedDay} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    try {
        await db.run(addExpenseQuery, [userId, category, source, amount, date]);
        res.redirect(req.headers.referer);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for setting an income budget for a user.
 */
router.post('/set-income-budget', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const setIncomeBudgetQuery = `
        INSERT OR REPLACE INTO incomeBudget
        (user_id,   income_category_id, amount, month)
        VALUES
        (?,         ?,                  ?,      ?)
    `;

    const { category, amount } = req.body;

    const d = new Date();
    const paddedMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const date = `${d.getFullYear()}-${paddedMonth}`;

    try {
        await db.run(setIncomeBudgetQuery, [userId, category, amount, date]);
        res.redirect(req.headers.referer);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for setting an expense limit for a user.
 */
router.post('/set-expense-limit', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    const setExpenseBudgetQuery = `
        INSERT OR REPLACE INTO expenseBudget
        (user_id,   expense_category_id, amount, month)
        VALUES
        (?,         ?,                  ?,      ?)
    `;

    const { category, amount } = req.body;

    const d = new Date();
    const paddedMonth = (d.getMonth() + 1).toString().padStart(2, '0');
    const date = `${d.getFullYear()}-${paddedMonth}`;

    try {
        await db.run(setExpenseBudgetQuery, [userId, category, amount, date]);
        res.redirect(req.headers.referer);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

