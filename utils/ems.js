var email   = require("emailjs/email");

//Sender details
var emsSender = {
    name: "Mun Social Network",
    address: "munsocialnetwork@gmail.com",
    pass: "comp4770"
};

//Server details
var emsServer  = email.server.connect({
   user:    emsSender.address,
   password: emsSender.pass,
   host:    "smtp.gmail.com",
   ssl:     true
});

//Send a general email
var sendEmail = function(email, callback) {
    emsServer.send({
        subject: email.subject,
        text:    email.text,
        from:    emsSender.name + "<" + emsSender.address + ">",
        to:      email.to
       // cc:      "else <else@your-email.com>",
    }, function(err, message) {
        callback(err ? "[EMS] " + err : "[EMS] Sent Email To: "+ email.to +"\n[EMS] Subject: " + email.subject);
    });
};

//Send a confirmation email
var sendAuthEmail = function(user, authkey, callback) {
    var email ={
        subject: "MUNSON - Confirmation Email",
        to: user.email,
        from: emsSender.name + "<" + emsSender.address + ">",
        text: "Welcome to MUNSON! In order to continue using the site as a registered user, please confirm your registration by clicking the link: " +
                "http://localhost:3000/auth?key=" + authkey + ". We are glad you can join us! Once registered you can fully access the website!"
    };
    sendEmail(email,callback);
};

//Send a confirmation email
var resendAuthEmail = function(user, authkey, callback) {
    var email = {
        subject: "MUNSON - Confirmation Email",
        to: user.email,
        from: emsSender.name + "<" + emsSender.address + ">",
        text: "Looks like your old confirmation email expired. Here's a new one: http://localhost:3000/auth?key=" + authkey
    };
    sendEmail(email,callback);
};

exports.sendEmail = sendEmail;
exports.sendAuthEmail = sendAuthEmail;
exports.resendAuthEmail = resendAuthEmail;