define(['exports', 'jquery', 'wb/interaction', 'socket.io', 'wb/tablet'], function(exports, $, interaction, socket, tablet) {


    var socket = io.connect();
    
    var self;
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
        this.tablets = {};

        self = this;
        $(function() {
            var ss = $('#sync_status');
            var sm = 'Sync Manager Status : ';
            socket.on('connect', function() { ss.html(sm + 'Connected'); setTimeout(self.clearSendingQueue, 2000)});
            socket.on('disconnect', function() { ss.html(sm+ 'Disconnected... refreshing page in five seconds.'); setTimeout(tryReconnect, 10000)});
            socket.on('reconnect', function() { ss.html(sm + 'Connected'); setTimeout('cp_self.clearSendingQueue()', 2000); });
            socket.on('reconnecting', function() { ss.html(sm + 'Reconnecting...') });
        });


        socket.on('message', function(obj) {
            obj = JSON.parse(obj);
            if('buffer' in obj) {
                for (var i in obj.buffer) 
                self.receiveCommand(obj.buffer[i].command);
            } else {
                self.receiveCommand(obj.command);
            }
        });

        socket.on('tablet_connect', function(obj) {
            self.tablets[obj.sessionid] = new tablet('green', obj.wW, obj.wH);
        });

        socket.on('tablet_disconnect', function(obj) {
            if(self.tablets[obj.sessionid]) {
                self.tablets[obj.sessionid].remove();
                delete self.tablets[obj.sessionid];
            }
        });

        socket.on('tablet_event', function(obj) {
            self.tablets[obj.sessionid].receiveEvent(obj);
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
            c.w = this.canvasPainter.width;
            g_c = c;
                if(c.p && c.p.length) {
                    if(c.sessionid) {
                        var tablet = this.tablets[c.sessionid];
		        var node = this.saveDrawing.scaleNode(c, {width:tablet.getWidth(),height:tablet.getHeight()});
                        node = this.saveDrawing.translateNode(node, tablet.getPosition());
                    } else {
		        var node = this.saveDrawing.scaleNode(c, {width:$(window).width(),height:$(window).height()});
                    }
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
        if(!origC) return;
        origC.wW = $(window).width();
        origC.wH = $(window).height();
        origC.sessionid = socket.socket.sessionid;
        var c = $.extend(true, {}, origC);



        if(socket.socket.connected) {
            socket.emit('command', JSON.stringify(c));
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
        while(self.queued_send_commands.length) {
            this.sendCommand(this.queued_send_commands.pop());
        }
    }

    Network.prototype.announceTabletConnect = function() {
        socket.on('connect', function() {
            socket.emit('tablet_connect', {sessionid:socket.socket.sessionid, wW:$('.canvas').width(), wH:$('.canvas').height()});
        });
    }
    
    Network.prototype.announceScreenConnect = function() {
        socket.on('connect', function() {
            socket.emit('screen_connect', {sessionid:socket.socket.sessionid});
           
        });
    }

    Network.prototype.tabletEvent = function(type, data) {
        socket.emit('tablet_event', {type:type, data:data, sessionid:socket.socket.sessionid});
    }

    
});
