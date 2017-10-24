# Express auth!

### Learning Objectives

1. Define authentication in the context of a web app.
2. Explain what Passport and Passport strategies are and how they fit into the Express framework.
3. Install Passport and set up a local authentication strategy.
4. Add authentication to Thundercats Flashcards, so that users must be logged in in order to add or edit flashcards.

### Sessions

- The session is an integral part of a web application.
- It allows data to be passed throughout the application through cookies that are stored on the browser and matched up to a server-side store.
- Usually sessions are used to hold information about the logged in status of users as well as other data that needs to be accessed throughout the app.
- We will be working with [express-session](https://github.com/expressjs/session) to enable sessions within our flashcards app.

### Password Encryption

- When storing passwords in your database you **never** want to store plain text passwords. Ever.
- There are a variety of encryption methods available including MD5, SHA1, SHA2, and Blowfish.
- Check out this [video on password security](https://www.youtube.com/watch?v=7U-RbOKanYs)

### Using `bcrypt`

- `bcryptjs` is an NPM module that helps us create password hashes to save to our database.
- Let's check out [the documentation](https://www.npmjs.com/package/bcrypt) to learn how to implement this module.
- We will implement this together with [passport](https://www.passportjs.org/) to create an authentication strategy for our Express application.

# Implementing auth with passport

- Passport - Passport is authentication middleware for Node. It is designed to serve a singular purpose: authenticate requests. When writing modules, encapsulation is a virtue, so Passport delegates all other functionality to the application. This separation of concerns keeps code clean and maintainable, and makes Passport extremely easy to integrate into an application. -
  [Passport documentation](http://passportjs.org/docs/overview)
- Passport Strategy - Passport recognizes that each application has unique authentication requirements. Authentication mechanisms, known as strategies, are packaged as individual modules. Applications can choose which strategies to employ, without creating unnecessary dependencies. For example, there are separate strategies for GitHub logins, Facebook logins, etc. -
  [Passport documentation](http://passportjs.org/docs/overview)


# Steps to Implement Passport

Watch me do this, don't try to follow along. It's going to be a long process. That's okay. Auth is one of things where you just have to follow the step by step guide all the way down.

## Alter the database

First we need to add a new table to the database to add a users table. We're also going to alter the flashcards table so that it has a user_id column.

```sql
-- db/migrations/migration-[dateandtime].sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_digest TEXT NOT NULL,
  firstname VARCHAR(255),
  lastname VARCHAR(255)
);

ALTER TABLE flashcards
ADD COLUMN user_id INTEGER REFERENCES users(id);
```

## Install and require new packages

We need to `npm install --save` a number of new packages:
- `bcryptjs`: the blowfish encryption package to encrypt and decrypt our passwords. (**NOTE**: There's also a package `bcrypt`. We want `bcryptjs`.)
- `dotenv`
- `express-session`: to store our sessions on the express server. (**NOTE**: There is also a package `express-sessions`. We want `express-session`.)
- `cookie-parser`: to parse cookies
- `passport`: express middleware to handle authentication
- `passport-local`: passport strategy to set up the username-password login flow

Then, we need to require them in our server.js.

`bcryptjs` we'll use in a later step. But, let's set up and require some of the others. In `server.js`, let's require our new middleware and set them up.

Under requiring method-override:

```js
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
```

Under initializing the express app:
```js
require('dotenv').config();
```

Under the `bodyParser` setup:

```js
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
```

You'll notice that when we set up the session, we're using an environmental variable, `process.env.SECRET_KEY`. This, of course, means we need to create a `.env` file and add it to our `.gitignore`. In `.env`:

```
SECRET_KEY=sldkfjlskdjfoiwejrljsdlkfjoisdkljflkweoisdlkf
```

(It can just be a long string of gibberish.)

<details>
<summary>At this point, <code>server.js</code> looks like this.</summary>

```js
// import express from our dependencies
const express = require('express');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// initialize the app
const app = express();
// add our dotenv files
require('dotenv').config();

// middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// static files
app.use(express.static('public'));

// views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set the port, either from an environmental variable or manually
const port = process.env.PORT || 3000;
// tell the app to listen on that particular port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Our index route!
app.get('/', (req, res) => {
  res.render('index');
});

// import our movie routes & tell the app to use them
const flashcardRoutes = require('./routes/flashcard-routes');
app.use('/flashcards', flashcardRoutescre);

// Error handler!
app.get('*', (req, res) => {
    res.status(404).send('not found!');
});
```

</details>

## Add the views for logging in and registering

Take a look [here](./flashcards-begin/views/auth) to see what those look like. **Note** that the inputs are named `username` and `password` -- this is what passport expects, and you shouldn't change it.

## Create a User model

In `models`, create a new file `User.js`. It should have `findByUserName` and `create` methods.

It should look like this:

```js
const db = require('../db/config');

const User = {};

User.findByUserName = userName => {
  return db.oneOrNone(`
    SELECT * FROM users
    WHERE username = $1
  `, [userName]);
};

User.create = user => {
  return db.one(`
    INSERT INTO users
    (username, email, password_digest, firstname, lastname)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [user.username, user.email, user.password_digest, user.firstname, user.lastname]);
};

module.exports = User;
```

## Setting up Passport

### `/services/auth`

Create a `services` directory in the root of your app, and an `auth` directory inside that. Add the following files to the auth directory: `auth-helpers.js`, `local.js`, and `passport.js`.

### `auth-helpers.js`

This file will contain various helper functions that we use throughout our app. For now, we are just going to add a function that will use bcrypt to compare passwords. Add the following code:

```js
const bcrypt = require('bcryptjs');

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

```

### `passport.js`

Add the following code (pretty much comes directly from the passport docs):

```js
const passport = require('passport');
const User = require('../../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    User.findByUserName(username)
      .then(user => {
        done(null, user);
      }).catch(err => {
        done(err, null);
      });
  });
};
```

The `serializeUser` is invoked when the user first logs in, and specifies what user information should be stored in the session. `deserializeUser` is invoked on every request and allows us to load additional user information on every request. This information is attached to the request as `req.user`.

### `local.js`

Add the following code:

```js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const init = require('./passport');
const User = require('../../models/user');
const authHelpers = require('./auth-helpers');

const options = {};

init();

passport.use(
  new LocalStrategy(options, (username, password, done) => {
    User.findByUserName(username)
      .then(user => {
        if (!user) {
          return done(null, false);
        }
        if (!authHelpers.comparePass(password, user.password_digest)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      }).catch(err => {
        console.log(err);
        return done(err);
      });
  })
);

module.exports = passport;

```

This sets up our local strategy -- the strategy we're going to be using to determine whether or not a user can log in. We're saying that the passport middleware should use a new instance of `LocalStrategy`, and passing it a blank options argument and a callback function.

## Setting up our register, login, logout, & user routes.

### GET `/auth/register`, GET `/auth/login`

Now let's add the ability to register users. To do that, we first need a registration form and a register route. In the routes directory, add `auth-routes.js`. Add the following code:

```js
const express = require('express');
const authRouter = express.Router();
const passport = require('../services/auth/local');
const authHelpers = require('../services/auth/auth-helpers');
const usersController = require('../controllers/users-controller');

authRouter.get('/login', authHelpers.loginRedirect, (req, res) => {
  res.render('auth/login');
});

authRouter.get('/register', authHelpers.loginRedirect, (req, res) => {
  res.render('auth/register');
});
```

Add this to `services/auth/authHelpers`:

```js
function loginRedirect(req, res, next) {
  if (req.user) return res.redirect('/user');
  return next();
}

```


### POST `/auth/register`

When the user posts to the `/auth/register` route, the browser will send all the data contained in the form field to our express server. Our route middleware will then create a new user with that data. Add the following code to `routes/auth-routes.js`:

```js
authRouter.post('/register', usersController.create);
```

The actual work of creating the user is offloaded to our controller. Let's create `controllers/users-controller.js` and add the following code:

```js
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');

const usersController = {};

usersController.create = (req, res) => {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  User.create({
    username: req.body.username,
    email: req.body.email,
    password_digest: hash,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  }).then(user => {
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect('/user');
    });
  }).catch(err => {
    console.log(err);
    res.status(500).json({error: err});
  });
}

module.exports = usersController;

```

Now that we can register users, let's give them the ability to log in.

### POST `/auth/login`

We already have a page to login. Now let's make it so that users can actually submit their login form. Passport makes this POST route handler pretty easy to write. Add the following code to `routes/auth-routes`:

```js
authRouter.post('/login', passport.authenticate('local', {
    successRedirect: '/user', 
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);
```

Passport authenticates the user for us based on the strategy we tell it to, in this case the local strategy. It authenticates according to the function in `services/auth/local.js`. Refer back to that to see what's going on there.

### GET `/auth/logout`

Logging out is pretty straightforward. Add the following, again, to `routes/auth-routes.js`.

```js
authRouter.get('/logout', (req, res) => {
  req.logout();
  res.redirect('back');
});

module.exports = authRouter;
```

### GET `/user`

Now that users can log in, we'll give them a profile page. Create a new file, `routes/user-routes`:

```js
const express = require('express');
const userRoutes = express.Router();
const usersController = require('../controllers/users-controller');
const authHelpers = require('../services/auth/auth-helpers');

userRoutes.get('/', authHelpers.loginRequired, usersController.index);

module.exports = userRoutes;
```

Then, in our `controller/users-controller.js`:

```js
usersController.index = (req, res) => {
  res.json({
    message: 'Put a user profile page on this route',
    data: {
      user: req.user,
    },
  });
};
```

In our route, we had a new auth helper method. This, rather than redirecting logged in users, will redirect users that aren't logged in. We're protecting this route. Again, the auth helper is middleware. If the user isn't logged in, they get redirected to `/auth/login`; if they are logged in, they get sent on to a profile page. Add the following code to the `services/auth/auth-helpers.js` file:

```js
function loginRequired(req, res, next) {
  if (!req.user) return res.redirect('/auth/login');
  return next();
}

module.exports = {
  comparePass,
  loginRedirect,
  loginRequired,
}
```

### Add new routes to `server.js`

Last step! Now let's add the new routes to `server.js`. Below our flashcards route:

```js
const authRoutes = require('./routes/auth-routes');
app.use('/auth', authRoutes);
const userRoutes = require('./routes/user-routes');
app.use('/user', userRoutes);
```

And.... we're all set up!!

# Adding authentication-specific functionality

Let's do a couple of things for our app: 
- Users who aren't logged in can't add or edit flashcards
- When flashcards are added, they record the id of the user who added them to the database
- When users log in, they see all the flashcards they've added to the database

### Protecting flashcard add and edit functionality

This one's an easy one. All we need to do is add our `authHelpers.loginRequired` in a couple of routes.

In `routes/flashcard-routes.js`:

```js

flashcardRoutes.get('/', flashcardsController.index);
flashcardRoutes.post('/', authHelpers.loginRequired, flashcardsController.create);

flashcardRoutes.get('/add', authHelpers.loginRequired, (req, res) => {
  res.render('flashcards/flashcards-new');
});

flashcardRoutes.get('/:id', flashcardsController.show);
flashcardRoutes.get('/:id/edit', authHelpers.loginRequired, flashcardsController.edit);
flashcardRoutes.put('/:id', authHelpers.loginRequired, flashcardsController.update);
flashcardRoutes.delete('/:id', authHelpers.loginRequired, flashcardsController.delete);
```

We've added `authHelpers.loginRequired` to every route except our show and index routes. Now, nobody can add, edit, or delete flashcards without being logged in.

### Adding the user's id to the flashcards table

This one's also pretty simple. We have access to all of the user's information on `req.user`, so we can use that in our `Flashcard.create` model method. In `models/Flashcard.js`:

```js
Flashcard.create = (flashcard, userid) => {
  return db.one(
    `INSERT INTO flashcards
    (question, answer, category, difficulty, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`, [flashcard.question, flashcard.answer, flashcard.category, flashcard.difficulty, userid]);
}
```

Of course, remembering to pass that value in in our `controllers/flashcards-controller.js`

```js
flashcardsController.create = (req, res) => {
  Flashcard.create({
    question: req.body.question,
    answer: req.body.answer,
    category: req.body.category,
    difficulty: req.body.difficulty,
  }, req.user.id).then(flashcard => {
    res.redirect(`/flashcards/${flashcard.id}`)
  }).catch(err => {
    console.log(err);
    res.status(500).json({error: err});
  });
};
```

### User has access to their flashcards on their profile page

This one is a little bit more complex. We're going to need to add a new method on our `User` model, and modify our `usersController` index.

Our new `User.findUserMovies` method:

```js
User.findUserFlashcards = id => {
  return db.manyOrNone(`
    SELECT * FROM flashcards
    WHERE user_id = $1
  `, [id]);
};
```

Then, our update to the `usersController.index` method:

```js
usersController.index = (req, res) => {
  User.findUserFlashcards(req.user.id)
    .then(flashcards => {
        res.json({
          message: 'Put a user profile on this route',
          data: {
            user: req.user,
            flashcards: flashcards,
          },
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({err: err});
    });
}
```

### Some other things we could try

- A user can only edit or delete a flashcard they've added
- When users try to sign up with the same username, it tells them that that's the problem on the page, instead of showing a JSON error
- If a user is logged in, it shows a "profile" link in the nav; otherwise, it shows the links to register and login
- Building out the user profile page
