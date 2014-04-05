var Renderer = require('../../renderer');
var GLUtil = require('./gl-util');
var onFrame = require('../../frame').onFrame;

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

