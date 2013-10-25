;(function() {

  function Renderer(el) {
    if (!(this instanceof Renderer)) return new Renderer(el);
    var self = this;
    this.ctx = el.getContext('2d');
    this.width = el.width;
    this.height = el.height;
    this.callback = this.callback.bind(this); // TODO: shim for Function.bind
  }

  Renderer.prototype = {
    callback: function(time, sim) {
      var ctx = this.ctx;
      var particleCount = 0;
      var edgeCount = 0;

      this.clear(ctx, time);

      for (var i = 0, ilen = sim.layers.length; i < ilen; i++) {
        for (var j = 0, jlen = sim.layers[i].bodies.length; j < jlen; j++) {
          particleCount += this.drawParticles(ctx, sim.layers[i].bodies[j].particles);
          edgeCount += this.drawEdges(ctx, sim.layers[i].bodies[j].edges);
        }
        this.drawForces(ctx, sim.layers[i].forces);
      }

      this.drawCounts(ctx, particleCount, edgeCount);
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
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.15)';

      for (var i = 0, ilen = forces.length; i < ilen; i++) {
        var force = forces[i];
        if (force instanceof Newton.RadialGravity) {
          ctx.beginPath();
          ctx.arc(force.x, force.y, force.strength * force.strength * 0.5, 0, 2 * Math.PI, false);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    drawParticles: function(ctx, particles) {
      var particle, pos, last, mass, brightness;

      ctx.save();
      ctx.lineCap = 'butt';

      for (var j = 0, jlen = particles.length; j < jlen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastValidPosition;
        mass = particle.getMass();
        brightness = ~~((mass - 1) / 5 * 128);

        ctx.beginPath();
        ctx.lineWidth = mass;
        ctx.strokeStyle = 'rgba(' + [255, 28 + brightness, 108 + brightness].join(',') + ', 1)';
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y + 2);
        ctx.stroke();
      }

      ctx.restore();

      return particles.length;
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
    drawCounts: function(ctx, particleCount, edgeCount) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '10pt Helvetica';
      ctx.fillText('Particles: ' + particleCount, 10, 20);
      ctx.fillText('Edges: ' + edgeCount, 10, 40);
      ctx.restore();
    },
    drawFPS: function(ctx, sim) {
      var text = 'FPS: ' + sim.fps;
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '10pt Helvetica';
      ctx.fillText(text, 10, 60);
      ctx.restore();
    }
  };

  window.Newton = window.Newton || {};
  window.Newton.Renderer = Renderer;

})();
