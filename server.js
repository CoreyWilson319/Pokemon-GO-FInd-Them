require("dotenv").config();
const express = require("express");
const layouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("./config/ppConfig");
const flash = require("connect-flash");
const puppeteer = require('puppeteer');
const SECRET_SESSION = process.env.SECRET_SESSION;
const methodOverride = require("method-override");
// console.log(SECRET_SESSION)
const app = express();

// isLoggedIn middleware
const isLoggedIn = require("./middleware/isLoggedIn");

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(require("morgan")("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(layouts);

// secret: What we actually will be giving the user on our site as a session cookie
// resave: Save the session even if it's modified, make this false
// saveUninitialized: If we have a new session, we save it, therefore making that true

const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionObject));

// Initialize passport and run through middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
// Using flash to throughout app to send temp messages to user
app.use(flash());

// Messages that will be accessible to every view
app.use((req, res, next) => {
  // Before every route, we will attach a user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use("/auth", require("./routes/auth"));

app.use("/", require("./routes/pokemon"));
const PORT = process.env.PORT || 4116;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
