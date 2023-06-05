var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

var mongoose = require('mongoose');
var mongoDB = "mongodb+srv://zanderanja:3ytNvsgkmxLu3Lf0@outsidersdb.yko7zhq.mongodb.net/?retryWrites=true&w=majority";
var client = new MongoClient(mongoDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
client=mongoose
async function run() {
  try {
    await client.connect();
    await client.db("zanderanja").command({ ping: 1 });
    console.log("Successfully pinged database. \nNow connected to the database");
    const userDataBase = mon.db('users');
    const mapDataBase = client.db('map');
  } catch (err) {
    console.log("Error with database connection");
  }
}

mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Include routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var regionRouter = require('./routes/regionRoutes');
var cityRouter = require('./routes/cityRoutes');
var districtRouter = require('./routes/districtRoutes');
var attractionRouter = require('./routes/attractionRoutes');

var app = express();

var cors = require('cors');
var allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = "The CORS policy does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoDB })
}));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/region', regionRouter);
app.use('/city', cityRouter);
app.use('/attraction', attractionRouter);
app.use('/district', districtRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
