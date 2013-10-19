function Renderer(el) {
  this.ctx = el.getContext('2d');
  this.width = el.width;
  this.height = el.height;
  this.particleColor = '#ffffff';
}

Renderer.prototype = {
  setParticleColor: function(color) {
    this.particleColor = color;
  },
  render: function(system, time) {
    var ctx = this.ctx;
    this.clear(ctx, time);
    this.drawParticles(ctx, system.particles);
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
  drawParticles: function(ctx, particles) {
    var particle, pos, last, mass, colorIndex;

    ctx.save();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = this.particleColor;

    for (var j = 0, jlen = particles.length; j < jlen; j++) {
      particle = particles[j];
      pos = particle.position;
      last = particle.lastValidPosition;
      mass = particle.getMass();

      ctx.beginPath();
      ctx.lineWidth = mass;
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y + 0.25);
      ctx.stroke();
    }

    ctx.restore();
  },
  drawWalls: function(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    var wall, i = walls.length;
    while (i--) {
      wall = walls[i];
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.closePath();
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