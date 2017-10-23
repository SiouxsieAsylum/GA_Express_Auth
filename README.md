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

Watch me do this, don't try to follow along. It's going to be a long process, and there probably won't be a lab at the end. That's okay. Auth is one of things where you just have to follow the step by step guide all the way down.

## Alter the database

First we need to add a new table to the database to add a users table. We're also going to alter the movies table so that it has a user_id column.

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