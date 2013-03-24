var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
    , io = require('socket.io').listen(server);

server.listen(8080);

app.configure(function() {
    app.use(express.static(__dirname+'/../webapp'));
});

io.sockets.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
                console.log(data);
                  });
});