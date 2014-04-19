!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Newton=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = {
  Simulator: _dereq_('./lib/simulator'),
  GLRenderer: _dereq_('./lib/renderers/gl-renderer'),
  Particle: _dereq_('./lib/particle'),
  Vector: _dereq_('./lib/vector'),
  Body: _dereq_('./lib/body'),
  Constraint: _dereq_('./lib/constraint'),
  PinConstraint: _dereq_('./lib/constraints/pin-constraint'),
  DistanceConstraint: _dereq_('./lib/constraints/distance-constraint'),
  RopeConstraint: _dereq_('./lib/constraints/rope-constraint'),
  BoxConstraint: _dereq_('./lib/constraints/box-constraint'),
  Force: _dereq_('./lib/force'),
  LinearForce: _dereq_('./lib/forces/linear-force')
};

},{"./lib/body":3,"./lib/constraint":4,"./lib/constraints/box-constraint":5,"./lib/constraints/distance-constraint":6,"./lib/constraints/pin-constraint":7,"./lib/constraints/rope-constraint":8,"./lib/force":9,"./lib/forces/linear-force":10,"./lib/particle":12,"./lib/renderers/gl-renderer":15,"./lib/simulator":17,"./lib/vector":18}],2:[function(_dereq_,module,exports){
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

},{}],3:[function(_dereq_,module,exports){
function Body() {
  if (!(this instanceof Body)) return new Body();

  this._entities = [];
  this._sim = undefined;
}

Body.prototype.type = 'Body';

Body.prototype.add = function(entity) {
  this._entities.push(entity);
  if (this._sim) this._sim.add(entity);
  return entity;
};

Body.prototype.setSimulator = function(sim) {
  this._sim = sim;
  for (var i = 0; i < this._entities.length; i++) {
    sim.add(this._entities[i]);
  }
};

module.exports = Body;

},{}],4:[function(_dereq_,module,exports){
var id = 0;

function Constraint() {
  this.id = id++;
}

Constraint.prototype.type = 'Constraint';
Constraint.prototype.priority = 10;
Constraint.prototype.correct = function() {};

module.exports = Constraint;

},{}],5:[function(_dereq_,module,exports){
'use strict';

var Constraint = _dereq_('../constraint');
var Vector = _dereq_('../vector');

function BoxConstraint(x, y, width, height) {
  if (!(this instanceof BoxConstraint)) return new BoxConstraint(x, y, width, height);
  Constraint.call(this);

  this._min = Vector(x, y);
  this._max = Vector(x + width, y + height);
}

BoxConstraint.prototype = Object.create(Constraint.prototype);

BoxConstraint.prototype.priority = 0;

BoxConstraint.prototype.correct = function(time, particles) {
  for (var i = 0; i < particles.length; i++) {
    particles[i].bound(this._min, this._max);
  }
};

module.exports = BoxConstraint;

},{"../constraint":4,"../vector":18}],6:[function(_dereq_,module,exports){
// TODO: make ordering smarter. detect chains

var Vector = _dereq_('../vector');
var Constraint = _dereq_('../constraint');

function DistanceConstraint(p1, p2) {
  if (!(this instanceof DistanceConstraint)) return new DistanceConstraint(p1, p2);
  Constraint.call(this);

  this._p1 = p1;
  this._p2 = p2;
  this._distance = this.getDistance();
  this._stiffness = 1;
}

DistanceConstraint.prototype = Object.create(Constraint.prototype);

DistanceConstraint.prototype.getDistance = function() {
  return Vector.getDistance(this._p1.position, this._p2.position);
};

DistanceConstraint.prototype.correct = function(time, particles) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength();
  var offBy = length - this._distance;
  // TODO: handle different masses
  var factor = offBy / length * this._stiffness;
  var correction1 = delta.pool().scale(factor * 1);
  var correction2 = delta.scale(-factor * 1);

  this._p1.move(correction1);
  this._p2.move(correction2);

  delta.free();
  correction1.free();
};

module.exports = DistanceConstraint;

},{"../constraint":4,"../vector":18}],7:[function(_dereq_,module,exports){
var Constraint = _dereq_('../constraint');

function PinConstraint(particle) {
  if (!(this instanceof PinConstraint)) return new PinConstraint(particle);
  Constraint.call(this);

  this._particle = particle;
  this._position = particle.position.clone();
}

PinConstraint.prototype = Object.create(Constraint.prototype);

PinConstraint.prototype.priority = 0;

PinConstraint.prototype.correct = function(time, particles) {
  this._particle.place(this._position);
};

module.exports = PinConstraint;

},{"../constraint":4}],8:[function(_dereq_,module,exports){
// TODO: make ordering smarter. detect chains
// TODO: inherit from distanceconstraint, or just give distanceconstraint some options

var Vector = _dereq_('../vector');
var Constraint = _dereq_('../constraint');

function RopeConstraint(p1, p2) {
  if (!(this instanceof RopeConstraint)) return new RopeConstraint(p1, p2);
  Constraint.call(this);

  this._p1 = p1;
  this._p2 = p2;
  this._distance = this.getDistance();
  this._stiffness = 1;
}

RopeConstraint.prototype = Object.create(Constraint.prototype);

RopeConstraint.prototype.getDistance = function() {
  return Vector.getDistance(this._p1.position, this._p2.position);
};

RopeConstraint.prototype.correct = function(time, particles) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength();
  var offBy = length - this._distance;

  if (offBy <= 0) return;

  // TODO: handle different masses
  var factor = offBy / length * this._stiffness;
  var correction1 = delta.pool().scale(factor * 1);
  var correction2 = delta.scale(-factor * 1);

  this._p1.move(correction1);
  this._p2.move(correction2);

  delta.free();
  correction1.free();
};

module.exports = RopeConstraint;

},{"../constraint":4,"../vector":18}],9:[function(_dereq_,module,exports){
function Force() {

}

Force.prototype.type = 'Force';
Force.prototype.apply = function() {};

module.exports = Force;

},{}],10:[function(_dereq_,module,exports){
var Force = _dereq_('../force');
var Vector = _dereq_('../vector');

function LinearForce(strength, angle) {
  if (!(this instanceof LinearForce)) return new LinearForce(strength, angle);
  Force.call(this);

  this._vector = Vector(strength, 0).rotate(angle);
}

LinearForce.prototype = Object.create(Force.prototype);

LinearForce.prototype.applyTo = function(particle) {
  particle.accelerate(this._vector);
};

module.exports = LinearForce;

},{"../force":9,"../vector":18}],11:[function(_dereq_,module,exports){
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

},{}],12:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector');

function Particle(x, y, size) {
  if (!(this instanceof Particle)) return new Particle(x, y, size);
  this.size = size || 1;
  this.position = Vector(x, y);
  this.lastPosition = Vector(x, y);
  this.acceleration = Vector(0, 0);
  this._velocityBuffer = Vector(0, 0);
}

Particle.prototype.type = 'Particle';

Particle.prototype.accelerate = function(v) {
  this.acceleration.add(v);
};

Particle.prototype.bound = function(min, max) {
  if (this.position.x < min.x) {
    this.position.x = this.lastPosition.x = min.x;
  }
  else if (this.position.x > max.x) {
    this.position.x = this.lastPosition.x = max.x;
  }
  if (this.position.y < min.y) {
    this.position.y = this.lastPosition.y = min.y;
  }
  else if (this.position.y > max.y) {
    this.position.y = this.lastPosition.y = max.y;
  }
};

Particle.prototype.getPoint = function() {
  return {
    x: this.position.x,
    y: this.position.y
  };
};

Particle.prototype.getVelocity = function() {
  return this.position.clone().sub(this.lastPosition);
};

Particle.prototype.integrate = function(time) {
  this._velocityBuffer
    .copy(this.position)
    .sub(this.lastPosition);

  this.acceleration
    .scale(time * time * 0.001);  // scale to units / second / second

  this.lastPosition.copy(this.position);

  this.position
    .add(this._velocityBuffer)
    .add(this.acceleration);

  this.acceleration.zero();
};

Particle.prototype.move = function(v) {
  this.position.add(v);
};

Particle.prototype.place = function(v) {
  this.position.copy(v);
  this.lastPosition.copy(this.position);
  return this;
};

Particle.prototype.setVelocity = function(v) {
  this.lastPosition.copy(this.position).sub(v);
};

module.exports = Particle;

},{"./vector":18}],13:[function(_dereq_,module,exports){
function Renderer() {

}

Renderer.prototype.render = function(sim) {
  this._sim = sim;
};

module.exports = Renderer;

},{}],14:[function(_dereq_,module,exports){
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

},{}],15:[function(_dereq_,module,exports){
var Renderer = _dereq_('../../renderer');
var GLUtil = _dereq_('./gl-util');
var onFrame = _dereq_('../../frame').onFrame;
var PointRenderer = _dereq_('./point-renderer');

var MAX_PARTICLES = 10000;

function GLRenderer(el) {
  if (!(this instanceof GLRenderer)) return new GLRenderer(el);

  this._drawFrame = this._drawFrame.bind(this);
  this._gl = GLUtil.getGLContext(el);
  this._gl.clearColor(0, 0, 0, 0);
  this._viewportArray = new Float32Array([el.width, el.height]);
  this._pointRenderer = new PointRenderer(this._gl, this._viewportArray);
}

GLRenderer.prototype = Object.create(Renderer.prototype);

GLRenderer.prototype.render = function(sim) {
  this._sim = sim;
  onFrame(this._drawFrame);
};

GLRenderer.prototype._drawFrame = function() {
  this._clear();
  this._pointRenderer.draw(this._sim.getParticles());
  onFrame(this._drawFrame);
};

GLRenderer.prototype._clear = function() {
  var gl = this._gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

module.exports = GLRenderer;


},{"../../frame":11,"../../renderer":13,"./gl-util":14,"./point-renderer":16}],16:[function(_dereq_,module,exports){
var GLUtil = _dereq_('./gl-util');

var MAX_POINTS = 10000;

var VERTEX_SHADER = [
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

var FRAGMENT_SHADER = [
  'precision mediump float;',
  'uniform sampler2D texture;',

  'void main() {',
    'gl_FragColor = texture2D(texture, gl_PointCoord);',
  '}'
].join('\n');

function PointRenderer(gl, viewportArray) {
  this._gl = gl;
  this._viewportArray = viewportArray;
  this._verticesCache = [];
  this._sizesCache = [];
  this._vArray = new Float32Array(MAX_POINTS * 2);
  this._sArray = new Float32Array(MAX_POINTS);
  this._texture = createCircleTexture(gl);
  this._shader = createCircleShader(gl, viewportArray);
  this._positionBuffer = gl.createBuffer();
  this._sizeBuffer = gl.createBuffer();
}

PointRenderer.prototype.draw = function(points) {
  var gl = this._gl;
  var vertices = this._verticesCache;
  var sizes = this._sizesCache;
  var vArray = this._vArray;
  var sArray = this._sArray;
  var attributes = this._shader.attributes;
  var point;

  vertices.length = 0;
  sizes.length = 0;

  for (var i = 0; i < points.length; i++) {
    point = points[i];
    vertices.push(point.position.x, point.position.y);
    sizes.push(4);
  }

  vArray.set(vertices, 0);
  sArray.set(sizes, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this._texture);

  // position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vArray, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attributes.position);

  // size buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this._sizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sArray, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attributes.size, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attributes.size);

  gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
};

module.exports = PointRenderer;

function createCircleTexture(gl, size) {
  size = size || 128;

  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext('2d');
  var rad = size * 0.5;

  ctx.beginPath();
  ctx.arc(rad, rad, rad, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();

  return GLUtil.createTexture(gl, canvas);
}

function createCircleShader(gl, viewportArray) {
  var vs = gl.createShader(gl.VERTEX_SHADER);
  var fs = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vs, VERTEX_SHADER);
  gl.shaderSource(fs, FRAGMENT_SHADER);

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

  program.uniforms = {
    viewport: gl.getUniformLocation(program, 'viewport')
  };

  program.attributes = {
    position: gl.getAttribLocation(program, 'position'),
    size: gl.getAttribLocation(program, 'size')
  };

  gl.useProgram(program);
  gl.uniform2fv(program.uniforms.viewport, viewportArray);

  return program;
}

},{"./gl-util":14}],17:[function(_dereq_,module,exports){
var Emitter = _dereq_('eventemitter2').EventEmitter2;
var onFrame = _dereq_('./frame').onFrame;
var Accumulator = _dereq_('./accumulator');

function Simulator() {
  if (!(this instanceof Simulator)) return new Simulator();

  Emitter.call(this);

  this._step = this._step.bind(this);
  this._stepInterval = 1000 / 60;     // TODO: option
  this._running = false;
  this._accumulator = undefined;
  this._particles = [];
  this._bodies = [];
  this._forces = [];
  this._constraints = [];
  this._iterations = 10;             // TODO: option
}

Simulator.prototype = Object.create(Emitter.prototype);

Simulator.prototype.start = function() {
  this._running = true;
  this._accumulator = new Accumulator(this._stepInterval, 100);
  onFrame(this._step);
};

Simulator.prototype.add = function(entity) {
  if (entity.type === 'Particle') this._particles.push(entity);
  else if (entity.type === 'Force') this._forces.push(entity);
  else if (entity.type === 'Constraint') {
    this._constraints.push(entity);
    this._constraints.sort(prioritySort);
  }
  else if (entity.type === 'Body') {
    this._bodies.push(entity);
    entity.setSimulator(this);
  }
};

Simulator.prototype.getParticles = function() {
  return this._particles;
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
  this._integrate(time);
  this._constrain(time);
};

Simulator.prototype._integrate = function(time) {
  var particles = this._particles;
  var forces = this._forces;
  var particle, force;

  for (var p = 0; p < particles.length; p++) {
    particle = particles[p];
    for (var f = 0; f < forces.length; f++) {
      force = forces[f];
      force.applyTo(particle);
    }
    particle.integrate(time);
  }
};

Simulator.prototype._constrain = function(time) {
  var constraints = this._constraints;
  var particles = this._particles;

  for (var i = 0; i < this._iterations; i++) {
    for (var c = 0; c < constraints.length; c++) {
      constraints[c].correct(time, particles);
    }
  }
};

module.exports = Simulator;

function prioritySort(a, b) {
  return b.priority - a.priority || b.id - a.id;
}

},{"./accumulator":2,"./frame":11,"eventemitter2":20}],18:[function(_dereq_,module,exports){
var pool = [];  // Vector object pooling (avoid GC)

function Vector(x, y) {
  if (!(this instanceof Vector)) return new Vector(x, y);
  this.x = x || 0;
  this.y = y || 0;
}


Vector.claim = function() {
  return pool.pop() || Vector();
};

Vector.getDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

Vector.pool = function(size) {
  if (typeof size !== 'undefined') {
    pool.length = 0;
    for (var i = 0; i < size; i++) {
      pool.push(Vector());
    }
  }
  else {
    return pool.length;
  }
};


Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.clone = function() {
  return Vector(this.x, this.y);
};

Vector.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};

Vector.prototype.equals = function(v) {
  return this.x === v.x && this.y === v.y;
};

Vector.prototype.pool = function() {
  return Vector.claim().copy(this);
};

Vector.prototype.free = function() {
  pool.push(this);
  return this;
};

Vector.prototype.getLength = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.min = function(v) {
  if (this.x < v.x) this.x = v.x;
  if (this.y < v.y) this.y = v.y;
  else return false;
};

Vector.prototype.max = function(v) {
  if (this.x > v.x) this.x = v.x;
  if (this.y > v.y) this.y = v.y;
  return this;
};

Vector.prototype.rotate = function(angle) {
  var x = this.x;
  var y = -this.y;
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  this.x = x * cos - y * sin;
  this.y = -(x * sin + y * cos);
  return this;
};

Vector.prototype.scale = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
  return this;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.zero = function() {
  this.x = this.y = 0;
  return this;
};


module.exports = Vector;


/*


// One-off vector for single computes

Vector.scratch = new Vector();

// Static methods

// New instances

// Setters

Vector.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

// Add

Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.addXY = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};

Vector.prototype.subXY = function(x, y) {
  this.x -= x;
  this.y -= y;
  return this;
};

Vector.prototype.merge = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  if (dx > 0 && this.x >= 0) this.x += dx;
  else if (dx < 0 && this.x <= 0) this.x += dx;
  if (dy > 0 && this.y >= 0) this.y += dy;
  else if (dy < 0 && this.y <= 0) this.y += dy;
  return this;
};

// Scale

Vector.prototype.mult = function(v) {
  this.x *= v.x;
  this.y *= v.y;
  return this;
};

Vector.prototype.div = function(v) {
  this.x /= v.x;
  this.y /= v.y;
  return this;
};

Vector.prototype.reverse = function() {
  this.x = -this.x;
  this.y = -this.y;
  return this;
};

Vector.prototype.unit = function() {
  this.scale(1 / this.getLength());
  return this;
};

// Rotate

Vector.prototype.turnRight = function() {
  var x = this.x;
  var y = this.y;
  this.x = -y;
  this.y = x;
  return this;
};

Vector.prototype.turnLeft = function() {
  var x = this.x;
  var y = this.y;
  this.x = y;
  this.y = -x;
  return this;
};

Vector.prototype.rotateAbout = function(pivot, angle) {
  this.sub(pivot).rotateBy(angle).add(pivot);
  return this;
};

// Get

Vector.prototype.getDot = function(v) {
  return this.x * v.x + this.y * v.y;
};

Vector.prototype.getCross = function(v) {
  return this.x * v.y + this.y * v.x;
};

Vector.prototype.getLength = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getLength2 = function() {
  // Squared length
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.getAngle = function() {
  return Math.atan2(-this.y, this.x);
};

Vector.prototype.getAngleTo = function(v) {
  // The nearest angle between two vectors
  // (origin of 0,0 for both)
  var cos = this.x * v.x + this.y * v.y;
  var sin = this.y * v.x - this.x * v.y;

  return Math.atan2(sin, cos);
};

// If projection >= 0, it's in this half plane
// Otherwise, it isn't
Vector.prototype.getProjection = function(vPoint, vDir) {
  return this.clone().sub(vPoint).getDot(vDir);
};

Vector.prototype.applyProjection = function(projection, vDir) {
  this.sub(dir.clone().scale(projection));
  return this;
};

Vector.prototype.projectOnto = function(vPoint, vDir) {
  var projection = this.clone().sub(vPoint).getDot(vDir);
  this.sub(vDir.clone().scale(projection));
  return this;
};

Vector.prototype.projectSegment = function(vA, vB) {
  var normal = vB.clone().sub(vA).turnLeft().unit();
  var projection = this.clone().sub(vA).getDot(normal);
  this.sub(normal.scale(projection));

  if (this.x > vA.x && this.x > vB.x) this.x = Math.max(vA.x, vB.x);
  else if (this.x < vA.x && this.x < vB.x) this.x = Math.min(vA.x, vB.x);
  if (this.y > vA.y && this.y > vB.y) this.y = Math.max(vA.y, vB.y);
  else if (this.y < vA.y && this.y < vB.y) this.y = Math.min(vA.y, vB.y);

  return this;
};

*/

},{}],19:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],20:[function(_dereq_,module,exports){
(function (process){
;!function(exports, undefined) {

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

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return EventEmitter;
    });
  } else {
    exports.EventEmitter2 = EventEmitter;
  }

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

}).call(this,_dereq_("/Users/hunter/code/newton/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/hunter/code/newton/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":19}]},{},[1])
(1)
});