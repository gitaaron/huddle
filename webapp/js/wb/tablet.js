define([], function() {


    function Tablet(color, windowWidth, windowHeight) {
        console.log('windowHeight: ' + windowHeight);
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        var div = $('<div></div>');
        div.css({
            'border':'thin solid ' + color,
            'width':windowWidth,
            'height':windowHeight,
            'position':'absolute',
            'top':0,
            'left':150
        });

        $('body').append(div);

        this.getPosition = function() {
            console.log('getPos');
            var left = div.css('left');
            left = parseInt(left.substring(0, left.length-2));
            var top = div.css('top');
            top = parseInt(top.substring(0, top.length-2));

            return {
                x:left,
                y:top
            };
        }

    }

    return Tablet;

});
