require("dotenv").config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const { urlencoded } = require("body-parser");
const port = 3000;
const users = require('./routes/routes');

// database connection

const dbURI = 'mongodb://127.0.0.1:27017/node_crud';

//This is added by me here 
const a = 10;

mongoose.connect(dbURI);
const db = mongoose.connection;

db.on('error', (error) => { 

    console.log(error);
})

db.once('open', () => { 

    console.log("Connected to the database");
})

// Built in middleware

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({

    secret: "my secret key",
    saveUninitialized: true,
    resave: false
}));

// end of built in middleware

app.use((req, res, next) => { 

    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

//Set template engine

app.set("view engine", "ejs");

app.use(express.static('uploads'));

//route prefix

app.use("", users);

app.listen(port, () => { 

    console.log(`Successfully listening the port ${port}`);
})