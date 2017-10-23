### just to show i get them too...

```
/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/models/User.js:5
user.findByUserName = userName => {
^

ReferenceError: user is not defined
    at Object.<anonymous> (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/models/User.js:5:1)
    at Module._compile (module.js:624:30)
    at Object.Module._extensions..js (module.js:635:10)
    at Module.load (module.js:545:32)
    at tryModuleLoad (module.js:508:12)
    at Function.Module._load (module.js:500:3)
    at Module.require (module.js:568:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/services/auth/passport.js:2:14)
    at Module._compile (module.js:624:30)
```

- `User` in model should be capitalized

```
/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/routes/auth-routes.js:10
authRouter.post('/login', passport.authenticate('local', {
                                   ^

TypeError: passport.authenticate is not a function
    at Object.<anonymous> (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/routes/auth-routes.js:10:36)
    at Module._compile (module.js:624:30)
    at Object.Module._extensions..js (module.js:635:10)
    at Module.load (module.js:545:32)
    at tryModuleLoad (module.js:508:12)
    at Function.Module._load (module.js:500:3)
    at Module.require (module.js:568:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/server.js:41:20)
    at Module._compile (module.js:624:30)

```

- imported `services/auth/passport` instead of `services/auth/local`


```
TypeError: authHelpers.comparePassword is not a function
    at User.findByUserName.then.user (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/services/auth/local.js:19:24)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
TypeError: authHelpers.comparePassword is not a function
    at User.findByUserName.then.user (/Users/JLR/GA_TEACH/THUNDERCATS/UNIT02/LECTURES/LECTURE_U02_D09_Express-Auth/flashcards-final/services/auth/local.js:19:24)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
POST /auth/login 500 8.928 ms - 476

```

- it's called  `comparePass` not `comparePassword`




