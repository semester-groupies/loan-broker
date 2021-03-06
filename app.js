var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var recipienListener = require('./recipientlist/recipientlist');
var index = require('./routes/index');
var users = require('./routes/users');
var form = require('./routes/form');
var getBanksService = require('./server/serverEngine');
var normalizer = require('./normalizer/normalizer');
var transJ = require('./translator/translator-json');
var transX = require('./translator/translator-xml');
var transR = require('./translator/translator-rabbitbank');
var transS = require('./translator/translator-soap');
var soapbank = require('./soapBank/soapBank');
var rabbitBank = require('./rabbitBank/rabbitBank');
var picker = require("./picker/picker");
var app = express();
var getBanksClient = require("./server/client");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/form', form);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
