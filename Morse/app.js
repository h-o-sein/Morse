// Morse Platform Chat || Creator : Hosein Enjoo
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('listening on *:'+ port);
});

//Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
var numUsers = 0;

io.on('connection', function (socket) {
    //console.log('a user connected');
    var addedUser = false;


    ++numUsers;

    socket.broadcast.emit('OnlineUser', numUsers/2);



    socket.on('new message', function (msg) {
      // console.log('msg: ' + msg);
       socket.broadcast.emit('new message', {
           username: socket.username,
           message: msg
       });
    });

    socket.on('add user', function (username) {
      // console.log('add User -> username: '+ username);
       if (addedUser) return;

       socket.username = username;
       //++numUsers;
       addedUser = true;

       socket.emit('login', {
           numUsers: numUsers
       });

       socket.broadcast.emit('user joined', {
           username: socket.username,
           numUsers: numUsers
       });

        socket.broadcast.emit('OnlineUser', numUsers/2);
    });

    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('disconnect', function () {
       // console.log('disconnect');
        --numUsers;

        if (addedUser) {


            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }

        socket.broadcast.emit('OnlineUser', numUsers/2);
    });
});

