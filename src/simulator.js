;(function(Newton) {

  function Simulator(simulator, renderer, integrationFps) {
    if (!(this instanceof Simulator)) return new Simulator(simulator, renderer, integrationFps);
    this.simulator = simulator;
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
    this.layers = [];
  }

  Simulator.prototype.start = function() {
    this.running = true;
    this.countTime = Date.now() + 1000;
    requestAnimationFrame(this.step);
  };

  Simulator.prototype.stop = function() {
    this.running = false;
  };

  Simulator.prototype.integrate = function(time) {
    for (var i = 0, ilen = this.layers.length; i < ilen; i++) {
      this.layers[i].integrate(time);
    }
  };

  Simulator.prototype.Layer = function() {
    var newLayer = Newton.Layer();
    this.layers.push(newLayer);
    return newLayer;
  };

  Simulator.prototype.getStep = function() {
    var self = this;
    return function generatedStep() {
      if (!self.running) return;

      var time = Date.now();
      var step = time - self.lastTime;
      if (step > 100) step = 0;         // in case you leave / return

      self.accumulator += step;

      while (self.accumulator >= self.integrationStep) {
        self.simulator(self.integrationStep, self);
        self.integrate(self.integrationStep);
        self.accumulator -= self.integrationStep;
      }

      self.renderer(step, self);

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

  Newton.Simulator = Simulator;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
