var http = require('http')
    , express = require('express');


var app = express();

app.configure(function() {
    app.use(express.static(__dirname+'/../webapp'));
});

app.listen(8080);
console.log('listening on 8080...');

var io = io.listen(app)
    , buffer = [];


io.sockets.on('connection', function(client) {

    client.send(JSON.stringify({buffer:buffer}));
    client.on('message', function(message) {
        console.log('message : '+message);
    });

});
