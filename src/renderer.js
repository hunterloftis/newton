function Renderer(el) {
  this.ctx = el.getContext('2d');
  this.width = el.width;
  this.height = el.height;
}

Renderer.prototype = {
  render: function(time, correction) {
    var ctx = this.ctx;
    this.clear(ctx, time);
    this.drawParticles(ctx);
    this.drawWalls(ctx);
    this.drawParticleCount(ctx);
    this.drawFPS(ctx);
  },
  clear: function(ctx, time) {
    var alpha = Math.min(1, time / 64);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  },
  drawParticles: function(ctx) {
    ctx.save();
    var i, group, glen, j, particles, particle, plen, pos, last, mass;

    glen = system.groups.length;
    for (i = 0; i < glen; i++) {
      group = system.groups[i];
      particles = group.particles
      plen = particles.length;

      ctx.beginPath();
      ctx.strokeStyle = ctx.fillStyle = group.color;
      ctx.lineWidth = 1;

      for (j = 0; j < plen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastValidPosition;
        mass = particle.getMass();

        for (var k = 0; k < mass; k++) {
          ctx.moveTo(last.x - k, last.y - mass * 0.25);
          ctx.lineTo(pos.x - k, pos.y + mass * 0.25);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
    return;
  },
  drawWalls: function(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(100, 200, 255, 1)';
    var wall, i = walls.length;
    while (i--) {
      wall = walls[i];
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.closePath();
      ctx.stroke();
      ctx.stroke();
    }
    ctx.restore();
  },
  drawParticleCount: function(ctx) {
    var text = 'Particles: ' + system.particles.length;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '10pt Helvetica';
    ctx.fillText(text, 10, 20);
    ctx.restore();
  },
  drawFPS: function(ctx) {
    var text = 'FPS: ' + gameloop.fps;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '10pt Helvetica';
    ctx.fillText(text, 10, 40);
    ctx.restore();
  }
};