var email = require('emailjs/email');
var http = require('http');
//The MUNSN email used to send emails to users
var emsSender = {
	name: 'Mun Social Network',
	address: 'munsocialnetwork@gmail.com',
	pass: 'comp4770'
};

//Email server information
var emsServer = email.server.connect({
	user: emsSender.address,
	password: emsSender.pass,
	host: 'smtp.gmail.com',
	ssl: true
});

/**
 * A generic Email function.
 * @param {object} email - A JSON object that has the fields: to, from, text, subject
 * @param {function} callback - A function that currently passes a string to log

 }} callback - Currently
 */
var sendEmail = function (email, callback) {
	emsServer.send({
			subject: email.subject,
			text: email.text,
			from: emsSender.name + '<' + emsSender.address + '>',
			to: email.to
			// cc:      "else <else@your-email.com>",
		},
		function (err, message) {
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
		from: emsSender.name + '<' + emsSender.address + '>',
		text: "Welcome to MUNSON! In order to continue using the site as a registered user," +
			" please confirm your registration by clicking the link: " +
			"http://" + process.env.IP + ":" + process.env.PORT + "/auth?key=" + auth.key +
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
		from: emsSender.name + '<' + emsSender.address + '>',
		text: "Looks like your old confirmation email expired. Here's a new one: http://" + process.env.IP + ":" + process.env.PORT + "/auth?key=" + auth.key
	};
	sendEmail(email, callback);
};

exports.sendEmail = sendEmail;
exports.sendAuthEmail = sendAuthEmail;
exports.resendAuthEmail = resendAuthEmail;