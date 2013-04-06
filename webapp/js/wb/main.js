define(['exports', 'wb/painter', 'wb/drawing', 'wb/resizer', 'wb/network'], function(exports, painter, drawing, resizer, network) {

    return function(canvasName, canvasInterfaceName) {
            var canvasPainter = new painter.CanvasPainter(canvasName, canvasInterfaceName);
            var saveDrawing = new drawing.SaveDrawing(canvasPainter);
            var cn = new network.Network(canvasPainter, saveDrawing);
            $('.'+canvasName).attr({
                'width':$(window).width(),
                'height':$(window).height()
            });
            $('.'+canvasInterfaceName).attr({
                'width':$(window).width(),
                'height':$(window).height()
            });

            resizer.startListener(canvasPainter, saveDrawing);

        this.canvasPainter = canvasPainter;

        /*
        $('.canvas').bind('wasResized', function() {
            canvasPainter.updateSize();
            saveDrawing.rescaleNodes();
            saveDrawing.paintDrawing();
        });
        $('#resizer').bind('click', function(e) {

            canvasPainter.updateSize();
            saveDrawing.rescaleNodes();
            saveDrawing.paintDrawing();
        });
        */

        this.clear = function() {
            canvasPainter.clear(); 
        }


    }

});
