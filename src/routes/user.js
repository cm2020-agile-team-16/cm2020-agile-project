// user.js
const express = require('express');
const router = express.Router();

/**
 * @desc Renders the dashboard page
 */
router.get('/dashboard', (req, res) => {
    const userId = 1; // Assuming user is logged in and their ID is 1, replace with actual user session data

    const userQuery = "SELECT firstName FROM users WHERE user_id = ?";
    const balanceQuery = `
        SELECT 
            (SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id = ?) -
            (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = ?) AS balance
    `;
    const transactionsQuery = `
        SELECT * FROM (
            SELECT income_id AS id, user_id, category_id, source, amount, date, 'income' AS type
            FROM income
            WHERE user_id = ?
            UNION ALL
            SELECT expense_id AS id, user_id, category_id, source, amount, date, 'expense' AS type
            FROM expenses
            WHERE user_id = ?
        )
        ORDER BY date DESC
        LIMIT 5
    `;
    const totalIncomeQuery = "SELECT COALESCE(SUM(amount), 0) as totalIncome FROM income WHERE user_id = ?";
    const totalExpensesQuery = "SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses WHERE user_id = ?";

    db.serialize(() => {
        db.get(userQuery, [userId], (err, userRow) => {
            if (err) {
                console.error(err.message);
                return res.sendStatus(500);
            }
            const firstName = userRow.firstName;

            db.get(balanceQuery, [userId, userId], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.sendStatus(500);
                }
                const balance = row.balance || 0;

                db.get(totalIncomeQuery, [userId], (err, totalIncomeRow) => {
                    if (err) {
                        console.error(err.message);
                        return res.sendStatus(500);
                    }
                    const totalIncome = totalIncomeRow.totalIncome;

                    db.get(totalExpensesQuery, [userId], (err, totalExpensesRow) => {
                        if (err) {
                            console.error(err.message);
                            return res.sendStatus(500);
                        }
                        const totalExpenses = totalExpensesRow.totalExpenses;

                        db.all(transactionsQuery, [userId, userId], (err, recentTransactions) => {
                            if (err) {
                                console.error(err.message);
                                return res.sendStatus(500);
                            }

                            // Fetch categories for recent transactions
                            const categoryIds = recentTransactions.map(t => t.category_id).filter(id => id != null);
                            const placeholders = categoryIds.map(() => '?').join(',');
                            const categoriesQuery = `
                                SELECT category_id, name
                                FROM categories
                                WHERE category_id IN (${placeholders})
                            `;

                            db.all(categoriesQuery, categoryIds, (err, categories) => {
                                if (err) {
                                    console.error(err.message);
                                    return res.sendStatus(500);
                                }

                                const categoryMap = categories.reduce((map, category) => {
                                    map[category.category_id] = category.name;
                                    return map;
                                }, {});

                                recentTransactions.forEach(transaction => {
                                    transaction.category = categoryMap[transaction.category_id] || 'Unknown';
                                });

                                res.render('dashboard', {
                                    firstName: firstName,
                                    balance: balance,
                                    totalIncome: totalIncome,
                                    totalExpenses: totalExpenses,
                                    recentTransactions: recentTransactions
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * @desc Renders the edit-income page
 */
router.get('/edit-income', (req, res) => {
    const incomeQuery = 'SELECT * FROM income'; // Adjust this query if you need to filter by user
    const categoryQuery = 'SELECT * FROM categories WHERE type = "income"';

    db.serialize(() => {
        db.all(incomeQuery, (err, incomes) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            db.all(categoryQuery, (err, categories) => {
                if (err) {
                    return res.status(500).send(err.message);
                }

                res.render('edit-income', { incomes, categories });
            });
        });
    });
});

/**
 * @desc Handles the form submission and updates the income entry or adds a new entry
 */
router.post('/edit-income', (req, res) => {
    const { id, category_id, source, amount } = req.body;
    console.log('Received data:', req.body); // Log the received data

    if (id.startsWith('new-')) {
        // Handle new income entry
        const insertQuery = 'INSERT INTO income (category_id, source, amount) VALUES (?, ?, ?)';
        db.run(insertQuery, [category_id, source, amount], (err) => {
            if (err) {
                console.error('Insert error:', err.message); // Log errors
                return res.status(500).send(err.message);
            }
            console.log('Insert successful');
            res.redirect('/user/edit-income'); // Redirect back to the edit-income page after successful insert
        });
    } else {
        // Handle existing income update
        const updateQuery = 'UPDATE income SET category_id = ?, source = ?, amount = ? WHERE income_id = ?';
        db.run(updateQuery, [category_id, source, amount, id], (err) => {
            if (err) {
                console.error('Update error:', err.message); // Log errors
                return res.status(500).send(err.message);
            }
            console.log('Update successful');
            res.redirect('/user/edit-income'); // Redirect back to the edit-income page after successful update
        });
    }
});

module.exports = router;