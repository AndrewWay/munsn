function initChat(initData) {
    console.log("INIT CHAT: DATA " + initData);
    var user = initData.session.user;
    var socket = io("/chat");

    socket.emit('initChat', user);

    $('form').submit(function () {
        var cmdName = "/name";
        var cmdRoom = "/room";
        var str = $('#m').val();
        //var index = str.indexOf(cmdName);
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
        return false;
    });

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });
};