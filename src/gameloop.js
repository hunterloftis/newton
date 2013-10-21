;(function() {

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(integrator, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { integrator(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };


  function Gameloop(integrator, renderer, integrationFps) {
    this.integrator = integrator;
    this.renderer = renderer;
    this.step = this.getStep();
    this.lastTime = 0;
    this.running = false;
    this.fps = 0;
    this.frames = 0;
    this.countTime = 0;
    this.countInterval = 250;
    this.accumulator = 0;
    this.integrationStep = 1000 / (integrationFps || 60);
  }

  Gameloop.prototype.start = function() {
    this.running = true;
    this.countTime = Date.now() + 1000;
    requestAnimationFrame(this.step);
  };

  Gameloop.prototype.stop = function() {
    this.running = false;
  };

  Gameloop.prototype.getStep = function() {
    var self = this;
    return function generatedStep() {
      if (!self.running) return;

      var time = Date.now();
      var step = time - self.lastTime;
      if (step > 100) step = 0;         // in case you leave / return

      self.accumulator += step;

      while (self.accumulator >= self.integrationStep) {
        self.integrator(self.integrationStep);
        self.accumulator -= self.integrationStep;
      }

      self.renderer(step);

      self.frames++;
      if (time >= self.countTime) {
        self.fps = (self.frames / (self.countInterval + time - self.countTime) * 1000).toFixed(0);
        self.frames = 0;
        self.countTime = time + self.countInterval;
      }

      self.lastTime = time;
      requestAnimationFrame(self.step);
    };
  };

  window.Gameloop = Gameloop;

})();
