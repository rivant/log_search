var express = require('express'),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var index = require('./routes/index'),
    users = require('./routes/users'),
    util = require('./lib/utils'),
    content = require('./lib/content'),
    search = require('./lib/search'),
    script = require('./lib/scripts');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Templates
app.locals.script = script;
app.locals.content = content;
app.locals.util = util;

// Routes
//app.use('/', index);
//app.use('/users', users);

// web actions
app.get('/', function(req, res){
   res.render('index', content);
});

app.post('/', function(req, res){
   search.form(req, res);
});

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

  // render the error
   if (err){
      loginError(err.message, res);
   }
});

function loginError(msg, res){
   if (msg.includes('EACCES')){
      content.msgDisplay = 'color:red';
      content.msg= 'Invalid User ID or Password';
      res.render('index', content);
      content.reset();
   } else {
      res.status(msg.status || 500);
      res.render('error');
   }
};

module.exports = app;
