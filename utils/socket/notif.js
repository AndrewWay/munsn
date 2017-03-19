var IO = require('../../bin/www');

var clients = [];
var nsNotif= IO.of("/notif");

nsNotif.on('connection', function(socket) {

    //TODO: Just copied code from /chat
    clients.push({
        socket: socket,
        name: socket.id
    });
    console.log("[CHAT]: User with id " + socket.id + " connected");
    console.log("[CHAT]: There are currently " + clients.length + " users");
    nsChat.emit('chat message', "User: " + socket.id + " has joined!");
});