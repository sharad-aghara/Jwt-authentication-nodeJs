const User = require('../models/User');
const bcrypt = require('bcrypt');
const Blacklist = require('../models/Blacklist');


// Register logic
async function Register(req, res) {

    const { first_name, last_name, email, password, role } = req.body;
    try {

        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
            role,
        });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        const savedUser = await newUser.save();
        // const { role, ...user_data } = savedUser._doc;
        const { ...user_data } = savedUser._doc;

        console.log("user_data: ", user_data);

        res.status(200).json({
            status: "success",
            data: [user_data],
            message:
                "Thank you for registering with us. Your account has been successfully created.",
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}


// login logic
async function Login(req, res) {

    const { email } = req.body;
    try {

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");

        if (!user)
            return res.status(401).json({
                status: "failed",
                data: [],
                message:
                    "User does not exists, register new user.",
            });

        // if user exist, validate password
        const isPasswordValid = bcrypt.compare(
            `${req.body.password}`,
            user.password
        );

        // if not valid return unauthorized response
        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                data: [],
                message:
                    "Invalid email or password. Please try again with the correct credentials.",
            });

        let options = {
            maxAge: 20 * 60 * 100,   // expire in 20 minute (Cookie age)
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const token = user.generateAccessJWT(); // generate access token for user
        res.cookie("SessionID", token, options);    // set the token to response header

        const { password, ...user_data } = user._doc;

        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "You have successfully logged in.",
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}


// Logout logic
async function Logout(req, res) {
    try {

        const authHeader = req.headers['cookie']; // get the session cookie from request header

        if (!authHeader) return res.sendStatus(204); // No content
        const cookie = authHeader.split('=')[1]; // If there is, split the cookie string to get the actual jwt token
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
        // if true, send a no content response.
        if (checkIfBlacklisted) return res.sendStatus(204);
        // otherwise blacklist token
        const newBlacklist = new Blacklist({
            token: accessToken,
        });
        await newBlacklist.save();
        // Also clear request cookie on client
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
}


module.exports = { Login, Register, Logout };