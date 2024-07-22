/**
 * user.js
 * These are routes for user management
 */

const express = require('express');
const router = express.Router();

/**
 * @desc Renders the user dashboard
 */
router.get('/dashboard', (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    // create query to retrieve user's first name
    const userQuery = "SELECT firstName FROM users WHERE user_id = ?";
    db.get(userQuery, [userId], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.sendStatus(500);
        }

        // save user's first name
        const firstName = user.firstName;

        // create query to retrieve user's balance (totalIncome - totalExpenses)
        const balanceQuery = "SELECT (SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id = ?) - (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ?) AS balance";

        // create query to retrieve user's total income
        const totalIncomeQuery = "SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM income WHERE user_id = ?";

        // create query to retrieve user's total expenses
        const totalExpensesQuery = "SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?";

        // create query to retrieve user's recent transactions
        const recentTransactionsQuery = `
        SELECT * FROM (
            SELECT 'income' AS type, source, amount, date, IC.name AS category
            FROM income I
            JOIN incomeCategory IC ON I.income_category_id = IC.income_category_id
            WHERE I.user_id = ?
            UNION
            SELECT 'expense' AS type, source, amount, date, EC.name AS category
            FROM expenses E
            JOIN expenseCategory EC ON E.expense_category_id = EC.expense_category_id
            WHERE E.user_id = ?
        )
        ORDER BY date DESC LIMIT 3`; 

        // run balance query
        db.get(balanceQuery, [userId, userId], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.sendStatus(500);
            }

            const balance = row.balance;

            // run total income query
            db.get(totalIncomeQuery, [userId], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.sendStatus(500);
                }

                const totalIncome = row.totalIncome;

                // run total expenses query
                db.get(totalExpensesQuery, [userId], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        return res.sendStatus(500);
                    }

                    const totalExpenses = row.totalExpenses;

                    // run recent transactions query
                    db.all(recentTransactionsQuery, [userId, userId], (err, recentTransactions) => {
                        if (err) {
                            console.error(err.message);
                            return res.sendStatus(500);
                        }

                        // if there are no errors, load the user's dashboard
                        res.render('dashboard', {
                            firstName,
                            balance,
                            totalIncome,
                            totalExpenses,
                            recentTransactions
                        });
                    });
                });
            });
        });
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

// export the router object so index.js can access it
module.exports = router;