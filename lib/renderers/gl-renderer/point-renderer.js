var GLUtil = require('./gl-util');

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
