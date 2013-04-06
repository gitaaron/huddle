require.config({
    baseUrl:'js/',
    paths:{
        jquery:'../libs/jquery-1.8.2.min',
        'socket.io':'/socket.io/socket.io'
    },

    shim:{
        "jquery":{
            exports:"jQuery"
        },
        "socket.io":{
            exports:"socket"
        }
    }

});

require(['jquery', 'wb/main'], function($, wb_main) {

    new wb_main('canvas', 'canvasInterface');

});
