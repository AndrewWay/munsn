var email   = require("emailjs/email");

var sender = {
    name: "Mun Social Network",
    address: "munsocialnetwork@gmail.com",
    pass: "comp4770"
};

var server  = email.server.connect({
   user:    sender.address, 
   password: sender.pass, 
   host:    "smtp.gmail.com", 
   ssl:     true
});

exports.sendEmail = function(email, callback){
// send the message and get a callback with an error or details of the message that was sent
    server.send({
        text:    email.text, 
        from:    sender.name + "<" + sender.address + ">", 
        to:      email.to,
       // cc:      "else <else@your-email.com>",
        subject: email.subject
    }, function(err, message) { console.log(err || message); });
    callback("Email Sent!");
};
