define(['exports', 'jquery', 'wb/interaction', 'socket.io'], function(exports, $, interaction, socket) {


    var socket = io.connect();
    

    /*
     * Responsible for sending / receiving messages between client and otclib
     */

    exports.Network = Network;

    /*
     * Constructor
     */
    function Network(canvasPainter, saveDrawing) {
        this.canvasPainter = canvasPainter;
        this.saveDrawing = saveDrawing;
        this.inProgress = false;
        this.queued_commands = [];
        this.queued_send_commands = [];

        interaction = interaction(canvasPainter.canvasInterface);
        interaction.bindDown(this.mouseDownActionPerformed.bindAsEventListener(this));
        interaction.bindUp(this.mouseUpActionPerformed.bindAsEventListener(this));

        var self = this;
        socket.on('message', function(obj) {
            obj = JSON.parse(obj);
            if('buffer' in obj) {
                for (var i in obj.buffer) 
                self.receiveCommand(obj.buffer[i].command);
            } else {
                self.receiveCommand(obj.command);
            }
        });

    
    }

    Network.prototype.receiveCommand = function(c) {

        if(this.inProgress) {
            this.queued_commands.push(c);
        } else {
            this.drawCommand(c);
        }
    }

    Network.prototype.drawCommand = function(c) {
	if(c) {
                if(c.p && c.p.length) {
		    var node = this.saveDrawing.scaleNode(c, {width:$(window).width(),height:$(window).height()});
                } else {
                    var node = c;
                }
		this.saveDrawing.drawing.push(node);
		this.saveDrawing.paintDrawing();
	} else {
		console.log('trying to draw undefined');
	}
    }

    Network.prototype.sendCommand = function(origC) {
        origC.wW = $(window).width();
        origC.wH = $(window).height();
        var c = $.extend(true, {}, origC);


        if(socket.socket.connected) {
            socket.send(JSON.stringify({'command':c}));
        } else {
            this.queued_send_commands.push(c);
        }
 
    }


    Network.prototype.mouseDownActionPerformed = function(e) {
        this.inProgress = true;
    }

    Network.prototype.mouseUpActionPerformed = function(e) {
        this.clearPendingQueue();
        this.inProgress = false;
    
        var currNode = this.saveDrawing.drawing[this.saveDrawing.drawing.length-1];

        this.sendCommand(currNode);

    }


    Network.prototype.clearPendingQueue = function() {
        while(this.queued_commands.length) {
            this.drawCommand(this.queued_commands.pop());
        }
    }

    Network.prototype.clearSendingQueue = function() {
        while(this.queued_send_commands.length) {
            this.sendCommand(this.queued_send_commands.pop());
        }
    }
    
});
