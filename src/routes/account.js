/**
 * account.js
 * These are routes for account management
 */

const express = require("express");
const router = express.Router();

/**
 * @desc Renders the log in / register page
 */
router.get('/login', (req, res) => {
    res.render('login.ejs');
});

/**
 * @desc Handles the register form submission
 */
router.post('/register', (req, res, next) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Check if email already exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.get(checkEmailQuery, [email], (err, user) => {
        if (err) {
            next(err); // Pass the error to the error handler
        } else if (user) {
            // Email already exists
            res.render('login', { message: 'This email has already been registered. Please log in instead.', messageClass: 'negative' });
        } else {
            // Check if passwords match
            if (password !== confirmPassword) {
                res.render('login', { message: 'The passwords do not match. Please try again.', messageClass: 'negative' });
            } else {
                // Store user data into database
                const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';
                db.run(insertUserQuery, [firstName, lastName, email, password], function(err) {
                    if (err) {
                        next(err); // Pass the error to the error handler
                    } else {
                        res.render('login', { message: 'Your account has been created successfully! Please log in with your credentials.', messageClass: 'positive' });
                    }
                });
            }
        }
    });
});

/**
 * @desc Handles the log in form submission
 */
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    // Check if email exists
    const checkEmailQuery = 'SELECT * FROM Users WHERE email = ?';
    db.get(checkEmailQuery, [email], (err, user) => {
        if (err) {
            next(err); // Pass the error to the error handler
        } else if (!user) {
            // Email not registered
            res.render('login', { message: 'This email has not been registered. Please register a new account.', messageClass: 'negative' });
        } else {
            // Check if passwords match
            if (user.password !== password) {
                res.render('login', { message: 'Incorrect password. Please try again.', messageClass: 'negative' });
            } else {
                // Redirect to the user dashboard upon successful login
                res.redirect('/user/dashboard');
            }
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;