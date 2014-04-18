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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
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

  Newton.Renderer = Renderer;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);

