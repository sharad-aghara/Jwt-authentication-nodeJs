const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { PORT, URI } = require('./config/index.js')
const App = require('./routes/index.js');

const server = express();

// configure header information
server.use(cors());
server.disable("x-powered-by"); //Reduce fingerprinting
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// connect to database
mongoose.promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
    .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("Connected to database"))
    .catch((err) => console.log(err));

// connect main route to server
server.use(App);

// start up server
server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);