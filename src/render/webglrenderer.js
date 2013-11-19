;(function(Newton) {

  'use strict'

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

  var LINE_VS = [
    'uniform vec2 viewport;',
    'attribute vec3 position;',

    'void main() {',
      'vec2 scaled = ((position.xy / viewport) * 2.0) - 1.0;',
      'vec2 flipped = vec2(scaled.x, -scaled.y);',

      'gl_Position = vec4(flipped, 0, 1);',
    '}'
  ].join('\n');

  var PARTICLE_FS = [
    'precision mediump float;',
    'uniform sampler2D texture;',

    'void main() {',
      'gl_FragColor = texture2D(texture, gl_PointCoord);',
    '}'
  ].join('\n');

  var CONSTRAINT_FS = [
    'void main() {',
      'gl_FragColor = vec4(0.0, 0.5, 1.0, 1.0);',
    '}'
  ].join('\n');

  var EDGE_FS = [
    'void main() {',
      'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
    '}'
  ].join('\n');

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

  function GLRenderer(el) {
    if (!(this instanceof GLRenderer)) return new GLRenderer(el);

    this.el = el;
    this.width = el.width;
    this.height = el.height;
    this.gl = getGLContext(el);

    this.vertices = [];
    this.sizes = [];
    // TODO: convert this from a vec3 to a vec2
    this.vArray = new Float32Array(GLRenderer.MAX_PARTICLES * 3);
    this.sArray = new Float32Array(GLRenderer.MAX_PARTICLES);

    this.callback = this.callback.bind(this); // TODO: shim for Function.bind

    this.gl.viewport(0, 0, this.width, this.height);
    this.viewportArray = new Float32Array([this.width, this.height]);

    this.initShaders();
    this.initBuffers();

    this.particleTexture = createCircleTexture(this.gl);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.enable(this.gl.BLEND);
  }

  GLRenderer.MAX_PARTICLES = 10000;

  GLRenderer.prototype = {
    initShaders: function() {
      var gl = this.gl;

      // particles
      this.particleShader = createShaderProgram(gl, POINT_VS, PARTICLE_FS);
      this.particleShader.uniforms = {
        viewport: gl.getUniformLocation(this.particleShader, 'viewport')
      };
      this.particleShader.attributes = {
        position: gl.getAttribLocation(this.particleShader, 'position'),
        size: gl.getAttribLocation(this.particleShader, 'size')
      };
      gl.useProgram(this.particleShader);
      gl.uniform2fv(this.particleShader.uniforms.viewport, this.viewportArray);

      // edges
      this.edgeShader = createShaderProgram(gl, LINE_VS, EDGE_FS);
      this.edgeShader.uniforms = {
        viewport: gl.getUniformLocation(this.edgeShader, 'viewport')
      };
      this.edgeShader.attributes = {
        position: gl.getAttribLocation(this.edgeShader, 'position')
      };
      gl.useProgram(this.edgeShader);
      gl.uniform2fv(this.edgeShader.uniforms.viewport, this.viewportArray);

      // constraints
      this.constraintShader = createShaderProgram(gl, LINE_VS, CONSTRAINT_FS);
      this.constraintShader.uniforms = {
        viewport: gl.getUniformLocation(this.constraintShader, 'viewport')
      };
      this.constraintShader.attributes = {
        position: gl.getAttribLocation(this.constraintShader, 'position')
      };
      gl.useProgram(this.constraintShader);
      gl.uniform2fv(this.constraintShader.uniforms.viewport, this.viewportArray);
    },
    initBuffers: function() {
      var gl = this.gl;
      this.particlePositionBuffer = gl.createBuffer();
      this.particleSizeBuffer = gl.createBuffer();
      this.edgePositionBuffer = gl.createBuffer();
    },
    callback: function(time, sim) {
      this.clear(time);
      this.drawParticles(sim.particles);
      this.drawEdges(sim.edges);
      this.drawConstraints(sim.constraints);
      return;




      this.drawForces(ctx, sim.forces);
      this.drawCounts(ctx, {
        particles: sim.particles.length,
        edges: sim.edges.length,
        forces: sim.forces.length,
        constraints: sim.constraints.length
      });
      this.drawFPS(sim);
    },
    clear: function(time) {
      var gl = this.gl;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },
    drawForces: function(ctx, forces) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

      for (var i = 0, ilen = forces.length; i < ilen; i++) {
        var force = forces[i];
        if (force instanceof Newton.RadialGravity) {
          ctx.beginPath();
          ctx.arc(force.x, force.y, force.strength * force.strength * 0.5, 0, 2 * Math.PI, false);
          ctx.fill();
        }
      }

      ctx.restore();
    },
    drawParticles: function(particles) {
      var gl = this.gl;

      var vertices = this.vertices;
      var sizes = this.sizes;

      vertices.length = 0;
      sizes.length = 0;

      var particle;

      for (var i = 0, ilen = particles.length; i < ilen; i++) {
        particle = particles[i];
        vertices.push(particle.position.x, particle.position.y, 0);
        sizes.push(particle.size < 8 ? particle.size : 8);
      }

      if (vertices.length > this.vArray.length) throw new Error('vArray too small to hold vertices');
      this.vArray.set(vertices, 0);
      if (sizes.length > this.sArray.length) throw new Error('sArray too small to hold sizes');
      this.sArray.set(sizes, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.particleTexture);

      // TODO: necessary?
      gl.useProgram(this.particleShader);

      // position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vArray, gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.particleShader.attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.particleShader.attributes.position);

      // size buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particleSizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sArray, gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.particleShader.attributes.size, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.particleShader.attributes.size);

      gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
    },
    drawConstraints: function(constraints) {
      var gl = this.gl;

      var vertices = [];
      var constraint, coords;

      for (var i = 0, ilen = constraints.length; i < ilen; i++) {
        constraint = constraints[i];
        if (constraint.category === 'linear') {
          coords = constraint.getCoords();
          vertices.push(coords.x1, coords.y1, 0);
          vertices.push(coords.x2, coords.y2, 0);
        }

      }

      // TODO: necessary?
      gl.useProgram(this.constraintShader);

      // position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.edgePositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.constraintShader.attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.constraintShader.attributes.position);

      gl.lineWidth(1);
      gl.drawArrays(gl.LINES, 0, vertices.length / 3);
    },
    drawEdges: function(edges) {
      var gl = this.gl;

      var vertices = [];
      var edge;

      for (var i = 0, ilen = edges.length; i < ilen; i++) {
        edge = edges[i].getCoords();
        vertices.push(edge.x1, edge.y1, 0);
        vertices.push(edge.x2, edge.y2, 0);
      }

      // TODO: necessary?
      gl.useProgram(this.edgeShader);

      // position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.edgePositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.edgeShader.attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.edgeShader.attributes.position);

      gl.lineWidth(3);
      gl.drawArrays(gl.LINES, 0, vertices.length / 3);
    },
    drawCounts: function(ctx, counts) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '10pt Helvetica';
      ctx.fillText('Particles: ' + counts.particles, 10, 20);
      ctx.fillText('Edges: ' + counts.edges, 10, 40);
      ctx.fillText('Forces: ' + counts.forces, 10, 60);
      ctx.fillText('Constraints: ' + counts.constraints, 10, 80);
      ctx.restore();
    },
    drawFPS: function(sim) {
      var text = 'FPS: ' + sim.fps;
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '10pt Helvetica';
      ctx.fillText(text, 10, 120);
      ctx.restore();
    }
  };

  Newton.GLRenderer = GLRenderer;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);

