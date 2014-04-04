;(function(Newton) {

  function Emitter(obj) {
    obj.listeners = {};
    obj.on = on;
    obj.emit = emit;
  }

  function on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  // TODO: if a listener unsubscribes it could screw up this loop
  function emit(event) {
    var listeners = this.listeners[event];
    if (!listeners || !listeners.length) return;
    var args = Array.slice.call(arguments, 1);

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }
  }

  Newton.Emitter = Emitter;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
