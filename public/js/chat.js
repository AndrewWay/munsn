$(function () {
    $('#m').val("Type in your username");
    var socket = io("/chat");
    var init = false;
    $('form').submit(function () {
        if (!init) {
            socket.emit('initChat', {
                _id: $('#m').val()
            });
            $('#m').val('');
            init = true;
        } else {
            var cmdName = "/name";
            var cmdRoom = "/room";
            var str = $('#m').val();
            if (str.indexOf(cmdRoom) != -1) {
                var room = str.substring(cmdRoom.length).trim();
                socket.emit('room', room, function (result) {
                    console.log(JSON.stringify(result));
                });
                $('#m').val('');
                console.log("ROOM: " + room);
            } else if (str.indexOf(cmdName) != -1) {
                var name = str.substring(cmdName.length).trim();
                socket.emit('name', name, function (result) {
                    console.log(JSON.stringify(result));
                });
                $('#m').val('');
                console.log("NAME: " + name);
            } else {
                socket.emit('chat message', str);
                $('#m').val('');
                console.log("MESSAGE: ");
            }
        }
        return false;
    });

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    $('#m').focus(function () {
        $('#m').val('');
    });
});