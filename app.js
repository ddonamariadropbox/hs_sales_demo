var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
//var hbs = require('hbs');
var expressHbs = require('express-handlebars');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use("/public", express.static(__dirname + "/public"));

//hbs.registerPartials(__dirname + '/views/partials');

//mongoose.connect('localhost:27017/nodeapp');
var mongoDB = 'mongodb+srv://michaelphaley:mongobongo@hs-sales-demo-bkipo.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout_intro', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
