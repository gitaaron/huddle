define(['exports', 'jquery'], function(exports, $) {


    exports.startListener = function(canvasPainter, saveDrawing) {

        var lastTime;
        var lastResizeTime = new Date();

        $(canvasPainter.canvas).bind('wasResized', function(e) {
            lastTime = new Date();
            setTimeout(function() {

                var currTime = new Date();
                var diff = currTime - lastTime;
                var diff2 = currTime - lastResizeTime;
                console.log('diff : ' + diff + ' diff2 : ' + diff2);
                
                if(diff > 495 && diff2 > 100) { // do something
                    lastResizeTime = new Date();
                    console.log('wasResized : ' + lastTime);
                    canvasPainter.updateSize();
                    saveDrawing.rescaleNodes();
                    saveDrawing.paintDrawing();
                }
            }, 500);

        }); 
    }

});
