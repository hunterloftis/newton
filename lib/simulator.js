var onFrame = require('./frame').onFrame;
var Accumulator = require('./accumulator');

function Simulator() {
  if (!(this instanceof Simulator)) return new Simulator();

  this._step = this._step.bind(this);
  this._stepInterval = 1000 / 60;     // TODO: option
  this._running = false;
  this._accumulator = undefined;
}

Simulator.prototype.start = function() {
  this._running = true;
  this._accumulator = new Accumulator(this._stepInterval, 100);
  onFrame(this._step);
};

Simulator.prototype.add = function(entity) {
  // TODO
};

Simulator.prototype._step = function() {
  if (!this._running) return;

  var time;
  var interval = this._accumulator.freeze();
  while (time = this._accumulator.next()) {
    this._simulate(interval, time);
  }

  onFrame(this._step);
};

Simulator.prototype._simulate = function(time, totalTime) {

};

module.exports = Simulator;
