var g_e;
define(['jquery.drag'], function(drag) {

    function Controller(network) {
        var self = this;
        this.network = network;
        this.mouseDown = false;
        

        
        $(function() {

            var elem = $('.controller');

            elem.bind('mousedown', function() {
                console.log('start');
                network.tabletEvent('start', {x:0, y:0});
                $(document).trigger('clear_canvas');
            });

            if('ontouchstart' in document.documentElement) document.getElementById('controller').addEventListener('touchstart', function() {
                console.log('touchstart');
                $(document).trigger('clear_canvas');
                network.tabletEvent('start', {x:0, y:0});
            }, false);

            var isPinching = false;

            elem.drag(function(ev, dd) {

                if(!isPinching) {
                    console.log('deltaX : ' + dd.deltaX + ' offsetX : ' + dd.offsetX);
                    network.tabletEvent('move', {coords:{x:dd.deltaX, y:dd.deltaY}});
                }
            });

            var toggler = $('#toggler');
            toggler.bind('click', function() {
                elem.toggle(); 
                if(elem.is(':visible')) {
                    console.log('toggler white');
                    toggler.css('background', 'white');
                } else {
                    console.log('toggler none');
                    toggler.css('background-color', 'rgba(0,0,0,0)');
                }
            });

            document.getElementById('controller').addEventListener('gesturestart', function(e) {
                console.log('gesturestart');
                isPinching = true;
            });

            document.getElementById('controller').addEventListener('gestureend', function(e) {
                console.log('gestureend');
                isPinching = false;
            });

            document.getElementById('controller').addEventListener('gesturechange', function(e) {
                //console.log('e.scale : ' + e.scale);
                network.tabletEvent('zoom', {scale:e.scale});
            }, false);

        });
    }

    return Controller;

});
