var Vector = require('./vector');

function Particle(x, y, size) {
  if (!(this instanceof Particle)) return new Particle(x, y, size);
  this.position = Vector(x, y);
}

Particle.prototype.type = 'Particle';

module.exports = Particle;
