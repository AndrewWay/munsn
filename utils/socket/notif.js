var IO = require('../../bin/www');
var console = require('../consoleLogger');
var clients = [];
var nsNotif = IO.of("/notif");

nsNotif.on('connection', function (socket) {

    //TODO: Just copied code from /chat
    clients.push({
        socket: socket,
        name: socket.id
    });
    console.log("[CHAT]", "'Connected'->'{ id:'" + socket.id + "'}'");
    console.log("[CHAT]", "'# Of Clients'->'" + clients.length + "'");
    nsChat.emit('chat message', "User: " + socket.id + " has joined!");
});