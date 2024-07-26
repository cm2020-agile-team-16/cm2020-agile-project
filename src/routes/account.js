/**
 * account.js
 * These are routes for account management
 */

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const router = express.Router();


/////////////////////////////////////////////////////////////////
/////////////////////////// LOGIN.EJS ///////////////////////////
/////////////////////////////////////////////////////////////////
/**
 * @desc Renders the log in / register page
 */
router.get('/login', (req, res) => {
    res.render('login.ejs');
});


/**
 * @desc Handles the register form submission
 */
router.post('/register', async (req, res, next) => {
    // retrieve user data from register form
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to check if an account with that email exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
    let user;
    try {
        user = await db.get(checkEmailQuery, [email]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    const userAlreadyExists = !!user;

    if (userAlreadyExists) {
        res.render('login', { message: 'This email has already been registered. Please log in instead.', messageClass: 'negative' });
        return;
    }

    // user does not exist
    // check if passwords match
    if (password !== confirmPassword) {
        res.render('login', { message: 'The passwords do not match. Please try again.', messageClass: 'negative' });
        return;
    }

    // passwords match
    // store user data into database
    const insertUserQuery = `INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`;
    try {
        await db.run(insertUserQuery, [firstName, lastName, email, password]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    // if there are no errors, load the log in form
    res.render('login', { message: 'Your account has been created successfully! Please log in with your credentials.', messageClass: 'positive' });
});


/**
 * @desc Handles the log in form submission
 */
router.post('/login', async (req, res, next) => {
    // retrieve user data from log in form
    const { email, password } = req.body;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });
    
    // create query to check if an account with that email exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
    let user;
    try {
        user = await db.get(checkEmailQuery, [email]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    const userExists = !!user;
    if (!userExists) {
        res.render('login', { message: 'This email has not been registered. Please register a new account.', messageClass: 'negative' });
        return;
    }

    // user exists
    // check that password is correct
    if (user.password !== password) {
        res.render('login', { message: 'Incorrect password. Please try again.', messageClass: 'negative' });
        return;
    }

    // the correct password was entered
    // create a user session and load the user's dashboard
    req.session.userId = user.user_id;
    console.log('User ID set in session:', req.session.userId); // Debug log
    res.redirect('/user/dashboard');
});


/**
 * @desc Handles user log out
 */
router.get('/logout', (req, res) => {
    // destroy the user session
    req.session.destroy((err) => {
        if (err) {
            console.error(err.message);
            return res.sendStatus(500);
        }

        // redirect the user back to login
        res.render('login', { message: 'You have been logged out successfully.', messageClass: 'positive' });
    });
});

/////////////////////////////////////////////////////////////////
////////////////////////// PROFILE.EJS //////////////////////////
/////////////////////////////////////////////////////////////////
/**
 * @desc Renders the user profile page
 */
router.get('/profile', async (req, res) => {
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

    // create query to retrieve user's profile information
    const profileQuery = `SELECT firstName, lastName, email FROM users WHERE user_id = ?`;

    // if there are no errors, load the user's profile
    try {
        const profile = await db.get(profileQuery, [userId]);
        const { firstName, lastName, email } = profile;
        res.render('profile', {
            firstName,
            lastName,
            email
        });
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }
});


/**
 * @desc Handles profile edit form submission
 */
router.post('/profile/edit', async (req, res, next) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    // retrieve user data from profile form
    const { firstName, lastName, email } = req.body;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to get the current email of the user
    const getEmailQuery = `SELECT email FROM users WHERE user_id = ?`;
    let currentEmail;
    
    // run the get email query
    try {
        const user = await db.get(getEmailQuery, [userId]);
        currentEmail = user.email;
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    // create query to update user's information using parameterized query
    const updateProfileQuery = `
        UPDATE users 
        SET firstName = ?, lastName = ?, email = ? 
        WHERE user_id = ?
    `;

    // run the update profile query
    try {
        await db.run(updateProfileQuery, [firstName, lastName, email, userId]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    // check if the email was changed
    if (currentEmail !== email) {
        // if the email has been changed, destroy the user session
        req.session.destroy((err) => {
            if (err) {
                console.error(err.message);
                return res.sendStatus(500);
            }

            // redirect the user back to login with a success message
            res.render('login', { message: 'Your email has been changed successfully! Please log in with your new credentials.', messageClass: 'positive' });
        });
    } else {
        // redirect the user to the update profile page
        res.redirect('/account/profile');
    }
});


router.post('/profile/resetPassword', async (req, res, next) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login'); // Debug log
        return res.redirect('/account/login');
    }

    // save user's ID
    const userId = req.session.userId;

    // retrieve user data from reset password form
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve user's profile information (for reload purposes)
    const profileQuery = `SELECT firstName, lastName, email FROM users WHERE user_id = ?`;

    let firstName, lastName, email;

    try {
        const profile = await db.get(profileQuery, [userId]);
        firstName = profile.firstName;
        lastName = profile.lastName;
        email = profile.email;
    } catch (error) {
        console.error(error.message);
        return res.sendStatus(500);
    }

    // verify that the new and confirm passwords are identical
    if (newPassword !== confirmPassword) {
        return res.render('profile', {
            firstName,
            lastName,
            email,
            message: 'New passwords do not match', 
            messageClass: 'negative'
        });
    }

    // create query to check if current password provided is correct using parameterized query
    const currentPasswordQuery = `SELECT password FROM users WHERE user_id = ?`;
    let user;

    try {
        user = await db.get(currentPasswordQuery, [userId]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    // validate the current password provided
    if (currentPassword !== user.password) {
        return res.render('profile', {
            firstName,
            lastName,
            email,
            message: 'Current password is incorrect', 
            messageClass: 'negative'
        });
    }
    
    // create query to reset user's password using parameterized query
    const resetPasswordQuery = `UPDATE users SET password = ? WHERE user_id = ?`;

    // run the update query
    try {
        await db.run(resetPasswordQuery, [newPassword, userId]);
    } catch (error) {
        next(error); // pass the error to the error handler
        return;
    }

    // if the password has been reset, destroy the user session
    req.session.destroy((err) => {
        if (err) {
            console.error(err.message);
            return res.sendStatus(500);
        }

        // redirect the user back to login
        res.render('login', { message: 'Your password has been changed successfully! Please log in with your new credentials.', messageClass: 'positive' });
    });
});