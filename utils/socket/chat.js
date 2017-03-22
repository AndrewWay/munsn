var IO = require('../../bin/www');
var app = require('../../app');

var clients = [];
var nsChat = IO.of("/chat").use(IO.sharedsession(app.session, {
    autoSave: true
}));

//SESSIONS:
//socket.handshake.session

//User connects to server
nsChat.on('connection', function (socket) {

    //Init chat event
    socket.on('initChat', function (data, callback) {
        console.log("session user " + JSON.stringify(socket.handshake.session.user));
        var user = socket.handshake.session.user;
        socket.handshake.session.socketid = socket.id;
        var index = clientsIndexOf(socket);
        console.log("USER " + JSON.stringify(user));
        var room = Math.floor((Math.random() * 10) + 1);
        var name = socket.id;
        if (user) name = user._id;
        var client = {
            socket: socket,
            name: name,
            room: room
        };
        socket.handshake.session.room = room;
        console.log("USER " + JSON.stringify(socket.handshake.session));
        clients.push(client);
        console.log("[CHAT][ROOM " + client.room + "][" + client.name + "][ID " + client.socket.id + "] Connected!");
        socket.join(client.room);
        nsChat.in(room).emit('chat message', "[ROOM " + client.room + "] " + client.name + " Connected!");
    });

    //Name
    socket.on('name', function (data, callback) {
        console.log("NAME:" + data);
        var index = clientsIndexOf(socket);
        console.log("INDEX: " + index);
        if (index != -1) {
            clients[index].name = data;
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "fail"
            });
        }
    });

    //Room
    socket.on('room', function (data, callback) {
        console.log("ROOM:" + data);
        var index = clientsIndexOf(socket);
        console.log("INDEX: " + index);
        if (index != -1) {
            socket.leave(clients[index].room);
            socket.join(data);
            clients[index].room = data;
            callback({
                status: "ok"
            });
        } else {
            callback({
                status: "fail"
            });
        }
    });

    //User disconnects
    socket.on('disconnect', function () {
        var index = clientsIndexOf(socket);
        if (index != -1) {
            console.log("[CHAT]: User with id " + socket.id + " disconnected");
            nsChat.emit('chat message', clients[index].name + " has left!");
            clients.splice(index, 1);
        }
    });

    //Chat message
    //TODO: cleanup
    socket.on('chat message', function (msg) {
        var name;
        var index = clientsIndexOf(socket);
        if (index != -1) {
            nsChat.in(clients[index].room).emit('chat message', "[ROOM " + clients[index].room + "] " + clients[index].name + ": " + msg);
            //IO.emit('chat message', users[index].name + ": " + msg);
            console.log("[CHAT][ROOM " + clients[index].room + "] " + clients[index].name + ": " + msg);
        } else {
            nsChat.in(clients[index].room).emit('chat message', "[ROOM " + clients[index].room + "] " + clients[index].name + ": " + msg);
            //IO.emit('chat message', socket.id + ": " + msg);
            console.log("[CHAT][ROOM " + clients[index].room + "] " + clients[index].name + ": " + msg);
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
    return clients.map(function (e) {
        return e.socket;
    }).indexOf(search);
}