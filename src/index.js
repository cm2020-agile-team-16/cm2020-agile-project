/**
* index.js
* This is your main app entry point
*/
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { router as accountRouter } from "./routes/account.js";
import { router as userRouter } from "./routes/user.js";
import { router as apiRouter } from "./routes/api.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up express, bodyparser and EJS
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(path.join(__dirname, 'public'))); // set location of static files
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

// Set up SQLite
const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
});

await db.run("PRAGMA foreign_keys=ON");

// Set the app name
const appName = "BudgetFlow";

// Middleware to add app_name to all responses
app.use((req, res, next) => {
    res.locals.app_name = appName;
    next();
});

// Handle requests to the home page 
app.get('/', (req, res) => {
    res.render("home.ejs");
});

// Add all the route handlers in accountRouter to the app under the path /account
app.use('/account', accountRouter); 

// Add all the route handlers in userRouter to the app under the path /user
userRouter.use('/api', apiRouter);
app.use('/user', userRouter); 


// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});