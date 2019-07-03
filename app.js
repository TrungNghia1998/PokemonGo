var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('serve-favicon')

//routes
var indexRouter = require('./routes/index');
var accountRouter = require('./routes/account');
var adminRouter = require('./routes/admin');
var ingameRouter = require('./routes/ingame');

var app = express();
app.set('trust proxy', true);
//cấu hình favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

//Cấu hình passport
var flash = require('connect-flash');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "poondeptrai"
  // cookie: {
  //   maxAge: 1000 * 60 * 5
  // }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

//Thiết lập kêt nối tới Mongoose
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var mongoDB = 'mongodb://pokebiz:pokebiz@pokebiz-shard-00-00-exjmn.azure.mongodb.net:27017,pokebiz-shard-00-01-exjmn.azure.mongodb.net:27017,pokebiz-shard-00-02-exjmn.azure.mongodb.net:27017/Pokebiz?ssl=true&replicaSet=PokeBiz-shard-0&authSource=admin&retryWrites=true'
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('views_admin', path.join(__dirname, '/views/admin'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + 'node_modules/sanitize-html'));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/admin', adminRouter);
app.use('/ingame', ingameRouter);

//Middle ware reset pokemon
async function rsPokemon() {
  await setTimeout(require('./controllers/ingameController').randomPokemonPosition, 1000)
  await setInterval(require('./controllers/ingameController').randomPokemonPosition, 20 * 1000 * 60)
}

rsPokemon();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//app.use(express.static('/public/'));

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
