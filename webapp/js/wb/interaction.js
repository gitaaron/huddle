define(['jquery'], function($) {

    /*  Prototype JavaScript framework, version 1.4.0
     *  (c) 2005 Sam Stephenson <sam@conio.net>
     *
     *  Prototype is freely distributable under the terms of an MIT-style license.
     *  For details, see the Prototype web site: http://prototype.conio.net/
     *
    /*--------------------------------------------------------------------------*/
    Function.prototype.bindAsEventListener = function(object) {
      var __method = this;
      return function(event) {
        return __method.call(object, event || window.event);
      }
    }


    return function(element) {

        var two_fingers_down = false;
        this.element = element;

        this.bindDown = function(callback) {

            if(this.isEventSupported("touchstart")) {
                this.element.addEventListener("touchstart", function(e) {
                    if(e.touches.length>1) {
                        two_fingers_down = true;
                    } else {
                        e.preventDefault();
                        e = e.touches[0];
                        callback(e);
                    }
                }); 
            } else {
                $(this.element).bind("mousedown", callback);
            }
        }

        this.bindMove = function(callback) {
            if(this.isEventSupported("touchmove")) {
                this.element.addEventListener("touchmove", function(e) {
                    if(!two_fingers_down) {
                        e.preventDefault();
                        e = e.touches[0];
                        callback(e);
                    }
                });

            } else {
                $(this.element).bind("mousemove", callback);
            }
        } 

        this.bindUp = function(callback) {
            if(this.isEventSupported("touchend")) {
                this.element.addEventListener("touchend", function(ev) {

                    if(!two_fingers_down) {
                        ev.preventDefault();
                        ev = ev.changedTouches[0];
                        callback(ev);
                    } else {
                        if(ev.touches.length==0) {
                            two_fingers_down=false;
                        }
                    }

                });
            } else {
                $(this.element).bind("mouseup", callback);
            }
        }

        this.isEventSupported = (function(){
            var TAGNAMES = {
              'select':'input','change':'input',
              'submit':'form','reset':'form',
              'error':'img','load':'img','abort':'img'
            }
            function isEventSupported(eventName) {
              var el = document.createElement(TAGNAMES[eventName] || 'div');
              eventName = 'on' + eventName;
              var isSupported = (eventName in el);
              if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
              }
              el = null;
              return isSupported;
            }
            return isEventSupported;
        })();

        return this;

    }



});
