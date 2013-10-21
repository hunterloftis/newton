function Renderer(el) {
  this.ctx = el.getContext('2d');
  this.width = el.width;
  this.height = el.height;
}

Renderer.prototype = {
  render: function(system, time) {
    var ctx = this.ctx;
    this.clear(ctx, time);
    this.drawParticles(ctx, system.particles);
    this.drawWalls(ctx);
    this.drawParticleCount(ctx);
    this.drawFPS(ctx);
  },
  clear: function(ctx, time) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);
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