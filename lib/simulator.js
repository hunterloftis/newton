var onFrame = require('./frame').onFrame;
var Accumulator = require('./accumulator');

function Simulator() {
  if (!(this instanceof Simulator)) return new Simulator();

  this._step = this._step.bind(this);
  this._running = false;
  this._accumulator = undefined;
}

Simulator.prototype.start = function() {
  this._running = true;
  this._accumulator = new Accumulator(this._stepTime, 100);
  onFrame(this._step);
};

Simulator.prototype._step = function() {
  if (!this._running) return;

  var step;
  while (step = this._accumulator.step()) {
    this._simulate(step.time, step.total);
  }

  onFrame(this._step);
};

Simulator.prototype._simulate = function(time, totalTime) {

};

module.exports = Simulator;
