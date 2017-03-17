var IO = require('../bin/www');

IO.on('connection', function() {
    console.log("SOCKET.IO: Connected");
});