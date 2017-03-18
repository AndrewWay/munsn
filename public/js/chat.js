$(function () {
    var socket = io();
    $('form').submit(function(){
        var cmdName = "/name";
        var str = $('#m').val();
        var index = str.indexOf(cmdName);
        console.log("INDEX: " + index);
        if (index == -1) {
            socket.emit('chat message', str);
            $('#m').val('');
            console.log("MESSAGE: ");
        }
        else {
            var name = str.substring(cmdName.length).trim();
            socket.emit('name', name, function(result) {
                console.log(JSON.stringify(result));
            });
            $('#m').val('');
            console.log("NAME: " + name);
        }
        return false;
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});