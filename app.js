var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoClient = require('mongodb').MongoClient,
	assert = require('assert');
var dbURL = 'mongodb://localhost:27017/db';

mongoClient.connect(dbURL, function(err, db) {
	assert.equal(null, err);
	console.log("Connected to mongo server");
	insertDocuments(db, function() {
		findDocuments(db, function() {
			db.close();
		});
	});
});

var insertDocuments = function(db, callback) {
	// Get the documents collection
	var collection = db.collection('testdb');
	// Insert some documents
	collection.insertMany([{
			a: 1
		},
		{
			a: 2
		},
		{
			a: 3
		}
	], function(err, result) {
		assert.equal(err, null);
		assert.equal(3, result.result.n);
		assert.equal(3, result.ops.length);
		console.log("Inserted 3 documents into the collection");
		callback(result);
	});
};

var findDocuments = function(db, callback) {
	// Get the documents collection
	var collection = db.collection('testC');
	// Find some documents
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		console.log(docs)
		callback(docs);
	});
};

var index = require('./routes/index');
var users = require('./routes/users');


var app = express();

app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	store: new mongoStore({ url: dbURL })
	})
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

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