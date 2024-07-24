/**
 * account.js
 * These are routes for account management
 */

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const router = express.Router();

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
    const checkEmailQuery = `SELECT * FROM users WHERE email = ${email}`;
    let user;
    try {
        user = await db.get(checkEmailQuery);
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
    const insertUserQuery = `INSERT INTO users (firstName, lastName, email, password) VALUES (${firstName}, ${lastName}, ${email}, ${password})`;
    try {
        await db.run(insertUserQuery);
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

    console.log("in login before query");

    // create query to check if an account with that email exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = '${email}'`;
    let user;
    try {
        user = await db.get(checkEmailQuery);
    } catch (error) {
        console.log("in login in catch");
        next(error); // pass the error to the error handler
        return;
    }

    console.log("in login after catch");

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
