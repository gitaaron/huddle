define(['exports', 'jquery', '../lib/jquery/jquery.event.drag-1.5.min.js'], function(exports, $) {

    var curr_color, curr_size;

    exports.setUp = function(canvasPainter) {
        if(curr_color) canvasPainter.setColor(curr_color);
        if(curr_size) canvasPainter.setLineWidth(curr_size);
    }

    exports.init = function(canvasPainter) {

        var cWidth = 329;
        var cHeight = 348;
        var ctx, inner_ctx;


        var elem = document.getElementById('color_wheel_container');
        elem.addEventListener("touchstart", touchHandler, true);
        elem.addEventListener("touchmove", touchHandler, true);
        elem.addEventListener("touchend", touchHandler, true);
        elem.addEventListener("touchcancel", touchHandler, true); 

        // draw opaque overlay
        var opaque_ctx = document.getElementById('opaque_overlay').getContext('2d'); 
        opaque_ctx.clearRect(0, 0, 400, 400);
        opaque_ctx.beginPath();
        opaque_ctx.moveTo(190,200);
        opaque_ctx.scale(1.05,1);
        opaque_ctx.arc(190, 200, 150, Math.PI*2-9.5*Math.PI/6, Math.PI/6-9.5*Math.PI/6,  true);
        opaque_ctx.arc(190, 200, 165, Math.PI/6-9.5*Math.PI/6, Math.PI*2-9.5*Math.PI/6, true);
        opaque_ctx.fillStyle = 'rgba(1,1,1,0.2)';
        opaque_ctx.fill();
        opaque_ctx.closePath();
        

        $('#opaque_overlay').css('display','block');


        function touchHandler(event)
        {

            if(event.touches.length > 1) return;

            var touches = event.changedTouches,
                first = touches[0],
                type = "";
                 switch(event.type)
            {
                case "touchstart": type = "mousedown"; break;
                case "touchmove":  type="mousemove"; break;        
                case "touchend":   
                case "touchcancel":
                    type="mouseup"; break;
                default: return;
            }

            var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                      first.screenX, first.screenY, 
                                      first.clientX, first.clientY, false, 
                                      false, false, false, 0, null);

            first.target.dispatchEvent(simulatedEvent);
            event.preventDefault();
        }




        var third_radius = 132;
        var second_radius = 75; 
        var first_radius = 10;



        $(document).ready(function() {


            $('#inner_circle').css('display','block');
            $('#brush_background').attr('width', cWidth);
            $('#brush_background').attr('height', cHeight);
            $('#inner_circle_background').attr('width', cWidth);
            $('#inner_circle_background').attr('height', cHeight);
            $('#opaque_overlay').css('width', cWidth);
            $('#opaque_overlay').css('height', cHeight);

            $('#color_wheel').css('width', cWidth);
            $('#color_wheel').css('height', cHeight);



            $(document).bind('resizeColorWheel', function() {
                resizeColorWheel();
            });

            resizeColorWheel();
            newCircle(third_radius, 1);


        });



        function resizeColorWheel() {
            var handleWidth = $('#left_door_handle').width();
            var m_n = $('#main_slide');

            $('#color_wheel_container').css({'left':handleWidth, 'right':handleWidth, 'height':m_n.offset().top + m_n.height()});

            var cw = $('#color_wheel');

            var left = ($('#color_wheel_container').width() - $('#color_wheel').width())/2;
            $('#color_wheel').css('left', left);

            $('#color_wheel').css('top', ($('#color_wheel_container').height() - $('#color_wheel').height()+50)/2);

            ctx = document.getElementById('brush_background').getContext('2d'); 
            inner_ctx = document.getElementById('inner_circle_background').getContext('2d'); 


            $('#color_wheel').bind('mousedown', function(event) {
                var x = event.clientX - cw.offset().left - cw.width()/2;
                var y = event.clientY - cw.offset().top - cw.height()/2;
                newCircle(getRadius(x,y), getTheta(x,y));
            });

            $('#color_wheel').bind( 'drag', function( event ){
                var x = event.clientX - cw.offset().left - cw.width()/2;
                var y = event.clientY - cw.offset().top - cw.height()/2;
                newCircle(getRadius(x,y), getTheta(x,y));
            });



            $('.color_size').css('display','none');
            $('#color_size_'+curr_color.substring(1)).css('display','block');
            

        }

        function rgbToHex(R,G,B) {
            return toHex(R)+toHex(G)+toHex(B);
        }

        function toHex(n) {
            n = parseInt(n,10);
            if (isNaN(n)) return "00";
            n = Math.max(0,Math.min(n,255));
            return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
        }


        //var colors = ['rgb(175,214,117)','rgb(132,194,41)','rgb(23,144,184)','rgb(134,171,205)','rgb(163,144,193)','rgb(188,153,205)','rgb(188,113,128)','rgb(197,140,151)','rgb(248,102,5)','rgb(230,171,89)','rgb(227,196,89)','rgb(208,207,116)'];
        var colors = ['#AFD675','#84C229','#1790B8','#86ABCD','#A390C1','#BC99CD','#BC7180','#C58C97','#F86605','#E6AB59','#E3C459','#D0CF74'];
        curr_color = colors[0];
        curr_size = false;
        var sizes = [2, 1, -1, 11, 10, 9, 8, 7, 6, 5, 4, 3];

        function getColor(theta) {
            theta-=16;
            var seg_len = 360 / colors.length;
            var seg = Math.floor(theta / seg_len);

            if(seg < 0) {
                seg = colors.length-1;
            }
            return colors[seg];
        }

        function getSize(theta) {
            theta-=16;
            var seg_len = 360 / sizes.length;
            var seg = Math.floor(theta / seg_len);

            if(seg<0) {
                seg = sizes.length-1;
            }

            return sizes[seg];
        }

        var last_color;
        var from_eraser = false;
        function newCircle(radius, theta) {
            if(radius > second_radius) {
                var size = getSize(theta);

                if(size!=curr_size) {
                    $('.brush_size').css('display','none');
                    $('#brush_size_'+size).css('display','block');

                    if(size==-1) { 
                        $('#opaque_overlay').css('display','block');
                        if(curr_color!='rgba(0,0,0,0)') last_color = curr_color;
                        from_eraser = true;
                        drawCircle(8, 'rgba(0,0,0,0)');
                    } else {
                        if(from_eraser) {
                            curr_color = last_color;
                        }
                        from_eraser = false;
                        $('#opaque_overlay').css('display','none');
                        drawCircle(size, curr_color);
                    }
                }
            } else if (radius > first_radius) {
                var color = getColor(theta);
                if(curr_color!=color) {
                    $('.color_size').css('display','none');
                    $('#color_size_'+color.substring(1)).css('display','block');
                    drawCircle(curr_size, color);
                }
            }
        }

        function getRadius(x, y) {
            return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));     
        }

        function getTheta(x, y) {
            var theta = Math.atan(y/x) * 180 / Math.PI;
            if(x>=0 && y>=0) {
                return theta;
            } else if (y >=0 && x <=0) {
                return theta + 180;    
            } else if (y <=0 && x <=0) {
               return theta + 180; 
            } else {
                return theta + 360;
            }
            return theta;
        }



        function drawCircle(size, color) {

            curr_color = color;
            curr_size = size;
            ctx.clearRect(0, 0, cWidth, cHeight);
            ctx.beginPath();
            ctx.arc(cWidth/2, cHeight/2, 123, 0, Math.PI*2, true);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
            inner_ctx.clearRect(0, 0, cWidth, cHeight);
            inner_ctx.beginPath();
            inner_ctx.arc(cWidth/2, cHeight/2+5, size, 0, Math.PI*2, true);
            inner_ctx.fillStyle = color;
            inner_ctx.fill();
            inner_ctx.closePath();

            canvasPainter.setColor(color);
            canvasPainter.setLineWidth(size);

        }
    }
});
