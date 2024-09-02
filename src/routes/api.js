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

/**
 * @desc API endpoint for fetching a user's top three income categories for a given month.
 */
router.get('/top-income-categories', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

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

    const month = req.query.month;
    const year = req.query.year;

    const date = `${year}-${month}`;

    try {
        const topIncomeCategories = await db.all(topIncomeCategoriesQuery, [userId, date]);
        res.json(topIncomeCategories);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching a user's top three expense categories for a given month.
 */
router.get('/top-expense-categories', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

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

    const month = req.query.month;
    const year = req.query.year;

    const date = `${year}-${month}`;

    try {
        const topExpenseCategories = await db.all(topExpenseCategoriesQuery, [userId, date]);
        res.json(topExpenseCategories);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});

/**
 * @desc API endpoint for fetching a user's income categories that are under budget for a given month.
 */
router.get('/income-categories-under-budget', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

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

    const month = req.query.month;
    const year = req.query.year;

    const date = `${year}-${month}`;

    try {
        const incomeCategoriesUnderBudget = await db.all(incomeCategoriesUnderBudgetQuery, [userId, date, date]);
        res.json(incomeCategoriesUnderBudget);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});


/**
 * @desc API endpoint for fetching a user's expense categories that are over budget for a given month.
 */
router.get('/expense-categories-over-budget', async (req, res) => {
    if (!req.session.userId) {
        res.sendStatus(401);
        return;
    }

    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

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

    const month = req.query.month;
    const year = req.query.year;

    const date = `${year}-${month}`;

    try {
        const expenseCategoriesOverBudget = await db.all(expenseCategoriesOverBudgetQuery, [userId, date, date]);
        res.json(expenseCategoriesOverBudget);
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});
