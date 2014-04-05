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
	  Simulator: __webpack_require__(/*! ./lib/simulator */ 8),
	  GLRenderer: __webpack_require__(/*! ./lib/renderers/gl-renderer */ 7),
	  Particle: __webpack_require__(/*! ./lib/particle */ 4),
	  Vector: __webpack_require__(/*! ./lib/vector */ 1)
	};


/***/ },
/* 1 */
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
/* 2 */
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
/* 3 */
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
/* 4 */
/*!*************************!*\
  !*** ./lib/particle.js ***!
  \*************************/
/***/ function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(/*! ./vector */ 1);
	
	function Particle(x, y, size) {
	  if (!(this instanceof Particle)) return new Particle(x, y, size);
	  this.position = Vector(x, y);
	}
	
	Particle.prototype.type = 'Particle';
	
	module.exports = Particle;


/***/ },
/* 5 */
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
/* 6 */
/*!**********************************************!*\
  !*** ./lib/renderers/gl-renderer/gl-util.js ***!
  \**********************************************/
/***/ function(module, exports, __webpack_require__) {

	var POINT_VS = [
	  'uniform vec2 viewport;',
	  'attribute vec3 position;',
	  'attribute float size;',
	
	  'void main() {',
	    'vec2 scaled = ((position.xy / viewport) * 2.0) - 1.0;',
	    'vec2 flipped = vec2(scaled.x, -scaled.y);',
	
	    'gl_Position = vec4(flipped, 0, 1);',
	    'gl_PointSize = size + 1.0;',
	  '}'
	].join('\n');
	
	var CIRCLE_FS = [
	  'precision mediump float;',
	  'uniform sampler2D texture;',
	
	  'void main() {',
	    'gl_FragColor = texture2D(texture, gl_PointCoord);',
	  '}'
	].join('\n');
	
	module.exports = {
	  getGLContext: getGLContext,
	  createCircleTexture: createCircleTexture,
	  createCircleShader: createCircleShader,
	  createShaderProgram: createShaderProgram,
	  createTexture: createTexture
	};
	
	function getGLContext(canvas) {
	  var names = [
	    'webgl',
	    'experimental-webgl',
	    'webkit-3d',
	    'moz-webgl'
	  ];
	
	  var i = 0, gl;
	  while (!gl && i++ < names.length) {
	    try {
	      gl = canvas.getContext(names[i]);
	    } catch(e) {}
	  }
	  return gl;
	}
	
	function createCircleTexture(gl, size) {
	  size = size || 32;
	
	  var canvas = document.createElement('canvas');
	  canvas.width = canvas.height = size;
	  var ctx = canvas.getContext('2d');
	  var rad = size * 0.5;
	
	  ctx.beginPath();
	  ctx.arc(rad, rad, rad, 0, Math.PI * 2, false);
	  ctx.closePath();
	  ctx.fillStyle = '#fff';
	  ctx.fill();
	
	  return createTexture(gl, canvas);
	}
	
	function createTexture(gl, data) {
	  var texture = gl.createTexture();
	
	  gl.bindTexture(gl.TEXTURE_2D, texture);
	  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	  gl.generateMipmap(gl.TEXTURE_2D);
	  gl.bindTexture(gl.TEXTURE_2D, null);
	
	  return texture;
	}
	
	function createShaderProgram(gl, vsText, fsText) {
	  var vs = gl.createShader(gl.VERTEX_SHADER);
	  var fs = gl.createShader(gl.FRAGMENT_SHADER);
	
	  gl.shaderSource(vs, vsText);
	  gl.shaderSource(fs, fsText);
	
	  gl.compileShader(vs);
	  gl.compileShader(fs);
	
	  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
	    console.error('error compiling VS shaders:', gl.getShaderInfoLog(vs));
	    throw new Error('shader failure');
	  }
	
	  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
	    console.error('error compiling FS shaders:', gl.getShaderInfoLog(fs));
	    throw new Error('shader failure');
	  }
	
	  var program = gl.createProgram();
	
	  gl.attachShader(program, vs);
	  gl.attachShader(program, fs);
	  gl.linkProgram(program);
	
	  return program;
	}
	
	function createCircleShader(gl, viewportArray, viewportAttr, positionAttr, sizeAttr) {
	  viewportAttr = viewportAttr || 'viewport';
	  positionAttr = positionAttr || 'position';
	  sizeAttr = sizeAttr || 'size';
	
	  var shader = createShaderProgram(gl, POINT_VS, CIRCLE_FS);
	  shader.uniforms = {
	    viewport: gl.getUniformLocation(shader, viewportAttr)
	  };
	  shader.attributes = {
	    position: gl.getAttribLocation(shader, positionAttr),
	    size: gl.getAttribLocation(shader, sizeAttr)
	  };
	  gl.useProgram(shader);
	  gl.uniform2fv(shader.uniforms.viewport, viewportArray);
	
	  return shader;
	}


/***/ },
/* 7 */
/*!********************************************!*\
  !*** ./lib/renderers/gl-renderer/index.js ***!
  \********************************************/
/***/ function(module, exports, __webpack_require__) {

	var Renderer = __webpack_require__(/*! ../../renderer */ 5);
	var GLUtil = __webpack_require__(/*! ./gl-util */ 6);
	var onFrame = __webpack_require__(/*! ../../frame */ 3).onFrame;
	
	var MAX_PARTICLES = 10000;
	
	function GLRenderer(el) {
	  if (!(this instanceof GLRenderer)) return new GLRenderer(el);
	
	  this._drawFrame = this._drawFrame.bind(this);
	  this._sim = undefined;
	  this._el = el;
	  this._gl = GLUtil.getGLContext(el);
	  this._verticesAlloc = [];
	  this._sizesAlloc = [];
	  this._viewportArray = new Float32Array([el.width, el.height]);
	  this._vArray = new Float32Array(MAX_PARTICLES * 3);
	  this._sArray = new Float32Array(MAX_PARTICLES);
	  this._particleTexture = GLUtil.createCircleTexture(this._gl);
	  this._particleShader = GLUtil.createCircleShader(this._gl, this._viewportArray);
	  this._particlePositionBuffer = this._gl.createBuffer();
	}
	
	GLRenderer.prototype = Object.create(Renderer.prototype);
	
	GLRenderer.prototype.render = function(sim) {
	  this._sim = sim;
	  onFrame(this._drawFrame);
	};
	
	GLRenderer.prototype._drawFrame = function() {
	  this._clear();
	  this._drawParticles(this._sim.getParticles());
	  onFrame(this._drawFrame);
	};
	
	GLRenderer.prototype._clear = function() {
	  var gl = this._gl;
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	};
	
	GLRenderer.prototype._drawParticles = function(particles) {
	  var gl = this._gl;
	  var vertices = this._verticesAlloc;
	  var sizes = this._sizesAlloc;
	  var vArray = this._vArray;
	  var sArray = this._sArray;
	  var particleShader = this._particleShader;
	
	  vertices.length = 0;
	  sizes.length = 0;
	
	  var particle;
	
	  for (var i = 0, ilen = particles.length; i < ilen; i++) {
	    particle = particles[i];
	    vertices.push(particle.position.x, particle.position.y, 0);
	    sizes.push(particle.size < 8 ? particle.size : 8);
	  }
	
	  if (vertices.length > vArray.length) throw new Error('vArray too small to hold vertices');
	  vArray.set(vertices, 0);
	  if (sizes.length > sArray.length) throw new Error('sArray too small to hold sizes');
	  sArray.set(sizes, 0);
	
	  gl.activeTexture(gl.TEXTURE0);
	  gl.bindTexture(gl.TEXTURE_2D, this._particleTexture);
	
	  // TODO: necessary?
	  gl.useProgram(this.particleShader);
	
	  // position buffer
	  gl.bindBuffer(gl.ARRAY_BUFFER, this._particlePositionBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, vArray, gl.STATIC_DRAW);
	  gl.vertexAttribPointer(particleShader.attributes.position, 3, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(particleShader.attributes.position);
	
	  // size buffer
	  gl.bindBuffer(gl.ARRAY_BUFFER, this._particleSizeBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, sArray, gl.STATIC_DRAW);
	  gl.vertexAttribPointer(particleShader.attributes.size, 1, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(particleShader.attributes.size);
	
	  gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
	};
	
	module.exports = GLRenderer;
	


/***/ },
/* 8 */
/*!**************************!*\
  !*** ./lib/simulator.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var Emitter = __webpack_require__(/*! eventemitter2 */ 9);
	var onFrame = __webpack_require__(/*! ./frame */ 3).onFrame;
	var Accumulator = __webpack_require__(/*! ./accumulator */ 2);
	
	function Simulator() {
	  if (!(this instanceof Simulator)) return new Simulator();
	
	  Emitter.call(this);
	
	  this._step = this._step.bind(this);
	  this._stepInterval = 1000 / 60;     // TODO: option
	  this._running = false;
	  this._accumulator = undefined;
	  this._particles = [];
	}
	
	Simulator.prototype = Object.create(Emitter.prototype);
	
	Simulator.prototype.start = function() {
	  this._running = true;
	  this._accumulator = new Accumulator(this._stepInterval, 100);
	  onFrame(this._step);
	};
	
	Simulator.prototype.add = function(entity) {
	  if (entity.type === 'Particle') this._particles.push(entity);
	};
	
	Simulator.prototype.getParticles = function() {
	  return this._particles;
	}
	
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
/* 9 */
/*!**********************************************!*\
  !*** ./~/eventemitter2/lib/eventemitter2.js ***!
  \**********************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;;!function(exports, undefined) {
	
	  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
	    return Object.prototype.toString.call(obj) === "[object Array]";
	  };
	  var defaultMaxListeners = 10;
	
	  function init() {
	    this._events = {};
	    if (this._conf) {
	      configure.call(this, this._conf);
	    }
	  }
	
	  function configure(conf) {
	    if (conf) {
	
	      this._conf = conf;
	
	      conf.delimiter && (this.delimiter = conf.delimiter);
	      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
	      conf.wildcard && (this.wildcard = conf.wildcard);
	      conf.newListener && (this.newListener = conf.newListener);
	
	      if (this.wildcard) {
	        this.listenerTree = {};
	      }
	    }
	  }
	
	  function EventEmitter(conf) {
	    this._events = {};
	    this.newListener = false;
	    configure.call(this, conf);
	  }
	
	  //
	  // Attention, function return type now is array, always !
	  // It has zero elements if no any matches found and one or more
	  // elements (leafs) if there are matches
	  //
	  function searchListenerTree(handlers, type, tree, i) {
	    if (!tree) {
	      return [];
	    }
	    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
	        typeLength = type.length, currentType = type[i], nextType = type[i+1];
	    if (i === typeLength && tree._listeners) {
	      //
	      // If at the end of the event(s) list and the tree has listeners
	      // invoke those listeners.
	      //
	      if (typeof tree._listeners === 'function') {
	        handlers && handlers.push(tree._listeners);
	        return [tree];
	      } else {
	        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
	          handlers && handlers.push(tree._listeners[leaf]);
	        }
	        return [tree];
	      }
	    }
	
	    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
	      //
	      // If the event emitted is '*' at this part
	      // or there is a concrete match at this patch
	      //
	      if (currentType === '*') {
	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
	          }
	        }
	        return listeners;
	      } else if(currentType === '**') {
	        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
	        if(endReached && tree._listeners) {
	          // The next element has a _listeners, add it to the handlers.
	          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
	        }
	
	        for (branch in tree) {
	          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
	            if(branch === '*' || branch === '**') {
	              if(tree[branch]._listeners && !endReached) {
	                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
	              }
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            } else if(branch === nextType) {
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
	            } else {
	              // No match on this one, shift into the tree but not in the type array.
	              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
	            }
	          }
	        }
	        return listeners;
	      }
	
	      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
	    }
	
	    xTree = tree['*'];
	    if (xTree) {
	      //
	      // If the listener tree will allow any match for this part,
	      // then recursively explore all branches of the tree
	      //
	      searchListenerTree(handlers, type, xTree, i+1);
	    }
	
	    xxTree = tree['**'];
	    if(xxTree) {
	      if(i < typeLength) {
	        if(xxTree._listeners) {
	          // If we have a listener on a '**', it will catch all, so add its handler.
	          searchListenerTree(handlers, type, xxTree, typeLength);
	        }
	
	        // Build arrays of matching next branches and others.
	        for(branch in xxTree) {
	          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
	            if(branch === nextType) {
	              // We know the next element will match, so jump twice.
	              searchListenerTree(handlers, type, xxTree[branch], i+2);
	            } else if(branch === currentType) {
	              // Current node matches, move into the tree.
	              searchListenerTree(handlers, type, xxTree[branch], i+1);
	            } else {
	              isolatedBranch = {};
	              isolatedBranch[branch] = xxTree[branch];
	              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
	            }
	          }
	        }
	      } else if(xxTree._listeners) {
	        // We have reached the end and still on a '**'
	        searchListenerTree(handlers, type, xxTree, typeLength);
	      } else if(xxTree['*'] && xxTree['*']._listeners) {
	        searchListenerTree(handlers, type, xxTree['*'], typeLength);
	      }
	    }
	
	    return listeners;
	  }
	
	  function growListenerTree(type, listener) {
	
	    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	
	    //
	    // Looks for two consecutive '**', if so, don't add the event at all.
	    //
	    for(var i = 0, len = type.length; i+1 < len; i++) {
	      if(type[i] === '**' && type[i+1] === '**') {
	        return;
	      }
	    }
	
	    var tree = this.listenerTree;
	    var name = type.shift();
	
	    while (name) {
	
	      if (!tree[name]) {
	        tree[name] = {};
	      }
	
	      tree = tree[name];
	
	      if (type.length === 0) {
	
	        if (!tree._listeners) {
	          tree._listeners = listener;
	        }
	        else if(typeof tree._listeners === 'function') {
	          tree._listeners = [tree._listeners, listener];
	        }
	        else if (isArray(tree._listeners)) {
	
	          tree._listeners.push(listener);
	
	          if (!tree._listeners.warned) {
	
	            var m = defaultMaxListeners;
	
	            if (typeof this._events.maxListeners !== 'undefined') {
	              m = this._events.maxListeners;
	            }
	
	            if (m > 0 && tree._listeners.length > m) {
	
	              tree._listeners.warned = true;
	              console.error('(node) warning: possible EventEmitter memory ' +
	                            'leak detected. %d listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit.',
	                            tree._listeners.length);
	              console.trace();
	            }
	          }
	        }
	        return true;
	      }
	      name = type.shift();
	    }
	    return true;
	  }
	
	  // By default EventEmitters will print a warning if more than
	  // 10 listeners are added to it. This is a useful default which
	  // helps finding memory leaks.
	  //
	  // Obviously not all Emitters should be limited to 10. This function allows
	  // that to be increased. Set to zero for unlimited.
	
	  EventEmitter.prototype.delimiter = '.';
	
	  EventEmitter.prototype.setMaxListeners = function(n) {
	    this._events || init.call(this);
	    this._events.maxListeners = n;
	    if (!this._conf) this._conf = {};
	    this._conf.maxListeners = n;
	  };
	
	  EventEmitter.prototype.event = '';
	
	  EventEmitter.prototype.once = function(event, fn) {
	    this.many(event, 1, fn);
	    return this;
	  };
	
	  EventEmitter.prototype.many = function(event, ttl, fn) {
	    var self = this;
	
	    if (typeof fn !== 'function') {
	      throw new Error('many only accepts instances of Function');
	    }
	
	    function listener() {
	      if (--ttl === 0) {
	        self.off(event, listener);
	      }
	      fn.apply(this, arguments);
	    }
	
	    listener._origin = fn;
	
	    this.on(event, listener);
	
	    return self;
	  };
	
	  EventEmitter.prototype.emit = function() {
	
	    this._events || init.call(this);
	
	    var type = arguments[0];
	
	    if (type === 'newListener' && !this.newListener) {
	      if (!this._events.newListener) { return false; }
	    }
	
	    // Loop through the *_all* functions and invoke them.
	    if (this._all) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	      for (i = 0, l = this._all.length; i < l; i++) {
	        this.event = type;
	        this._all[i].apply(this, args);
	      }
	    }
	
	    // If there is no 'error' event listener then throw.
	    if (type === 'error') {
	
	      if (!this._all &&
	        !this._events.error &&
	        !(this.wildcard && this.listenerTree.error)) {
	
	        if (arguments[1] instanceof Error) {
	          throw arguments[1]; // Unhandled 'error' event
	        } else {
	          throw new Error("Uncaught, unspecified 'error' event.");
	        }
	        return false;
	      }
	    }
	
	    var handler;
	
	    if(this.wildcard) {
	      handler = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
	    }
	    else {
	      handler = this._events[type];
	    }
	
	    if (typeof handler === 'function') {
	      this.event = type;
	      if (arguments.length === 1) {
	        handler.call(this);
	      }
	      else if (arguments.length > 1)
	        switch (arguments.length) {
	          case 2:
	            handler.call(this, arguments[1]);
	            break;
	          case 3:
	            handler.call(this, arguments[1], arguments[2]);
	            break;
	          // slower
	          default:
	            var l = arguments.length;
	            var args = new Array(l - 1);
	            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	            handler.apply(this, args);
	        }
	      return true;
	    }
	    else if (handler) {
	      var l = arguments.length;
	      var args = new Array(l - 1);
	      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
	
	      var listeners = handler.slice();
	      for (var i = 0, l = listeners.length; i < l; i++) {
	        this.event = type;
	        listeners[i].apply(this, args);
	      }
	      return (listeners.length > 0) || this._all;
	    }
	    else {
	      return this._all;
	    }
	
	  };
	
	  EventEmitter.prototype.on = function(type, listener) {
	
	    if (typeof type === 'function') {
	      this.onAny(type);
	      return this;
	    }
	
	    if (typeof listener !== 'function') {
	      throw new Error('on only accepts instances of Function');
	    }
	    this._events || init.call(this);
	
	    // To avoid recursion in the case that type == "newListeners"! Before
	    // adding it to the listeners, first emit "newListeners".
	    this.emit('newListener', type, listener);
	
	    if(this.wildcard) {
	      growListenerTree.call(this, type, listener);
	      return this;
	    }
	
	    if (!this._events[type]) {
	      // Optimize the case of one listener. Don't need the extra array object.
	      this._events[type] = listener;
	    }
	    else if(typeof this._events[type] === 'function') {
	      // Adding the second element, need to change to array.
	      this._events[type] = [this._events[type], listener];
	    }
	    else if (isArray(this._events[type])) {
	      // If we've already got an array, just append.
	      this._events[type].push(listener);
	
	      // Check for listener leak
	      if (!this._events[type].warned) {
	
	        var m = defaultMaxListeners;
	
	        if (typeof this._events.maxListeners !== 'undefined') {
	          m = this._events.maxListeners;
	        }
	
	        if (m > 0 && this._events[type].length > m) {
	
	          this._events[type].warned = true;
	          console.error('(node) warning: possible EventEmitter memory ' +
	                        'leak detected. %d listeners added. ' +
	                        'Use emitter.setMaxListeners() to increase limit.',
	                        this._events[type].length);
	          console.trace();
	        }
	      }
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.onAny = function(fn) {
	
	    if(!this._all) {
	      this._all = [];
	    }
	
	    if (typeof fn !== 'function') {
	      throw new Error('onAny only accepts instances of Function');
	    }
	
	    // Add the function to the event listener collection.
	    this._all.push(fn);
	    return this;
	  };
	
	  EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	  EventEmitter.prototype.off = function(type, listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('removeListener only takes instances of Function');
	    }
	
	    var handlers,leafs=[];
	
	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
	    }
	    else {
	      // does not use listeners(), so no side effect of creating _events[type]
	      if (!this._events[type]) return this;
	      handlers = this._events[type];
	      leafs.push({_listeners:handlers});
	    }
	
	    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	      var leaf = leafs[iLeaf];
	      handlers = leaf._listeners;
	      if (isArray(handlers)) {
	
	        var position = -1;
	
	        for (var i = 0, length = handlers.length; i < length; i++) {
	          if (handlers[i] === listener ||
	            (handlers[i].listener && handlers[i].listener === listener) ||
	            (handlers[i]._origin && handlers[i]._origin === listener)) {
	            position = i;
	            break;
	          }
	        }
	
	        if (position < 0) {
	          continue;
	        }
	
	        if(this.wildcard) {
	          leaf._listeners.splice(position, 1);
	        }
	        else {
	          this._events[type].splice(position, 1);
	        }
	
	        if (handlers.length === 0) {
	          if(this.wildcard) {
	            delete leaf._listeners;
	          }
	          else {
	            delete this._events[type];
	          }
	        }
	        return this;
	      }
	      else if (handlers === listener ||
	        (handlers.listener && handlers.listener === listener) ||
	        (handlers._origin && handlers._origin === listener)) {
	        if(this.wildcard) {
	          delete leaf._listeners;
	        }
	        else {
	          delete this._events[type];
	        }
	      }
	    }
	
	    return this;
	  };
	
	  EventEmitter.prototype.offAny = function(fn) {
	    var i = 0, l = 0, fns;
	    if (fn && this._all && this._all.length > 0) {
	      fns = this._all;
	      for(i = 0, l = fns.length; i < l; i++) {
	        if(fn === fns[i]) {
	          fns.splice(i, 1);
	          return this;
	        }
	      }
	    } else {
	      this._all = [];
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
	
	  EventEmitter.prototype.removeAllListeners = function(type) {
	    if (arguments.length === 0) {
	      !this._events || init.call(this);
	      return this;
	    }
	
	    if(this.wildcard) {
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
	
	      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
	        var leaf = leafs[iLeaf];
	        leaf._listeners = null;
	      }
	    }
	    else {
	      if (!this._events[type]) return this;
	      this._events[type] = null;
	    }
	    return this;
	  };
	
	  EventEmitter.prototype.listeners = function(type) {
	    if(this.wildcard) {
	      var handlers = [];
	      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
	      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
	      return handlers;
	    }
	
	    this._events || init.call(this);
	
	    if (!this._events[type]) this._events[type] = [];
	    if (!isArray(this._events[type])) {
	      this._events[type] = [this._events[type]];
	    }
	    return this._events[type];
	  };
	
	  EventEmitter.prototype.listenersAny = function() {
	
	    if(this._all) {
	      return this._all;
	    }
	    else {
	      return [];
	    }
	
	  };
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
	      return EventEmitter;
	    }.call(exports, __webpack_require__, exports, module)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    exports.EventEmitter2 = EventEmitter;
	  }
	
	}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);


/***/ }
/******/ ])
/*
//@ sourceMappingURL=newton.map
*/