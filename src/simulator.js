;(function(Newton) {

  'use strict';

  function noop() {}

  'use strict'

  function Simulator(preSimulator, renderer, integrationFps, iterations) {
    if (!(this instanceof Simulator)) return new Simulator(preSimulator, renderer, integrationFps, iterations);
    this.preSimulator = preSimulator || noop;
    this.renderer = renderer || noop;
    this.step = this._step.bind(this);
    this.lastTime = 0;
    this.running = false;
    this.fps = 0;
    this.frames = 0;
    this.countTime = 0;
    this.countInterval = 250;
    this.accumulator = 0;
    this.simulationStep = 1000 / (integrationFps || 60);
    this.layers = [];
    this.iterations = iterations || 3;
  }

  Simulator.prototype.start = function() {
    this.running = true;
    this.countTime = Date.now() + 1000;
    Newton.frame(this.step);
  };

  Simulator.prototype.stop = function() {
    this.running = false;
  };

  Simulator.prototype.simulate = function(time) {
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

  Simulator.prototype._step = function() {
    if (!this.running) return;

    var time = Date.now();
    var step = time - this.lastTime;
    if (step > 100) step = 0;         // in case you leave / return

    this.accumulator += step;

    while (this.accumulator >= this.simulationStep) {
      this.preSimulator(this.simulationStep, this);
      this.simulate(this.simulationStep);
      this.accumulator -= this.simulationStep;
    }

    this.renderer(step, this);

    this.frames++;
    if (time >= this.countTime) {
      this.fps = (this.frames / (this.countInterval + time - this.countTime) * 1000).toFixed(0);
      this.frames = 0;
      this.countTime = time + this.countInterval;
    }

    this.lastTime = time;
    Newton.frame(this.step);
  };

  Newton.Simulator = Simulator;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
