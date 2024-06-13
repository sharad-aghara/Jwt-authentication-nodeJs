const express = require('express');
const app = express();
const Auth  = require('./auth');
const {Verify, VerifyRole} = require('../middleware/verify');
// const VerifyRole = require('../middleware/verifyRole');

// Reduce fingerprinting
app.disable("x-powered-by");

app.get("/v1", (req, res) => {
    try{
        res.status(200).json({
            status: "Success",
            data: [],
            message: "Welcome to API home page"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

app.get("/v1/user", Verify, (req, res) => {
    //
    console.log("routes/index");


    res.status(200).json({
        status: "Success",
        message: "Welcome to Dashboard."
    })
});

app.get("/v1/admin", Verify, VerifyRole, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the Admin portal!",
    });
});

module.exports = app;

app.use('/v1/auth', Auth);