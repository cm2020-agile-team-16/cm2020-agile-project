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
    // retrieve user data from register form
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // create query to check if an account with that email exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.get(checkEmailQuery, [email], (err, user) => {
        if (err) {
            next(err); // pass the error to the error handler
        // if an account with that email already exists
        } else if (user) {
            res.render('login', { message: 'This email has already been registered. Please log in instead.', messageClass: 'negative' });
        } else {
            // if passwords do not match
            if (password !== confirmPassword) {
                res.render('login', { message: 'The passwords do not match. Please try again.', messageClass: 'negative' });
            // else store user data into database
            } else {
                const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)';
                db.run(insertUserQuery, [firstName, lastName, email, password], function(err) {
                    if (err) {
                        next(err); // pass the error to the error handler
                    // if there are no errors, load the log in form
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
    // retrieve user data from log in form
    const { email, password } = req.body;

    // create query to check if an account with that email exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.get(checkEmailQuery, [email], (err, user) => {
        if (err) {
            next(err); // pass the error to the error handler
        // if no accounts with that email exist
        } else if (!user) {
            res.render('login', { message: 'This email has not been registered. Please register a new account.', messageClass: 'negative' });
        } else {
            // if passwords do not match
            if (user.password !== password) {
                res.render('login', { message: 'Incorrect password. Please try again.', messageClass: 'negative' });
            // create a user session and load the user's dashboard
            } else {
                req.session.userId = user.user_id;
                console.log('User ID set in session:', req.session.userId); // Debug log
                res.redirect('/user/dashboard');
            }
        }
    });
});

// export the router object so index.js can access it
module.exports = router;