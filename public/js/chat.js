$(function () {
    var currentRoom;
    var socket = io("/chat");
    //Init chat
    socket.emit('initChat', null, function(result) {
        currentRoom = result;
	});
    console.log("init chat");
    //Fired when enter is pressed
    $('form').submit(function () {
        //Declare commands
        var cmdName = "/name";
        var cmdRoom = "/room";
        var cmdPm = "/pm";
        //Get input and split into args
        var input = $('#m').val();
        var str = input.split(" ");
        //Check for cmdRoom
        if (str[0].indexOf(cmdRoom) == 0) {
            var room = str[0].substring(cmdRoom.length).trim();
            socket.emit('room', room, function (result) {
                currentRoom = result;
                console.log(JSON.stringify(result));
            });
            $('#m').val('');
            console.log("ROOM: " + room);
        }
        //Check for cmdName
        else if (str[0].indexOf(cmdName) == 0) {
            var name = str[0].substring(cmdName.length).trim();
            socket.emit('name', name, function (result) {
                console.log(JSON.stringify(result));
            });
            $('#m').val('');
            console.log("NAME: " + name);
        }
        //Check for cmdPm
        else if (str[0].indexOf(cmdPm) == 0) {
            var user = str[1];
            var msg = "";
            for (var i = 2; i < str.length; i++) {
                msg = msg + str[i] + " ";
            }
            socket.emit('pm', user, msg);
            $('#m').val('');
            console.log("PM: USER " + user + ", MSG: " + msg);
        }
        //Else send message to current room
        else {
            socket.emit('chat message', currentRoom, str[0]);
            $('#m').val('');
            console.log("MESSAGE: " + str[0]);
        } 
        return false;
    });

    //Event handler
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    //Reset input field
    $('#m').focus(function() {
        $('#m').val('');
    });
});