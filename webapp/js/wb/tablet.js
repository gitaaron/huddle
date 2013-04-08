var g_options;
define([], function() {

    var counter = 0;
    function touchHandler(event)
    {
        if(counter < 20) {
            counter++;
            return;
        } else {
            counter = 0;
        }
        var touches = event.changedTouches,
            first = touches[0],
            type = "";
             switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type="mousemove"; break;        
            case "touchend":   type="mouseup"; break;
            case "touchcancel": type:"mouseup"; break;
            default: return;
        }

                 //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
        //           screenX, screenY, clientX, clientY, ctrlKey, 
        //           altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }

    function init() 
    {
        document.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        document.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);    
    }


    function Tablet(color, windowWidth, windowHeight) {
        windowWidth = windowWidth/2;
        windowHeight = windowHeight/2;
        init();
        
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

        this.getWidth = function() {
            return div.width();
        }

        this.getHeight = function() {
            return div.height();
        }

        var   origWidth = div.width()
            , origHeight = div.height();


        var stroke = 5;

        this.receiveEvent = function(options) {
            if(options.type==='start') {
                origWidth = div.width();
                origHeight = div.height();
                this.startPosition = this.getPosition();
            } else if(options.type==='zoom') {
                var lastWidth = div.width();
                var lastHeight = div.height();
                var width = origWidth * options.data.scale;
                var height = origHeight * options.data.scale;
                width = (width<30 || height < 30)?lastWidth:width;
                height = (width<30 || height < 30)?lastHeight:height;
                var newStroke = Math.ceil(width / 100);
                if(newStroke!==stroke) {
                    stroke = newStroke;
                    $(document).trigger('set_line_width', {stroke:stroke});
                }

                div.css('width', width);
                div.css('height', height);
            } else  {
                var newLeft = this.startPosition.x - options.data.coords.x;
                var newTop = this.startPosition.y - options.data.coords.y;
                div.css({
                    left:newLeft,
                    top:newTop
                });
            }

        }

    }

    return Tablet;

});
