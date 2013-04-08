var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
    , io = require('socket.io').listen(server);

server.listen(8080);
console.log('listening on 8080...');

app.configure(function() {
    app.use(express.static(__dirname+'/../webapp'));
});

var screen;

io.sockets.on('connection', function (socket) {
    console.log('client connected');
    buffer = [];
    socket.on('command', function(data) {
        message = JSON.parse(data);
        var msg = { command: message };
        buffer.push(msg);
        if (buffer.length > 20) buffer.shift();
        socket.broadcast.send(JSON.stringify(msg));
    });
    socket.on('tablet_connect', function (data) {
        if(screen) screen.emit('tablet_connect', data);
        else console.log('no screen to tell');
    });

    socket.on('tablet_event', function(data) {
        if(screen) screen.emit('tablet_event', data);
        else console.log('no screen to tell');
    });

    socket.on('screen_connect', function(data) {
        screen = socket;
    });

    socket.on('disconnect', function() {
        if(screen) screen.emit('tablet_disconnect', {sessionid:socket.store.id});
        else console.log('no screen to tell');
    });



});
