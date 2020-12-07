## Steps To Use


#### Delete any .keep files

The `.keep` files are there to maintain the file structure of the auth. If there is a folder that has nothing in it, git won't add it. The dev work around is to add a file to it that has nothing in it, just forces git to keep the folder so we can use it later.

#### Install node modules from the package.json

```
npm install
```

(Or just `npm i` for short)

#### Customize with new project name

Remove defaulty type stuff. Some areas to consider are:

* Title in `layout.ejs`
* Description/Repo Link in `package.json`
* Remove boilerplate's README content and replace with new project's readme

#### Create a new database for the new project

Using the sequelize command line interface, you can create a new database from the terminal.

```
createdb <new_db_name>
```

#### Update `config.json`

* Change the database name
* Other settings are likely okay, but check username, password, and dialect

#### Check the models and migrations for relevance to your project's needs

For example, if your project requires a birthdate field, then don't add that in there. 

> When changing your models, update both the model and the migration.

#### Run the migrations

```
sequelize db:migrate
```

#### Add a `.env` file with the following fields:

* SESSION_SECRET: Can be any random string; usually a hash in production
* PORT: Usually 3000 or 8000

#### Run server; make sure it works

```
nodemon
```

or

```
node index.js
```
## About the Project
Pokemon Go Find Them is an app for Pokemon GO players to find information about their favorite pokemon. Users can add pokemon to a watch list and chat using the message board. On the home page there are links to just legendary pokemon and pokemon that appear in raids. As well as a list of every pokemon that has been released in the game. Users can remove pokemon from their watch list once the user chooses at the click of a button. And when using the message board users can edit their post and only theirs. Included is a web scraper that grabs news from a few different websites and adds that information to a database. Also there is a model of every pokemon on the released page containing just the name and id of each pokemon. Pokemon have different forms and stats and moves they can learn differ, however they may not differ from the normal form. 

### Link
https://pokemongofindthem.herokuapp.com/
