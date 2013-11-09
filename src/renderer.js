;(function(Newton) {

  'use strict'

  function Renderer(el) {
    if (!(this instanceof Renderer)) return new Renderer(el);

    this.ctx = el.getContext('2d');
    this.width = el.width;
    this.height = el.height;
    this.callback = this.callback.bind(this); // TODO: shim for Function.bind
  }

  Renderer.prototype = {
    callback: function(time, sim) {
      var ctx = this.ctx;

      debugger;


      this.clear(ctx, time);
      this.drawConstraints(ctx, sim.constraints);
      this.drawEdges(ctx, sim.edges);
      this.drawParticles(ctx, sim.particles);
      this.drawForces(ctx, sim.forces);
      this.drawCounts(ctx, sim.particles.length, sim.edges.length);
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
      ctx.lineCap = 'butt';

      for (var j = 0, jlen = particles.length; j < jlen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastValidPosition;
        mass = particle.getMass();
        brightness = ~~((mass - 1) / 5 * 128);

        ctx.beginPath();
        ctx.lineWidth = mass;
        if (particle.colliding) {
          ctx.strokeStyle = 'rgba(255, 255, 100, 1)';
        }
        else {
          ctx.strokeStyle = 'rgba(' + [255, 28 + brightness, 108 + brightness].join(',') + ', 1)';
        }
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pos.x, pos.y + 2);
        ctx.stroke();
      }

      ctx.restore();

      return particles.length;
    },
    drawConstraints: function(ctx, constraints) {
      var constraint, p1, p2;

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 100, 255, 0.25)';
      ctx.lineWidth = 1;
      for (var i = 0, ilen = constraints.length; i < ilen; i++) {
        constraint = constraints[i].getCoords();
        ctx.beginPath();
        ctx.moveTo(constraint.x1, constraint.y1);
        ctx.lineTo(constraint.x2, constraint.y2);
        ctx.closePath();
        ctx.stroke();
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

  Newton.Renderer = Renderer;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);

