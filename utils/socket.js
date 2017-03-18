var IO = require('../bin/www');

var users = [];

//User connects to server
IO.on('connection', function(socket) {
    users.push({
        socket: socket,
        name: socket.id
    });
    console.log("[CHAT]: User with id " + socket.id + " connected");
    console.log("[CHAT]: There are currently " + users.length + " users");
    IO.emit('chat message', "User: " + socket.id + " has joined!");

    //Name
    socket.on('name', function(data, callback) {
        console.log("NAME:" + data);
        var index = usersIndexOf(socket);
        console.log("INDEX: " + index);
        if (index != -1) {
            users[index].name = data;
            callback({status: "ok"});
        }
        else {
            callback({status: "fail"});
        }
    });

    //User disconnects
    socket.on('disconnect', function() {
        var index = usersIndexOf(socket);
        if (index != -1) {
            console.log("[CHAT]: User with id " + socket.id + " disconnected");
            IO.emit('chat message', users[index].name + " has left!");
            users.splice(index, 1);
        }
    });

    //Chat message
    socket.on('chat message', function(msg){
        var name;
        var index = usersIndexOf(socket);
        if (index != -1) {
            IO.emit('chat message', users[index].name + ": " + msg);
            console.log('[CHAT] ' + users[index].name + ": " + msg);
        }
        else {
            IO.emit('chat message', socket.id + ": " + msg);
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
function usersIndexOf(search) {
    return users.map(function(e) {return e.socket;}).indexOf(search);
}