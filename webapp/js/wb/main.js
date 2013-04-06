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
            canvasPainter.setLineWidth(5);
            canvasPainter.setColor('rgba(255,0,0,0.8)');
        this.canvasPainter = canvasPainter;

        this.clear = function() {
            canvasPainter.clear(); 
        }


    }

});
