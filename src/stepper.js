;(function() {

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };


  function Stepper(callback) {
    this.callback = callback;
    this.step = this.getStep();
    this.lastTime = 0;
    this.lastStep = 0;
    this.started = false;
  }

  Stepper.prototype.start = function() {
    this.started = true;
    requestAnimationFrame(this.step);
  };

  Stepper.prototype.stop = function() {
    this.started = false;
  };

  Stepper.prototype.getStep = function() {
    var self = this;
    return function generatedStep() {
      var time = Date.now();
      var step = self.lastTime ? time - self.lastTime : 0;
      if (step > 100) step = 100; // in case you leave / return
      var correction = (step && self.lastStep) ? step / self.lastStep : 1;
      self.callback(step, correction);
      self.lastTime = time;
      self.lastStep = step;
      if (self.started) requestAnimationFrame(self.step);
    };
  };

  window.Stepper = Stepper;

})();
