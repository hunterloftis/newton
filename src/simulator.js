;(function() {

  function Simulator(simulator, renderer, integrationFps, iterations) {
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
    this.iterations = iterations || 3;
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
    var i, ilen = this.layers.length;
    var j, jlen = this.iterations;

    for (i = 0; i < ilen; i++) {
      this.layers[i].collect(time);     // First, figure out which physical objects we're manipulating for each layer
      this.layers[i].integrate(time);   // Then integrate the layer's particles over time
    }

    for (j = 0; j < jlen; j++) {                                  // More iterations simulates with greater accuracy at the cost of time
      for (i = 0; i < ilen; i++) this.layers[i].constrain(time);  // Apply each particle's constraints
      for (i = 0; i < ilen; i++) this.layers[i].collide(time);    // Resolve collisions
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

  window.Newton = window.Newton || {};
  window.Newton.Simulator = Simulator;

})();
