const express = require('express');
const app = express();
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const logSearch = require('./routes/logSearch');
const	srcList = require('./routes/srcList');
const dstList = require('./routes/dstList');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next){
   res.setHeader("Cache-Control", "no-store, no-store, must-revalidate");
   res.setHeader("Pragma", "no-cache");
   res.setHeader("Expires", 0);
   return next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', index);
app.use('/srclist', srcList);
app.use('/dstlist', dstList);
app.use('/logsearch', logSearch);

// Removed Download feature
	// /files/* is accessed via req.params[0]
	// but here it is named :file
	//app.get('/:file(*)', function(req, res, next){
	//  var file = req.params.file,
	//      path = __dirname + '/files/' + file;
	//  res.download(path);
	//});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
      res.status(500);
      res.render(err);
   }
});

module.exports = app;