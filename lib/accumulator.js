function Accumulator(interval, max) {
  this._interval = interval;
  this._max = max;
  this._total = 0;
  this._lastTime = 0;
  this._startTime = Date.now();
}

Accumulator.prototype.freeze = function() {
  this._time = Date.now();
  this._buffer = this._time - this._lastTime;
  this._lastTime = this._time;

  return this._interval;
};

Accumulator.prototype.next = function() {
  if (this._buffer > this._max) {
    this._buffer = 0;
    return false;
  }
  if (this._buffer < this._interval) return false;

  this._total += this._interval;
  this._buffer -= this._interval;
  return this._total;
};

module.exports = Accumulator;
