    $(window.parent).ready(function () {
        $(window).ready(function () {
            //Global vars
            var friendId;
            var userid;
            var socket = io("/chat");

            //Init chat
            socket.emit('initChat', null, function (result) {
                console.log("init chat");
            });

            //Get userid and friendid
            $.get('/api/session', function (sess) {
                friendId = $(window.parent.location).attr('href').substring($(window.parent.location).attr('href').indexOf("/profile#") + "/profile#".length);
                userid = sess.user._id;
            });

            //Fired when 'send message' on a users profile is pressed
            window.parent.$('#sendMessage').click(function () {
                window.parent.$('#chatButton').hide();
                window.parent.$('#chat').animate({
                    height: "300px"
                }, 200);
                friendId = $(window.parent.location).attr('href').substring($(window.parent.location).attr('href').indexOf("/profile#") + "/profile#".length);
                $.get('/api/messages', {
                    uid1: userid,
                    uid2: friendId
                }, function (data) {
                    $('#messages').empty();
                    for (var i = 0; i < data.data[0].messages.length; i++) {
                        $('#messages').append($('<li>').text("[" + new Date(data.data[0].messages[i].date).toLocaleString() + "][" + data.data[0].messages[i].user + "] " + data.data[0].messages[i].message));
                    }
                    window.parent.$('#chatTop').html(friendId);
                    $('#m').val('');
                });
            });

            //Fired when enter in the chat window is pressed
            $('form').submit(function () {
                //Declare commands
                var cmdPm = "/pm";
                var cmdHelp = "/help";
                var cmdClear = "/clear";
                //Get input and split into args
                var input = $('#m').val();
                var str = input.split(" ");

                //Check for cmdPm
                if (str[0].indexOf(cmdPm) == 0) {
                    $('#messages').empty();
                    friendId = str[1];
                        $.get('/api/messages', {
                            uid1: userid,
                            uid2: friendId
                        }, function (data) {
                            if (data.data.length !== 0) {
                                for (var i = 0; i < data.data[0].messages.length; i++) {
                                    $('#messages').append($('<li>').text("[" + new Date(data.data[0].messages[i].date).toLocaleString() + "][" + data.data[0].messages[i].user + "] " + data.data[0].messages[i].message));
                                }
                            }
                            else {
                                $('#messages').append($('<li>').text("You have no chat history with " + friendId + ". Why not send a message?"));
                            }
                            window.parent.$('#chatTop').html(friendId);
                            $('#m').val('');
                        });
                }
                //Check for cmdHelp
                else if (str[0].indexOf(cmdHelp) == 0) {
                    var text = [];
                    text[0] = "-Help-";
                    text[1] = "Welcome to MUNSN's chat! To begin, either press the \"Send Message\" button on a user's profile page, or type /pm [userid] to start chatting.";
                    text[2] = "- /clear : Clears your chat messages.";
                    text[3] = "- /help : Display this help menu.";
                    text[4] = "- /pm [userid] : Private message the specified user id. Check the user's profile page URL to retrieve their id.";
                    for (var i = 0; i < text.length; i++) {
                        $('#messages').append($('<li>').text(text[i]));
                    }
                    $('#m').val('');
                }
                //Check for cmdClear
                else if (str[0].indexOf(cmdClear) == 0) {
                    $('#messages').empty();
                    $('#m').val('');
                }
                //Send a message to the current friend id
                else {
                    socket.emit('pm', friendId, $('#m').val());
                    $('#m').val('');
                }
                return false;
            });

            //Event handler
            socket.on('chat message', function (msg) {
                var count = 0;
                var sender = "";
                //Get the sender id
                for (var i = 0; i < msg.length; i++) {
                    if (msg[i] == "[" && count != 2) {
                        count++;
                    }
                    else if (msg[i] != "]" && count == 2) {
                        sender = sender.concat(msg[i]);
                    }
                    else if (msg[i] == "]" && count == 2) {
                        break;
                    }
                }
                //Handle front end user experience
                if (friendId == sender || userid == sender || msg == "User " + friendId + " does not exist") {
                    $('#messages').append($('<li>').text(msg));
                }
                else {
                    $('#messages').append($('<li>').text(msg.concat(": To reply to this message, type /pm " + sender)));
                }
            });

            //Reset input field
            $('#m').focus(function () {
                $('#m').val('');
            });
        });
    });