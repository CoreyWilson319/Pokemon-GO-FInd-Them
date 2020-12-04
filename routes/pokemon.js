require('dotenv').config();
const express = require('express');
// const layouts = require('express-ejs-layouts');
// const session = require('express-session');
const passport = require('../config/ppConfig');
// const flash = require('connect-flash');
const axios = require('axios').default;
// const SECRET_SESSION = process.env.SECRET_SESSION;
const router = express.Router();
const db = require('../models')
// console.log(SECRET_SESSION)
// const router = express();

const isLoggedIn = require('../middleware/isLoggedIn');

// router.use('/auth', require('../routes/auth')); 

// const sessionObject = {
//     secret: SECRET_SESSION,
//     resave: false,
//     saveUninitialized: true
//   };
  
//   router.use(session(sessionObject));
  
  // Initialize passport and run through middleware
  // router.use(passport.initialize());
  // router.use(passport.session());
  // router.use(layouts);
  
  // Flash
  // Using flash to throughout router to send temp messages to user
// router.use((req, res, next) => {
//     // Before every route, we will attach a user to res.local
//     res.locals.alerts = req.flash();
//     res.locals.currentUser = req.user;
//     next();
// });
// router.use(flash());


// Messages that will be accessible to every view


router.get('/', (req, res) => {
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
    for (let poke in pokemonAPI) {
      pokemonList.push(pokemonAPI[poke]);
    }
    pokemonList.forEach(pokemons => {
      db.pokemon.findOrCreate({
        where: {
          pokeId: pokemons.id
        },
        defaults: {
          name: pokemons.name
        }
      })
    })


    res.render('index', { alerts: res.locals.alerts, pokemonList});
  }).catch(function (error) {
    console.error(error);
  });
});


router.get('/released', (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://pokemon-go1.p.rapidapi.com/released_pokemon.json',
    headers: {
      'x-rapidapi-key': process.env.api_key,
      'x-rapidapi-host': process.env.api_host
    }
  };
  
  axios.request(options).then(function (response) {
    const pokemon = response.data
    const pokemonList = [];
    for (let poke in pokemon) {
      pokemonList.push(pokemon[poke]);
    }
    res.render('released', { pokemonList })
  }).catch(function (error) {
    console.error(error);
  });

});

router.get('/legendaries', (req, res) => {
  var options = {
    method: 'GET',
    url: 'https://pokemon-go1.p.rapidapi.com/pokemon_rarity.json',
    headers: {
      'x-rapidapi-key': process.env.api_key,
      'x-rapidapi-host': process.env.api_host
    }
  };
  
  axios.request(options).then(function (response) {
    const pokemon = response.data.Legendary
    res.render('legendaries', { pokemon })
  }).catch(function (error) {
    console.error(error);
  });

});

router.get('/raids', (req, res) => {
  var options = {
    method: 'GET',
    url: 'https://pokemon-go1.p.rapidapi.com/raid_exclusive_pokemon.json',
    headers: {
      'x-rapidapi-key': process.env.api_key,
      'x-rapidapi-host': process.env.api_host
    }
  };
  
  axios.request(options).then(function (response) {
    const pokemon = response.data
    const pokemonList = [];
    for (let poke in pokemon) {
      pokemonList.push(pokemon[poke]);
    }
    res.render('raids', { pokemonList })
  }).catch(function (error) {
    console.error(error);
  });
});

router.get('/profile', isLoggedIn, (req, res) => {
  db.userPokemon.findAll({
    where: {
      userId: req.user.id
    }
  }).then(watchlist => {
    var options = {
      method: 'GET',
      url: 'https://pokemon-go1.p.rapidapi.com/released_pokemon.json',
      headers: {
        'x-rapidapi-key': process.env.api_key,
        'x-rapidapi-host': process.env.api_host
      }
    };
    axios.request(options).then(function (response) {
      const pokemon = response.data
      const pokemonList = [];
      for (let poke in pokemon) {
        pokemonList.push(pokemon[poke]);
      }
      res.render('profile', { watchlist, pokemonList });
    }).catch(function (error) {
      console.error(error);
    });
  }).catch(function(err){
    console.log(err)
  })

});

router.post('/released', isLoggedIn, (req, res) => {
  db.userPokemon.findOrCreate({
    where: {
      pokemonId: req.body.id,
      userId: req.user.id
    }
  })

  res.redirect('released')
});
router.delete('/profile/:id', isLoggedIn, (req, res) => {
  db.userPokemon.findOne({
    where: {
      pokemonId: req.params.id,
      userId: req.user.id
    }
  }).then((foundPkmn) => {
    foundPkmn.destroy().then(() => {
      res.redirect('/profile')
    })
  })
});

router.get('/messageboard', (req, res) => {
  db.post.findAll().then(allPost => {
    res.render('messageboard', { allPost })

  })
});

router.post('/messageboard', (req, res) => {
  db.post.create({
    creator: req.body.creator,
    content: req.body.content
  }).then( ()=> {
  res.redirect('messageboard')
  })
});

router.get('/messageboard/post/:id', (req, res) => {
  db.post.findOne({
    where: {
      id: req.params.id
    }
  }).then((post) => {res.render('editPost', { post })})
  
});

router.put('/messageboard/post/:id', (req, res) => {
  console.log("Hello", req.body.content)
  console.log(req.params.id)
  db.post.update({
    content: req.body.content
  }, {
    where: {
      id: req.params.id
    }
  }).then( () => {res.redirect('/messageboard')})
});

router.get('/pokemon/:id', (req, res) => {
  const id = req.params.id
  console.log(id)

  async function details () {
    const moveList = []
    const candyList = []
    var options = await {
    method: 'GET',
    url: 'https://pokemon-go1.p.rapidapi.com/current_pokemon_moves.json',
    headers: {
      'x-rapidapi-key': process.env.api_key,
      'x-rapidapi-host': process.env.api_host
    }
  };
  
  const moves = await axios.request(options)
  
var options2 = await {
  method: 'GET',
  url: 'https://pokemon-go1.p.rapidapi.com/pokemon_candy_to_evolve.json',
  headers: {
    'x-rapidapi-key': process.env.api_key,
    'x-rapidapi-host': process.env.api_host
  }
};

const candy = await axios.request(options2)
moves.data.forEach(move => {
  moveList.push(move)
})

const knowncandy = candy.data
for (const pokemon in knowncandy) {
  candyList.push(knowncandy[pokemon])
}
console.log(candyList)

res.render('details', { moveList, candyList, id})

}
  details()
  
})

  module.exports = router