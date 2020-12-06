require("dotenv").config();
const express = require("express");
const passport = require("../config/ppConfig");
const axios = require("axios").default;
const router = express.Router();
const db = require("../models");

const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/", (req, res) => {

  const options = {
    method: "GET",
    url: "https://pokemon-go1.p.rapidapi.com/released_pokemon.json",
    headers: {
      "x-rapidapi-key": process.env.api_key,
      "x-rapidapi-host": process.env.api_host,
    },
  };
  axios
    .request(options)
    .then( function (pokemon) {
      const pokemonAPI = pokemon.data;
      const pokemonList = [];
      for (let poke in pokemonAPI) {
        pokemonList.push(pokemonAPI[poke]);
      }
      pokemonList.forEach((pokemons) => {
        db.pokemon.findOrCreate({
          where: {
            pokeId: pokemons.id,
          },
          defaults: {
            name: pokemons.name,
          },
        });
      })
      // async function findInformation() {
      //   const informations = await db.information.findAll()
      //   await informations
      //   await console.log(informations)
      //   return
      // }

        res.render("index", { alerts: res.locals.alerts, pokemonList });
    })
    .catch((error) =>  {
      console.error(error);
    });
})

;

router.get("/released", (req, res) => {
  const options = {
    method: "GET",
    url: "https://pokemon-go1.p.rapidapi.com/released_pokemon.json",
    headers: {
      "x-rapidapi-key": process.env.api_key,
      "x-rapidapi-host": process.env.api_host,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      const pokemon = response.data;
      const pokemonList = [];
      for (let poke in pokemon) {
        pokemonList.push(pokemon[poke]);
      }
      res.render("released", { pokemonList });
    })
    .catch(function (error) {
      console.error(error);
    });
});

router.get("/legendaries", (req, res) => {
  var options = {
    method: "GET",
    url: "https://pokemon-go1.p.rapidapi.com/pokemon_rarity.json",
    headers: {
      "x-rapidapi-key": process.env.api_key,
      "x-rapidapi-host": process.env.api_host,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      const pokemon = response.data.Legendary;
      res.render("legendaries", { pokemon });
    })
    .catch(function (error) {
      console.error(error);
    });
});

router.get("/raids", (req, res) => {
  var options = {
    method: "GET",
    url: "https://pokemon-go1.p.rapidapi.com/raid_exclusive_pokemon.json",
    headers: {
      "x-rapidapi-key": process.env.api_key,
      "x-rapidapi-host": process.env.api_host,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      const pokemon = response.data;
      const pokemonList = [];
      for (let poke in pokemon) {
        pokemonList.push(pokemon[poke]);
      }
      res.render("raids", { pokemonList });
    })
    .catch(function (error) {
      console.error(error);
    });
});

router.get("/profile", isLoggedIn, (req, res) => {
  db.userPokemon
    .findAll({
      where: {
        userId: req.user.id,
      },
    })
    .then((watchlist) => {
      var options = {
        method: "GET",
        url: "https://pokemon-go1.p.rapidapi.com/released_pokemon.json",
        headers: {
          "x-rapidapi-key": process.env.api_key,
          "x-rapidapi-host": process.env.api_host,
        },
      };
      axios
        .request(options)
        .then(function (response) {
          const pokemon = response.data;
          const pokemonList = [];
          for (let poke in pokemon) {
            pokemonList.push(pokemon[poke]);
          }
          res.render("profile", { watchlist, pokemonList });
        })
        .catch(function (error) {
          console.error(error);
        });
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.post("/released", isLoggedIn, (req, res) => {
  db.userPokemon.findOrCreate({
    where: {
      pokemonId: req.body.id,
      userId: req.user.id,
    },
  });

  res.redirect("released");
});
router.delete("/profile/:id", isLoggedIn, (req, res) => {
  db.userPokemon
    .findOne({
      where: {
        pokemonId: req.params.id,
        userId: req.user.id,
      },
    })
    .then((foundPkmn) => {
      foundPkmn.destroy().then(() => {
        res.redirect("/profile");
      });
    });
});

router.get("/messageboard",isLoggedIn, (req, res) => {
  db.post.findAll().then((allPost) => {
    const id = req.user.dataValues.id

    res.render("messageboard", { allPost, id });
  });
});

router.post("/messageboard",isLoggedIn, (req, res) => {
  db.post
    .create({
      creator: req.body.creator,
      content: req.body.content,
      userId: req.user.dataValues.id
    })
    .then(() => {
      console.log(req.user.dataValues.id)
      res.redirect("messageboard");
    });
});

router.get("/messageboard/post/:id", (req, res) => {
  db.post
    .findOne({
      where: {
        id: req.params.id,
      },
    })
    .then((post) => {
      res.render("editPost", { post });
    });
});

router.put("/messageboard/post/:id", (req, res) => {
  console.log("Hello", req.body.content);
  console.log(req.params.id);
  db.post
    .update(
      {
        content: req.body.content,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
    .then(() => {
      res.redirect("/messageboard");
    });
});

router.get("/pokemon/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  async function details() {
    const moveList = [];
    const candyList = [];
    var options = await {
      method: "GET",
      url: "https://pokemon-go1.p.rapidapi.com/current_pokemon_moves.json",
      headers: {
        "x-rapidapi-key": process.env.api_key,
        "x-rapidapi-host": process.env.api_host,
      },
    };

    const moves = await axios.request(options);

    var options2 = await {
      method: "GET",
      url: "https://pokemon-go1.p.rapidapi.com/pokemon_candy_to_evolve.json",
      headers: {
        "x-rapidapi-key": process.env.api_key,
        "x-rapidapi-host": process.env.api_host,
      },
    };

    const candy = await axios.request(options2);
    moves.data.forEach((move) => {
      moveList.push(move);
    });

    const knowncandy = candy.data;
    for (const pokemon in knowncandy) {
      candyList.push(knowncandy[pokemon]);
    }
    console.log(candyList);

    res.render("details", { moveList, candyList, id });
  }
  details();
});
router.get("/pokemon/stats/:id", (req, res) => {
  const id = req.params.id;
  const options = {
    method: "GET",
    url: "https://pokemon-go1.p.rapidapi.com/pokemon_stats.json",
    headers: {
      "x-rapidapi-key": process.env.api_key,
      "x-rapidapi-host": process.env.api_host,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      const stats = response.data;
      console.log(stats);
      res.render("stats", { stats, id });
    })
    .catch(function (error) {
      console.error(error);
    });
});

router.get("*", function (req, res) {
  res.status(404);
  res.render("error");
});
module.exports = router;
