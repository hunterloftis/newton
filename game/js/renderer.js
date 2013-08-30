function Renderer(el) {
  this.ctx = el.getContext('2d');
}

Renderer.prototype = {
  render: function() {
    var ctx = this.ctx;
    this.clear(ctx);
    this.drawParticles(ctx);
    this.drawWalls(ctx);
    this.drawParticleCount(ctx);
    this.drawFPS(ctx);
  },
  clear: function(ctx) {
    ctx.save();
    ctx.fillStyle = CLEAR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  },
  drawParticles: function(ctx) {
    ctx.save();
    var i, group, glen, j, particles, particle, plen, pos, last;

    glen = system.groups.length;
    for (i = 0; i < glen; i++) {
      group = system.groups[i];
      particles = group.particles
      plen = particles.length;

      ctx.beginPath();
      ctx.strokeStyle = group.color;
      ctx.lineWidth = 1;

      for (j = 0; j < plen; j++) {
        particle = particles[j];
        pos = particle.position;
        last = particle.lastPosition;

        for (var k = 0; k < particle.mass; k++) {
          ctx.moveTo(last.x - k, last.y);
          ctx.lineTo(pos.x - k, pos.y);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
    return;

    while (i--) {
      dot = system.particles[i];
      pos = dot.position;
      last = dot.lastPosition;
      if(Math.abs(pos.x - last.x) < 1 && Math.abs(pos.y - last.y) < 1) {
        ctx.fillStyle = COLORS[~~dot.mass + 1];
        ctx.fillRect(pos.x - dot.mass, pos.y - dot.mass, dot.mass * 2, dot.mass * 2);
      }
    }
    // each color
    for (m = MASS_MIN; m <= MASS_MAX; m++) {
      ctx.strokeStyle = COLORS[m];
      ctx.lineWidth = m;
      ctx.beginPath();
      i = system.particles.length;
      while (i--) {
        dot = system.particles[i];
        if ((dot.mass > m-1) && (dot.mass <= m)) {
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(pos.x, pos.y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  },
  drawWalls: function(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(100, 200, 255, 1)';
    var segment, i = segments.length;
    while (i--) {
      segment = segments[i];
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.closePath();
      ctx.stroke();
      ctx.stroke();
    }
    ctx.restore();
  },
  drawParticleCount: function(ctx) {
    var text = system.particles.length ? 'Particles: ' + system.particles.length : '(click to add particles)';
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