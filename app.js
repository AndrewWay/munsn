var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var db = require('./utils/db');
var ems = require('./utils/ems');
var busboy = require('connect-busboy');

//Routes
var routerIndex = require('./routes/index');
var routerApi = require('./routes/api');
var routerAuth = require('./routes/auth');
var routerTest = require('./routes/test');
var routerProfile = require('./routes/profile');
var routerGroup = require('./routes/group');
var routerSchedule = require('./routes/schedule');
var routerSettings = require('./routes/settings');
var routerContent = require('./routes/content');
var routerResume = require('./routes/resume');
var routerLostFound = require('./routes/lostfound');

//Beyond this point is all the code needed to start the server.
var app = express();

//Busboy used for file uploading to the server
app.use(busboy());
app.use(
	session({
		secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
		proxy: true,
		resave: true,
		saveUninitialized: false,
		cookie: {
			path: '/',
			httpOnly: true,
			maxAge: 60000
		},
		unset: 'destroy',
		rolling: true,
		store: new MongoStore({
			url: db.DB_URL
		})
	})
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(cookieParser());
//Public folder accessible everywhere
app.use(express.static(path.join(__dirname, 'public')));
//Index Page
app.use('/', routerIndex);
//API Calls
app.use('/api', routerApi);
//Auth Server
app.use('/auth', routerAuth);
//Content server
app.use('/content', routerContent);
//Profile pages
app.use('/profile', routerProfile);
//Profile pages
app.use('/group', routerGroup);
//Profile pages
app.use('/schedule', routerSchedule);
//Profile pages
app.use('/settings', routerSettings);
//Resume pages
app.use('/resume', routerResume);
//Lost&Found pages
app.use('/lostfound', routerLostFound)
//Test
app.use('/test', routerTest);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
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