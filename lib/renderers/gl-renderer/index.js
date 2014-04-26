var Renderer = require('../../renderer');
var GLUtil = require('./gl-util');
var onFrame = require('../../frame').onFrame;
var Vector = require('../../vector');
var PointRenderer = require('./point-renderer');
var Emitter = require('eventemitter2').EventEmitter2;
var extend = require('lodash').extend;

var MAX_PARTICLES = 10000;

function GLRenderer(el) {
  if (!(this instanceof GLRenderer)) return new GLRenderer(el);

  Emitter.call(this);

  this._el = el;
  this._drawFrame = this._drawFrame.bind(this);
  this._gl = GLUtil.getGLContext(el);
  this._gl.clearColor(0, 0, 0, 0);
  this._viewportArray = new Float32Array([el.width, el.height]);
  this._pointRenderer = new PointRenderer(this._gl, this._viewportArray);

  this._listen();
}

GLRenderer.prototype = Object.create(Renderer.prototype);
extend(GLRenderer.prototype, Emitter.prototype);

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

GLRenderer.prototype._listen = function() {
  var self = this;
  var canvas = this._el;
  this._el.addEventListener('mousedown', function onDown(e) {
    var x = event.clientX - document.documentElement.scrollLeft - canvas.offsetLeft;
    var y = event.clientY - document.documentElement.scrollTop - canvas.offsetTop;
    self.emit('pointerdown', Vector(x, y));
  });
};

module.exports = GLRenderer;

