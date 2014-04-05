this["Newton"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  Simulator: __webpack_require__(/*! ./lib/simulator */ 3),
	  GLRenderer: __webpack_require__(/*! ./lib/renderers/gl-renderer */ 5),
	  Particle: __webpack_require__(/*! ./lib/particle */ 7),
	  Vector: __webpack_require__(/*! ./lib/vector */ 6)
	};


/***/ },
/* 1 */
/*!****************************!*\
  !*** ./lib/accumulator.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 2 */
/*!**********************!*\
  !*** ./lib/frame.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

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


/***/ },
/* 3 */
/*!**************************!*\
  !*** ./lib/simulator.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var onFrame = __webpack_require__(/*! ./frame */ 2).onFrame;
	var Accumulator = __webpack_require__(/*! ./accumulator */ 1);
	
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


/***/ },
/* 4 */
/*!*************************!*\
  !*** ./lib/renderer.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	function Renderer() {
	
	}
	
	Renderer.prototype.render = function(sim) {
	  this._sim = sim;
	};
	
	module.exports = Renderer;


/***/ },
/* 5 */
/*!**************************************!*\
  !*** ./lib/renderers/gl-renderer.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var Renderer = __webpack_require__(/*! ../renderer */ 4);
	
	function GLRenderer(el) {
	  if (!(this instanceof GLRenderer)) return new GLRenderer(el);
	  this._el = el;
	  this._sim = undefined;
	}
	
	GLRenderer.prototype = Object.create(Renderer.prototype);
	
	GLRenderer.prototype.render = function(sim) {
	  this._sim = sim;
	};
	
	module.exports = GLRenderer;


/***/ },
/* 6 */
/*!***********************!*\
  !*** ./lib/vector.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	function Vector(x, y) {
	  if (!(this instanceof Vector)) return new Vector(x, y);
	  this.x = x;
	  this.y = y;
	}
	
	module.exports = Vector;


/***/ },
/* 7 */
/*!*************************!*\
  !*** ./lib/particle.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(/*! ./vector */ 6);
	
	function Particle(x, y, size) {
	  if (!(this instanceof Particle)) return new Particle(x, y, size);
	  this.position = Vector(x, y);
	}
	
	module.exports = Particle;


/***/ }
/******/ ])
/*
//@ sourceMappingURL=newton.map
*/