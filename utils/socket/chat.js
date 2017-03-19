var IO = require('../../bin/www');

var clients = [];
var nsChat = IO.of("/chat");

//TODO: Document all this, add error handling

//User connects to server
nsChat.on('connection', function(socket) {
    clients.push({
        socket: socket,
        name: socket.id
    });
    console.log("[CHAT]: User with id " + socket.id + " connected");
    console.log("[CHAT]: There are currently " + clients.length + " users");
    nsChat.emit('chat message', "User: " + socket.id + " has joined!");

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
            nsChat.emit('chat message', clients[index].name + ": " + msg);
            console.log('[CHAT] ' + clients[index].name + ": " + msg);
        }
        else {
            nsChat.emit('chat message', socket.id + ": " + msg);
            console.log('[CHAT] ' + socket.id + ": " + msg);           
        }
    });
});

/**
 * Gets the index of clients with a matching socket
 * 
 * @param {any} search - The search term
 * @returns - Index
 */
function clientsIndexOf(search) {
    return clients.map(function(e) {return e.socket;}).indexOf(search);
}