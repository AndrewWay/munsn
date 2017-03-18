var IO = require('../bin/www');

var users = [];

//User connects to server
IO.on('connection', function(socket) {
    users.push(socket);
    console.log("SOCKET.IO: User with id " + socket.id + " connected");
    console.log("SOCKET.IO: " + users.length);
    IO.emit('chat message', "User: " + socket.id + " has joined!");

    //User disconnects
    socket.on('disconnect', function() {
        var index = users.indexOf(socket);
        if (index != -1) {
            users.splice(index, 1);
            console.log("SOCKET.IO: User with id " + socket.id + " disconnected");
            IO.emit('chat message', "User: " + socket.id + " has left!");
        }
    });
    socket.on('chat message', function(msg){
        var name = users[users.indexOf(socket)].id;
        IO.emit('chat message', name + ": " + msg);
        console.log('message: ' + name + ": " + msg);
    });
});