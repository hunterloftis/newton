(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  Simulator: require('./lib/simulator')
};

},{"./lib/simulator":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = getFrame();

function getFrame() {
  var lastTime = 0;

  // Browsers
  if (typeof window !== 'undefined') {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = timeoutFrame;
      window.cancelAnimationFrame = cancelTimeoutFrame;
    }

    return {
      onFrame: window.requestAnimationFrame.bind(window),
      cancelFrame: window.cancelAnimationFrame.bind(window)
    };
  }

  // Node
  return {
    onFrame: timeoutFrame,
    cancelFrame: cancelTimeoutFrame
  };

  function timeoutFrame(simulator, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function() { simulator(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  }

  function cancelTimeoutFrame(id) {
    clearTimeout(id);
  }
}

},{}],4:[function(require,module,exports){
var onFrame = require('./frame').onFrame;
var Accumulator = require('./accumulator');

function Simulator() {
  if (!(this instanceof Simulator)) return new Simulator();

  this._step = this._step.bind(this);
  this._running = false;
  this._time = undefined;
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

},{"./accumulator":2,"./frame":3}]},{},[1])