var IO = require('../../bin/www');
var app = require('../../app');
var DB = require('../db');
var console = require('../consoleLogger');
var nsChat = IO.of("/chat").use(IO.sharedsession(app.session, {
    autoSave: true
}));

//SESSIONS:
//socket.handshake.session

//User connects to server
nsChat.on('connection', function (socket) {

    //Init chat event
    socket.on('initChat', function (data, callback) {
        //Get session
        var session = socket.handshake.session;
        if (session && session.user) {
            DB.Socket.findAndUpdate(session.user._id, socket.id, function (err, result) {
                if (err) {
                    console.error("[DBSocket] Update", err.message);
                    callback({
                        session: session,
                        status: 'fail'
                    });
                } else {
                    //Set random room
                    var room = Math.floor((Math.random() * 10) + 1);
                    //Print to console and chat room
                    console.log("[CHAT][DEBUG?]", result);
                    console.log("[CHAT][ROOM " + room + "][" + result.value._id + "]", "'Connected'->'{socketid:'" + result.value.socketid + "'}'");
                    socket.join(room);
                    nsChat.in(room).emit('chat message', "[ROOM " + room + "] " + result.value._id + " Connected!");
                    callback(room);
                }
            });
        }
    });

    //Room
    socket.on('room', function (data, callback) {
        socket.join(data);
        nsChat.in(data).emit('chat message', "[ROOM " + data + "] " + socket.id + " Connected!");
        console.log("[CHAT][Room]", "'" + socket.id + "'->'Room [" + data + "]'");
        callback(data);
    });

    //PM
    //TODO: Gonna be the main way to chat
    socket.on('pm', function (user, msg) {
        //Uid is reciever
        //Sid is sender
        DB.Socket.findUid(user, function (userErr, uidResult) {
            if (userErr || !uidResult) {
                nsChat.to(socket.id).emit('chat message', "User " + user + " does not exist");
            }
            else {
                console.log("[Message]", "'" + msg + "'->'" + user + "'");
                console.log("[Socket] FindUid->Result", JSON.stringify(uidResult));
                DB.Socket.findSid(socket.id, function (sidError, sidResult) {
                    nsChat.to(uidResult.socketid).emit('chat message', "[PM: " + sidResult._id + "] " + msg);
                    nsChat.to(sidResult.socketid).emit('chat message', "[PM: " + sidResult._id + "] " + msg);
                    DB.Socket.saveMessage(sidResult._id, uidResult._id, msg, function(err, saveResult) {
                        //TODO: Write stuff here
                    });
                });
            }
        });
    });
/*
    //User disconnects
    socket.on('disconnect', function () {
        var index = clientsIndexOf(socket);
        if (index != -1) {
            console.log("[CHAT]: User with id " + socket.id + " disconnected");
            nsChat.emit('chat message', clients[index].name + " has left!");
            clients.splice(index, 1);
        }
    });
    */

    //Chat message
    //TODO: cleanup
    socket.on('chat message', function (room, msg) {
        DB.Socket.findSid(socket.id, function (err, result) {
            if (err) {
                console.error("[Socket]", err);
            } else {
                console.log("[CHAT][MESSAGE]", JSON.stringify(result));
                nsChat.in(room).emit('chat message', "[ROOM " + room + "] " + result._id + ": " + msg);
            }
        });
    });
});