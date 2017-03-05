var email   = require("emailjs/email");

//Sender details
var emsSender = {
    name: "Mun Social Network",
    address: "munsocialnetwork@gmail.com",
    pass: "comp4770"
};

//Server details
var emsServer  = email.server.connect({
   user:    sender.address, 
   password: sender.pass, 
   host:    "smtp.gmail.com", 
   ssl:     true
});

//Send a general email
exports.sendEmail = function(email, callback) {
    emsServer.send({
        subject: email.subject,
        text:    email.text, 
        from:    emsSender.name + "<" + emsSender.address + ">", 
        to:      email.to
       // cc:      "else <else@your-email.com>",
    }, function(err, message) { console.log(err || message); });
    callback("Email Sent!");
};

//Send a confirmation email
exports.sendConfirmationEmail = function(user, authkey, callback) {
    emsServer.send({
        subject: "MUNSON - Confirmation Email",
        to: user.email,
        from: emsSender.name + "<" + emsSender.address + ">",
        text: "Welcome to MUNSON! In order to continue using the site as a registered user, please confirm your registration by clicking the link: " +
                "http://localhost:3000/auth?key=" + authkey + ". We are glad you can join us! Once registered you can fully access the website!"
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(message);
        }
        callback("[EMS] sent email! ");
    });
};

//Send a confirmation email
exports.sendAdditionalConfirmationEmail = function(user, authkey, callback) {
    emsServer.send({
        subject: "MUNSON - Confirmation Email",
        to: user.email,
        from: emsSender.name + "<" + emsSender.address + ">",
        text: "Looks like your old confirmation email expired. Here's a new one: http://localhost:3000/auth?key=" + authkey
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(message);
        }
        callback("[EMS] sent email! ");
    });
};

