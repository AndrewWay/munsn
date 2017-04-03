$(function () {
    var currentRoom;
    var socket = io("http://sc-6.cs.mun.ca");
    //Init chat
    socket.emit('initChat', null, function(result) {
        console.log("init chat");
        currentRoom = result;
        //TODO: GET THIS WORKING
        /*
        $.get('/api/messages', {uid1: 'dfcm15', uid2: 'bro'}, function(data) {
            console.log(JSON.stringify(data));
            for (var i = 0; i < data.data[0].messages.length; i++) {
                $('#messages').append($('<li>').text("[PM: " + data.data[0].messages[i].user + "] " + data.data[0].messages[i].message));
                console.log("LOADING MESSAGES: " + i + ": " + data.data[0].messages[i].message);
            }
        $('#m').val('');         
    });
    */
	});
    //Fired when enter is pressed
    $('form').submit(function () {
        //Declare commands
        var cmdName = "/name";
        var cmdRoom = "/room";
        var cmdPm = "/pm";
        var cmdLoad = "/load"; //TODO: just a test, not gonna be here for final project
        //Get input and split into args
        var input = $('#m').val();
        var str = input.split(" ");
        //Check for cmdRoom
        if (str[0].indexOf(cmdRoom) == 0) {
            var room = str[1];
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
        else if (str[0].indexOf(cmdLoad) == 0 ) {
            var user = str[1];
            $.get('/api/messages', {uid1: 'dfcm15', uid2: user}, function(data) {
                console.log(JSON.stringify(data));
                for (var i = 0; i < data.data[0].messages.length; i++) {
                    $('#messages').append($('<li>').text("[PM: " + data.data[0].messages[i].user + "] " + data.data[0].messages[i].message));
                    console.log("LOADING MESSAGES: " + i + ": " + data.data[0].messages[i].message);
                }
            $('#m').val('');         
            });
        }
        //Else send message to current room
        else {
            var msg = "";
            for (var i = 0; i < str.length; i++) {
                msg = msg + str[i] + " ";
            }
            socket.emit('chat message', currentRoom, msg);
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