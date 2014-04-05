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
