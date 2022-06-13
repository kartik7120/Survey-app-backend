require("dotenv").config();
const pollRouter = require("./routes/poll");
const router = require("./routes/testServer");
const cors = require("cors");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session = require("express-session");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const helmet = require("helmet");
const mongoose = require('mongoose');
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const url = process.env.URL || 'mongodb://localhost:27017/Survey';

mongoose.connect(url, connectionParams)
  .then(() => {
    console.log("Connected to the mongo DB database");
  })
  .catch((err) => {
    console.log("OH NO ERROR", err);
  })


var app = express();

// view engine setup
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "ilikeanime",
  resave: true,
  saveUninitialized: true
}))
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testServer", router); // for testing the router the server
app.use("/poll", pollRouter);
app.use(helmet());
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
