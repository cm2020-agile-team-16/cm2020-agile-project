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
        res.redirect('/account/login');
        return
    }

    // save user's ID
    const userId = req.session.userId;

    const db = await open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });

    // create query to retrieve user's first name
    const firstNameQuery = `SELECT firstName FROM users WHERE user_id = ?`;

    let firstName;

    try {
        firstName = (await db.get(firstNameQuery, [userId])).firstName;
    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
        return 
    }

    res.render('dashboard', { firstName });
});

/**
 * @desc Renders the income page
 */
router.get('/income', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login');
        res.redirect('/account/login');
        return;
    }

    res.render('income', {});
});

/**
 * @desc Renders the expenses page
 */
router.get('/expenses', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login');
        res.redirect('/account/login');
        return;
    }

    res.render('expenses', {});
});

/**
 * @desc Renders the summary page
 */
router.get('/summary', async (req, res) => {
    // redirect user to login if no session is found
    if (!req.session.userId) {
        console.log('No user ID found in session, redirecting to login');
        res.redirect('/account/login');
        return;
    }

   res.render('summary', {});
});
