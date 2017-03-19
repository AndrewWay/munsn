var IO = require('../../bin/www');

var clients = [];
var nsChat = IO.of("/chat");

//User connects to server
nsChat.on('connection', function(socket) {
    var room = Math.floor((Math.random() * 10) + 1);
    clients.push({
        socket: socket,
        name: socket.id,
        room: room
    });
    console.log("[CHAT]: User with id " + socket.id + " connected to room " + room);
    console.log("[CHAT]: There are currently " + clients.length + " users");
    socket.join(room);
    //IO.emit('chat message', "User: " + socket.id + " has joined!");
    nsChat.in(room).emit('chat message', "Connected to room: " + room)

    //Name
    socket.on('name', function(data, callback) {
        console.log("NAME:" + data);
        var index = clientsIndexOf(socket);
        console.log("INDEX: " + index);
        if (index != -1) {
            clients[index].name = data;
            callback({status: "ok"});
        }
        else {
            callback({status: "fail"});
        }
    });

    //User disconnects
    socket.on('disconnect', function() {
        var index = clientsIndexOf(socket);
        if (index != -1) {
            console.log("[CHAT]: User with id " + socket.id + " disconnected");
            nsChat.emit('chat message', clients[index].name + " has left!");
            clients.splice(index, 1);
        }
    });

    //Chat message
    socket.on('chat message', function(msg){
        var name;
        var index = clientsIndexOf(socket);
        if (index != -1) {
            nsChat.in(clients[index].room).emit('chat message', clients[index].name + ": " + msg);
            //IO.emit('chat message', users[index].name + ": " + msg);
            console.log('[CHAT] ' + clients[index].name + ": " + msg);
        }
        else {
            nsChat.in(clients[index].room).emit('chat message', clients[index].name + ": " + msg);
            //IO.emit('chat message', socket.id + ": " + msg);
            console.log('[CHAT] ' + socket.id + ": " + msg);           
        }
    });
});

/**
 * Gets the index of users with a matching socket
 * 
 * @param {any} search - The search term
 * @returns - Index
 */
function clientsIndexOf(search) {
    return clients.map(function(e) {return e.socket;}).indexOf(search);
}