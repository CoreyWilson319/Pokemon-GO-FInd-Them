require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const axios = require('axios').default;
const SECRET_SESSION = process.env.SECRET_SESSION;
// console.log(SECRET_SESSION)
const app = express();

// isLoggedIn middleware
const isLoggedIn = require('./middleware/isLoggedIn');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

// secret: What we actually will be giving the user on our site as a session cookie
// resave: Save the session even if it's modified, make this false
// saveUninitialized: If we have a new session, we save it, therefore making that true

const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}

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

app.get('/', (req, res) => {
  // console.log(res.locals.alerts, "server line 51");
    const options = {
    method: 'GET',
    url: "https://pokemon-go1.p.rapidapi.com/released_pokemon.json",
    headers: {
      'x-rapidapi-key': process.env.api_key,
      'x-rapidapi-host': process.env.api_host,
    }
  };
  axios.request(options).then(function (pokemon) {
    const pokemonAPI = pokemon.data
    const pokemonList = [];

    // for (let poke of pokemon.data) {
    //   pokemonList.push(poke);
    // }
    for (let poke in pokemonAPI) {
      pokemonList.push(pokemonAPI[poke]);
    }
    // console.log(pokemonList)


    res.render('index', { alerts: res.locals.alerts, pokemonList});
  }).catch(function (error) {
    console.error(error);
  });
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

app.use('/auth', require('./routes/auth'));


const PORT = process.env.PORT || 3111;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
