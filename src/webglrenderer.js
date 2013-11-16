;(function(Newton) {

  'use strict'

  var PARTICLE_VS = [

    'uniform vec2 viewport;',
    'attribute vec3 position;',
    'attribute float size;',

    'void main() {',
      'vec2 scaled = ((position.xy / viewport) * 2.0) - 1.0;',
      'vec2 flipped = vec2(scaled.x, -scaled.y);',

      'gl_Position = vec4(flipped, 0, 1);',
      'gl_PointSize = size * 4.0;',
    '}'
  ].join('\n');

  var PARTICLE_FS = [
    'precision mediump float;',
    'uniform sampler2D texture;',

    'void main(void) {',
      'gl_FragColor = texture2D(texture, gl_PointCoord);',
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

    console.log('Program Linked', gl.getProgramParameter(program, gl.LINK_STATUS));

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
    this.vArray = new Float32Array(30000);
    this.sArray = new Float32Array(10000);

    this.callback = this.callback.bind(this); // TODO: shim for Function.bind

    this.gl.viewport(0, 0, this.width, this.height);
    this.viewportArray = new Float32Array([this.width, this.height]);

    console.log('width, height:', this.width, this.height);

    this.initShaders();
    this.initBuffers();

    this.particleTexture = createCircleTexture(this.gl);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

    this.gl.enable(this.gl.BLEND);
  }

  GLRenderer.prototype = {
    initShaders: function() {
      var gl = this.gl;
      this.particleShader = createShaderProgram(gl, PARTICLE_VS, PARTICLE_FS);
      this.particleShader.uniforms = {
        viewport: gl.getUniformLocation(this.particleShader, 'viewport')
      };
      this.particleShader.attributes = {
        position: gl.getAttribLocation(this.particleShader, 'position'),
        size: gl.getAttribLocation(this.particleShader, 'size')
      };
      console.log('particleShader:', this.particleShader);
    },
    initBuffers: function() {
      var gl = this.gl;
      this.particlePositionBuffer = gl.createBuffer();
      this.particleSizeBuffer = gl.createBuffer();
    },
    callback: function(time, sim) {
      this.clear(time);
      this.drawParticles(sim.particles);

      return;

      this.drawConstraints(ctx, sim.constraints);
      this.drawEdges(ctx, sim.edges);

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

      for (var i = 0, ilen = sim.particles.length; i < ilen; i++) {
        particle = sim.particles[i];
        vertices.push(particle.position.x, particle.position.y, 0);
        sizes.push(1);
      }

      this.vArray.set(vertices, 0);
      this.sArray.set(sizes, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.particleTexture);

      gl.useProgram(this.particleShader);
      gl.uniform2fv(this.particleShader.uniforms.viewport, this.viewportArray);

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

      return;
    },
    drawConstraints: function(ctx, constraints) {
      var coords;
      var constraint;

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 100, 255, 1)';
      ctx.lineWidth = 1;

      for (var i = 0, ilen = constraints.length; i < ilen; i++) {
        constraint = constraints[i];

        if (constraint.category === 'linear') {
          coords = constraint.getCoords();
          ctx.beginPath();
          ctx.moveTo(coords.x1, coords.y1);
          ctx.lineTo(coords.x2, coords.y2);
          ctx.closePath();
          ctx.stroke();
        }
        else if (constraint.category === 'rigid') {
          coords = constraint.centerMass;
          ctx.beginPath();
          ctx.moveTo(coords.x - 3, coords.y - 3);
          ctx.lineTo(coords.x + 3, coords.y + 3);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
    },
    drawEdges: function(ctx, edges) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      var edge, i = edges.length;
      while (i--) {
        edge = edges[i].getCoords();
        ctx.beginPath();
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      return edges.length;
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

