function Accumulator(step, max) {
  this._step = step;
  this._max = max;
  this._lastTime = 0;
  this._value = 0;
  this._startTime = Date.now();
}

Accumulator.prototype.step = function() {
  var now = Date.now();
  var step = now - this._lastTime;

  this._lastTime = now;
  if (step > this._max) step = 0;
  this._value += step;
  if (this._value < this._step) return false;
  this._value -= this._step;

  return {
    time: step,
    total: now - this._startTime
  };
}

module.exports = Accumulator;
