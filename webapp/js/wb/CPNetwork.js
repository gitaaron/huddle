var socket;
var cObj;

var CPNetwork = CanvasWidget.extend({

    canvasInterfaceName: "",
    saveDrawing: "",
    queued_commands : [],
    queued_send_commands : [],
    
    constructor: function(canvasInterfaceName, saveDrawing) {
        cp_self = this;        
        this.canvasInterfaceName = canvasInterfaceName;
        this.saveDrawing = saveDrawing;
        TouchHelper.bindUp(this.mouseUpActionPerformed.bindAsEventListener(this));

        function message(obj) {
            console.log('msg');
            if('message' in obj) {
                obj = obj['message'][1];
                console.log('received msg');
                cObj = obj;
                if('command' in obj) {
                    console.log('received command');
                    cObj = obj;
                    cp_self.receiveCommand(obj.command);
                } else if ('clear' in obj) {
                    console.log('received clear');
                }    
            }
        }

        $(function() {
            //socket = new io.Socket(null, {port:8086, rememberTransport:false});
            socket = io.connect();
            //socket.connect();

            socket.on('message', function(obj) {
                obj = JSON.parse(obj);
                if('buffer' in obj) {
                    for (var i in obj.buffer) message(obj.buffer[i]);
                } else message(obj);

            });


            function tryReconnect() {
                if(!socket.connected) {
                    location.reload(true);
                }
            }

            var ss = $('#sync_status');
            var sm = 'Sync Manager Status : ';
            socket.on('connect', function() { ss.html(sm + 'Connected'); setTimeout('cp_self.clearSendingQueue()', 2000)});
            socket.on('disconnect', function() { ss.html(sm+ 'Disconnected... refreshing page in five seconds.'); setTimeout(tryReconnect, 10000)});
            socket.on('reconnect', function() { ss.html(sm + 'Connected'); setTimeout('cp_self.clearSendingQueue()', 2000); });
            socket.on('reconnecting', function() { ss.html(sm + 'Reconnecting...') });
            //socket.on('reconnect_failed', function() { ss.html('Disconnected... please refresh page.') });
            socket.on('reconnect_failed', function() { ss.html(sm + 'Disconnected... refreshing page in five seconds.');  setTimeoute(tryReconnect, 10000)});

            

        });

        TouchHelper.bindDown(this.downActionPerformed.bindAsEventListener(cp_self));
        TouchHelper.bindUp(this.upActionPerformed.bindAsEventListener(cp_self));

    },

    receiveCommand : function(c) {
        if(c['type'].substring(0,5)=='mouse') {
            this.drawCommand(c);
        } else {
            if(this.inProgress) {
                this.queued_commands.push(c);
            } else {
                this.drawCommand(c);
            }
        }
    },

    drawCommand : function(command) {
        switch(command['type']) {
            case 'stroke':
                try {
                    node = scaleNode(command['message']);
                    saveDrawing.drawing.push(node);
                    saveDrawing.paintDrawing();
                } catch(err) {
                    console.log('Error drawing command from server.');
                }
                break;

            case 'clear':
                setCPDrawAction(5);
                break;

            case 'mousemove':
            case 'mousedown':
            case 'mouseup':
                node = scaleNode(command['message']);
                points = node.p;
                $.each(points, function(k,v) {
                    simulateMouseEvent(command['type'], v);
                });
                break;
        } 

        function scaleNode(node) {
            var n = node;
            points = n.p;
            wScalF = $(window).width() / n.wW;
            hScalF = $(window).height() / n.wH;

            $.each(points, function(k,v) {
                    n.p[k].x = v.x * wScalF;
                    n.p[k].y = v.y * hScalF;
            });
            return n;
        }

        function simulateMouseEvent(type, point) {
            var simulatedEvent = document.createEvent('MouseEvent');
            simulatedEvent.initMouseEvent(type, true, true, window, 1, point.x, point.y, point.x, point.y, false, false, false, 0, null);
            //var t = document.elementFromPoint(point.x, point.y);
            var t = document.getElementsByClassName('canvasInterface')[0];
            if(t) {
                t.dispatchEvent(simulatedEvent);
            } else {
                console.log('t from point x : ' + point.x + ' y : ' + point.y + ' is null');
            }
        }


    }, 

    downActionPerformed : function(e) {
         this.inProgress = true;
    },

    upActionPerformed : function(e) {
        this.clearPendingQueue();
        this.inProgress = false;
    },

    clearPendingQueue : function() {
        while(this.queued_commands.length) {
            this.drawCommand(this.queued_commands.pop());
        }
    },

    mouseUpActionPerformed: function(e) {
        if(window.readonly=='false') {
            console.log('mouseUp');

            currNode = this.saveDrawing.drawing[this.saveDrawing.drawing.length-1];
            var command = {'type':'stroke', 'message':currNode};
            console.log('mouseUp2');
            socket.send(JSON.stringify({'command':command}));
            if(socket.socket.connected) {
                console.log('sending1');
                socket.send(JSON.stringify({'command':command}));
                console.log('sending2');
            } else {
                console.log('queing');
                this.queued_send_commands.push(command);
            }
        }
    },

    clearSendingQueue : function() {
        while(cp_self.queued_send_commands.length) {
            socket.send(cp_self.queued_send_commands.pop());
        }
    },


});
