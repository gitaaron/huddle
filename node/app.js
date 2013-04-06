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
        console.log('message');
        message = JSON.parse(data);
        var msg = { command: message };
        buffer.push(msg);
        if (buffer.length > 20) buffer.shift();
        console.log('sending : ' + JSON.stringify(msg));
        socket.broadcast.send(JSON.stringify(msg));
    });
    socket.on('tablet_connect', function (data) {
        console.log('tablet_connect : ' +JSON.stringify(data));

        exports.socket = socket;
        if(screen) screen.emit('tablet_connect', data);
        else console.log('no screen to tell');
    });

    socket.on('screen_connect', function(data) {
        console.log('screen_connect');
        screen = socket;
    });



});
