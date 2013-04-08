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

            elem.drag(function(ev, dd) {
                console.log('deltaX : ' + dd.deltaX + ' offsetX : ' + dd.offsetX);
                network.tabletEvent('move', {x:dd.deltaX, y:dd.deltaY});
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

        });
    }

    return Controller;

});
