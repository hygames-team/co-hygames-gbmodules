require('dotenv').config();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('morgan');
const path = require('path');

const dbConfig = require('./db');
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(`Connected to MongoDB "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to Mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'static')));

var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);

module.exports = app;