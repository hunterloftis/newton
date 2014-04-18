var Renderer = require('../../renderer');
var GLUtil = require('./gl-util');
var onFrame = require('../../frame').onFrame;
var PointRenderer = require('./point-renderer');

var MAX_PARTICLES = 10000;

function GLRenderer(el) {
  if (!(this instanceof GLRenderer)) return new GLRenderer(el);

  this._drawFrame = this._drawFrame.bind(this);
  this._gl = GLUtil.getGLContext(el);
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

