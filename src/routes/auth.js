const express  = require('express');
const Validate = require('../middleware/validate.js');
const {check }= require('express-validator');
const {Login, Register, Logout} = require('../controllers/auth.js')

const router = express.Router();

// Register route
router.post(
    "/register",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("first_name")
        .not()
        .isEmpty()
        .withMessage("You first name is required")
        .trim()
        .escape(),
    check("last_name")
        .not()
        .isEmpty()
        .withMessage("You last name is required")
        .trim()
        .escape(),
    check("password")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Must be at least 6 chars long"),
    Validate,
    Register
);

module.exports = router;

// Login route
router.post(
    "/login",
    check("email")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    check("password").not().isEmpty(),
    Validate,
    Login
);


// Logout route
router.get('/logout', Logout);