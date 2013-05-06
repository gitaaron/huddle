require.config({
    baseUrl:'js/',
    paths:{
        jquery:'../libs/jquery-1.8.2.min',
        'socket.io':'/socket.io/socket.io',
        'jquery.drag':'../libs/jquery.event.drag-2.2'
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

require(['jquery', 'wb/main', 'controller', 'chrome'], function($, wb_main, controller) {

    var wb = new wb_main('canvas', 'canvasInterface');

    wb.network.announceTabletConnect();

    var c = new controller(wb.network);

});
