const express = require('express');
const authRouter = express.Router();
const passport = require('../services/auth/passport');
const usersController = require('../services/auth/auth-helpers');

authRouter.get('/login', authHelpers.loginRedirect, (req, res) => {
  res.render('auth/login');
});

authRouter.get('/register', authHelpers.loginRedirect, (req, res) => {
  res.render('auth/register');
});

