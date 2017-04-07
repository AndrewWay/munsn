var gmail = require('gmail-node');
var console = require("./consoleLogger");
var secret = {
	"installed": {
		"client_id": "672643482220-taibebmg10ikevps3qov5hcsc5kp45bt.apps.googleusercontent.com",
		"project_id": "munsn-163319",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://accounts.google.com/o/oauth2/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_secret": "Am1uhXjy7eGYyfUNTJwt08DL",
		"redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
	}
};
gmail.init(secret, require('path').join(__dirname, '../.credentials/gmail_creds.json'), function (err, result) {
	console.log("[EMS]", result);
});
var http = require('http');
//The MUNSN email used to send emails to users

/**
 * A generic Email function.
 * @param {object} email - A JSON object that has the fields: to, from, text, subject
 * @param {function} callback - A function that currently passes a string to log

 }} callback - Currently
 */
var sendEmail = function (email, callback) {
	gmail.send({
			subject: email.subject,
			message: email.text,
			to: email.to
			// cc:      "else <else@your-email.com>",
		},
		function (err, message) {
			message.subject = email.subject;
			message.to = email.to;
			callback(err, message);
		}
	);
};

/**
 * Sends an authorization email to the user object passed to this function
 * @param {object} user - The row containing the user information from the database
 * @param {string} authkey - The authorization key sent to the user
 * @param {function} callback - A function that currently passes a string to log
 */
var sendAuthEmail = function (auth, callback) {
	var email = {
		subject: 'MUNSON - Confirmation Email',
		to: auth.userid + '@mun.ca',
		text: "Welcome to MUNSON! In order to continue using the site as a registered user," +
			" please confirm your registration by clicking the link: " +
			"http://" + process.env.ADDRESS + "/auth?key=" + auth.key +
			"\nWe are glad you can join us! Once registered you can fully access the website!"
	};
	sendEmail(email, callback);
};

/**
 * Resends an authorization email to the user object passed to this function
 * @param {object} user - The row containing the user information from the database
 * @param {string} authkey - The authorization key sent to the user
 * @param {function} callback - A function that currently passes a string to log
 */
var resendAuthEmail = function (auth, callback) {
	var email = {
		subject: 'MUNSON - Confirmation Email',
		to: auth.userid + '@mun.ca',
		text: "Looks like your old confirmation email expired. Here's a new one: http://" + process.env.ADDRESS + "/auth?key=" + auth.key
	};
	sendEmail(email, callback);
};

exports.sendEmail = sendEmail;
exports.sendAuthEmail = sendAuthEmail;
exports.resendAuthEmail = resendAuthEmail;