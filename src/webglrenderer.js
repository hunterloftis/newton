;(function(Newton) {

  'use strict'

  var PARTICLE_VS = [

    'uniform vec2 viewport;',
    'attribute vec3 position;',
    'attribute float size;',

    'void main() {',

      'vec3 p = position;',
      'float s = size;',

      'vec2 zeroToOne = position.xy / viewport;',
      'zeroToOne.y = 1.0 - zeroToOne.y;',

      'vec2 zeroToTwo = zeroToOne * 2.0;',

      'vec2 clipSpace = zeroToTwo - 1.0;',

      'vec2 test = vec2(100, 100);',

      'gl_Position = vec4(clipSpace, 0, 1);',
      'gl_PointSize = 128.0;',  // size * 2.0
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

    this.callback = this.callback.bind(this); // TODO: shim for Function.bind

    this.gl.viewport(0, 0, this.width, this.height);
    console.log('width, height:', this.width, this.height);
    this.initShaders();
    this.initBuffers();

    this.particleTexture = createCircleTexture(this.gl);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

    this.gl.enable(this.gl.VERTEX_PROGRAM_POINT_SIZE);
    this.gl.enable(this.gl.TEXTURE_2D);
    this.gl.enable(this.gl.BLEND);
  }

  var last = 0;

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
      var gl = this.gl;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var vertices = [];
      var sizes = [];
      var particle;

      for (var i = 0, ilen = sim.particles.length; i < ilen; i++) {
        particle = sim.particles[i];
        vertices.push(particle.position.x, particle.position.y, 0);
        sizes.push(1);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.particleTexture);

      gl.useProgram(this.particleShader);

      // position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.particleShader.attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.particleShader.attributes.position);

      // size buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particleSizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
      gl.vertexAttribPointer(this.particleShader.attributes.size, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(this.particleShader.attributes.size);

      gl.drawArrays(gl.POINTS, 0, vertices.length / 3);

      if (ilen > last) {
        last = ilen;
        console.log('vertices:', vertices.length / 3, 'particles:', sim.particles.length);
      }

      return;

      this.clear(ctx, time);
      this.drawConstraints(ctx, sim.constraints);
      this.drawEdges(ctx, sim.edges);
      this.drawParticles(ctx, sim.particles);
      this.drawForces(ctx, sim.forces);
      this.drawCounts(ctx, {
        particles: sim.particles.length,
        edges: sim.edges.length,
        forces: sim.forces.length,
        constraints: sim.constraints.length
      });
      this.drawFPS(ctx, sim);
    },
    clear: function(ctx, time) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
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
    drawParticles: function(ctx, particles) {
      var particle, pos, last, mass, brightness;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (var j = 0, jlen = particles.length; j < jlen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastValidPosition;
        mass = particle.getMass();

        ctx.beginPath();

        if (particle.pinned) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
          ctx.lineWidth = 1;
          ctx.moveTo(last.x - 3, last.y - 3);
          ctx.lineTo(last.x + 3, last.y + 3);
          ctx.moveTo(last.x + 3, last.y - 3);
          ctx.lineTo(last.x - 3, last.y + 3);
        }
        else {
          ctx.lineWidth = ~~(mass / 3) + 2;
          ctx.strokeStyle = particle.colliding ?
            'rgba(255, 255, 100, 1)' : 'rgba(255, 28, 108, 1)';
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(pos.x + 1, pos.y);
        }
        ctx.stroke();
      }

      ctx.restore();
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
    drawFPS: function(ctx, sim) {
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

