/****************************************************************************************************
	Copyright (c) 2005, 2006 Rafael Robayna

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	Additional Contributions by: Morris Johns
****************************************************************************************************/
define(['exports', 'wb/interaction', 'jquery'], function(exports, interaction, $) {


    /*
     * Takes user input and displays drawing on a canvas.
     */

    exports.CanvasPainter = CanvasPainter;

    /*
     * Constructor
     */
    function CanvasPainter(canvasName, canvasInterfaceName) { 
        this.canvasName = canvasName;
        this.canvasInterfaceName = canvasInterfaceName; 
        this.cpMouseDownState = false;
        this.drawColor = 'rgb(0,0,0)';
        this.curDrawAction = 1;
        this.startPos = {x:-1, y:-1};
        this.curPos = {x:-1, y:-1};
        this.drawActions = [this.drawBrush, this.drawPencil, this.drawLine, this.drawRectangle, this.drawCircle, this.clearCanvas];
        this.widgetListeners = new Array();

        els = document.getElementsByClassName(canvasName);
        this.canvas = els[0]; 
        this.context = this.canvas.getContext('2d');

        var els = document.getElementsByClassName(canvasInterfaceName);
        this.canvasInterface = els[0];
        this.contextI = this.canvasInterface.getContext('2d');

        this.initMouseListeners();
        var self = this;
        $(document).bind('canvasWasResized', function() {
            self.updateSize();
        });
        var self = this;
        $(document).bind('clear_canvas', function() {
            self.clear();
        });

        $(document).bind('set_line_width', function(e, data) {
            self.setLineWidth(data.stroke);
        });

        this.updateSize();

    }

    CanvasPainter.prototype.updateSize = function(){
        this.position = {x:$(this.canvasInterface).offset().left, y:$(this.canvasInterface).offset().top};
        this.canvasWidth = this.canvas.getAttribute('width');
        this.canvasHeight = this.canvas.getAttribute('height');
    }


    CanvasPainter.prototype.initMouseListeners = function() {
        this.mouseMoveTrigger = new Function(); // initialize with mouse up state
        interaction = interaction(this.canvasInterface);
        interaction.bindDown(this.mouseDownActionPerformed.bindAsEventListener(this));
        interaction.bindMove(this.mouseMoveActionPerformed.bindAsEventListener(this));
        interaction.bindUp(this.mouseUpActionPerformed.bindAsEventListener(this));
    }

    CanvasPainter.prototype.mouseDownActionPerformed = function(e) {
        this.startPos = this.getCanvasMousePos(e, this.position);
        this.moveMoveTrigger = this.mouseMoveTrigger = function(e) {
            this.cpMouseMove(e);
        }; 
    }

    CanvasPainter.prototype.cpMouseMove = function(e) {

        this.setColor(this.drawColor);
        this.curPos = this.getCanvasMousePos(e, this.position);
        if(this.curDrawAction == 0) {
            this.drawBrush(this.startPos, this.curPos, this.context);
            this.callWidgetListeners();
            this.startPos = this.curPos;
        } else if(this.curDrawAction == 1) {
            this.drawPencil(this.startPos, this.curPos, this.context);
            this.callWidgetListeners();
            this.startPos = this.curPos;
        } else if (this.curDrawAction == 2) {
            this.contextI.lineWidth = this.context.lineWidth;
            this.contextI.clearRect(0,0,this.canvasWidth, this.canvasHeight);
            this.drawLine(this.startPos, this.curPos, this.contextI);
        } else if (this.curDrawAction == 3) {
            this.contextI.clearRect(0,0, this.canvasWidth, this.canvasHeight);
            this.drawRectangle(this.startPos, this.curPos, this.contextI);
        } else if (this.curDrawAction == 4) {
            this.contextI.clearRect(0,0,this.canvasWidth, this.canvasHeight);
            this.drawCircle(this.startPos, this.curPos, this.contextI);
        }

        this.cpMouseDownState = true;
    }



    CanvasPainter.prototype.mouseMoveActionPerformed = function(e) {
        this.mouseMoveTrigger(e);
    }

    CanvasPainter.prototype.mouseUpActionPerformed = function(e) {
        if(!this.cpMouseDownState) return;
        this.curPos = this.getCanvasMousePos(e, this.position);
        if(this.curDrawAction > 1) {
            this.setColor(this.drawColor);
            this.drawActions[this.curDrawAction](this.startPos, this.curPos, this.context, false);
            this.clearInterface();
            this.callWidgetListeners();
        }
        this.mouseMoveTrigger = new Function();
        this.cpMouseDownState = false;
    }

    CanvasPainter.prototype.getCanvasMousePos = function(e) {
        return {x: e.clientX - this.position.x, y: e.clientY - this.position.y};
    }


    CanvasPainter.prototype.setColor = function(color) {
        if(color=='rgba(0,0,0,0)') this.context.globalCompositeOperation = "copy";
        if(color=='rgba(0,0,0,0)') this.contextI.globalCompositeOperation = "copy";
        this.context.fillStyle = color;
        this.context.strokeStyle = color;
        this.contextI.fillStyle = color;
        this.contextI.strokeStyle = color;
        this.drawColor = color;
    }

    CanvasPainter.prototype.setLineWidth = function(width) {
        console.log('setLineWidth : ' + width);
        this.context.lineWidth = width;
        this.contextI.lineWidth = width;
        this.lineWidth = width;
    }

    //Draw Functions
    CanvasPainter.prototype.drawRectangle = function(pntFrom, pntTo, context) {
        context.beginPath();
        context.fillRect(pntFrom.x, pntFrom.y, pntTo.x - pntFrom.x, pntTo.y - pntFrom.y);
        context.closePath();
    }
    CanvasPainter.prototype.drawCircle = function (pntFrom, pntTo, context) {
        var centerX = Math.max(pntFrom.x,pntTo.x) - Math.abs(pntFrom.x - pntTo.x)/2;
        var centerY = Math.max(pntFrom.y,pntTo.y) - Math.abs(pntFrom.y - pntTo.y)/2;
        context.beginPath();
        var distance = Math.sqrt(Math.pow(pntFrom.x - pntTo.x,2) + Math.pow(pntFrom.y - pntTo.y,2));
        context.arc(centerX, centerY, distance/2,0,Math.PI*2 ,true);
        context.fill();
        context.closePath();
    }
    CanvasPainter.prototype.drawLine = function(pntFrom, pntTo, context) {
        context.beginPath();
        context.moveTo(pntFrom.x,pntFrom.y);
        context.lineTo(pntTo.x,pntTo.y);
        context.stroke();
        context.closePath();
    }

    CanvasPainter.prototype.drawPencil = function(pntFrom, pntTo, context) {
        context.save();
        context.beginPath();
        context.lineCap = "round";
        context.moveTo(pntFrom.x,pntFrom.y);
        context.lineTo(pntTo.x,pntTo.y);
        context.stroke();
        context.closePath();
        context.restore();
    }


    /*
    CanvasPainter.prototype.drawMultiline = function(points, context) {
            console.log('drawMultiline');
            context.beginPath();
            context.lineCap = "round";
            context.moveTo(points[0].x,points[0].y);

            for (var i=1; i < points.length; i++) {
                context.lineTo(points[i].x,points[i].y);
            }

            context.stroke();
            context.closePath();

    }
    */


    CanvasPainter.prototype.drawBrush = function(pntFrom, pntTo, context) {
        context.beginPath();
        context.moveTo(pntFrom.x, pntFrom.y);
        context.lineTo(pntTo.x, pntFrom.y);
        context.stroke();
        context.closePath();
    }


    CanvasPainter.prototype.clear = function() {

        this.setDrawAction(5);
    }

    CanvasPainter.prototype.setDrawAction = function(action) {
        if(action==5) {
            var lastAction = this.curDrawAction;
            this.curDrawAction = action;
            this.callWidgetListeners();
            this.curDrawAction = lastAction;
            this.clearCanvas(this.context, $(window).width(), $(window).height());
            this.clearInterface();
        } else {
            this.curDrawAction = action;
            this.context.fillStyle = this.drawColor;
            this.context.strokeStyle = this.drawColor;
        }
    }

    CanvasPainter.prototype.clearCanvas = function(context, canvasWidth, canvasHeight) {
        context.beginPath();
        context.clearRect(0,0, canvasWidth, canvasHeight);
        context.closePath();
    }

    CanvasPainter.prototype.clearInterface = function() {
        this.contextI.beginPath();
        this.contextI.clearRect(0,0,this.canvasWidth, this.canvasHeight);
        this.contextI.closePath();
    }



    /**
     * Used to add event listeners directly to the widget.  Listeners registered 
     * with this function are triggered every time the widget's state changes.
     *
     * @param {Function} eventListener
    */
    CanvasPainter.prototype.addWidgetListener = function(eventListener) {
        this.widgetListeners[this.widgetListeners.length] = eventListener;
    }


    /**
     * Executs all functions registered as widgetListeners.  Should be called every time 
     * the widget's state changes.
    */
    CanvasPainter.prototype.callWidgetListeners = function() {
        if(this.widgetListeners.length != 0) {
                for(var i=0; i < this.widgetListeners.length; i++) 
                        this.widgetListeners[i]();
        }
    }



});



