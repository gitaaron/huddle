var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
    , io = require('socket.io').listen(server);

server.listen(8080);
console.log('listening on 8080...');

app.configure(function() {
    app.use(express.static(__dirname+'/../webapp'));
});

io.sockets.on('connection', function (socket) {
    buffer = [];
    socket.emit('news', { hello: 'world' });
    socket.on('message', function(data) {
        console.log('message');
        message = JSON.parse(data);
        var msg = { command: message.command };
        buffer.push(msg);
        if (buffer.length > 20) buffer.shift();
        console.log('sending : ' + JSON.stringify(msg));
        socket.broadcast.send(JSON.stringify(msg));
    });
    socket.on('my other event', function (data) {
        console.log(data);
        socket.broadcast.emit('my other event', data);
    });



});
