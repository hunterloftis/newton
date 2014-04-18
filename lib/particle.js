var Vector = require('./vector');

function Particle(x, y, size) {
  if (!(this instanceof Particle)) return new Particle(x, y, size);
  this.size = size || 1;
  this.position = Vector(x, y);
  this.lastPosition = Vector(x, y);
  this.acceleration = Vector(0, 0);
  this._velocityBuffer = Vector(0, 0);
}

Particle.prototype.type = 'Particle';

Particle.prototype.accelerate = function(v) {
  this.acceleration.add(v);
};

Particle.prototype.bound = function(min, max) {
  this.position.min(min).max(max);
};

Particle.prototype.correct = function(v) {
  this.position.add(v);
};

Particle.prototype.integrate = function(time) {
  this._velocityBuffer
    .copy(this.position)
    .sub(this.lastPosition);

  this.acceleration
    .scale(time * time);

  this.lastPosition.copy(this.position);

  this.position
    .add(this._velocityBuffer)
    .add(this.acceleration);

  this.acceleration.zero();
};

Particle.prototype.place = function(v) {
  this.position.copy(v);
  this.lastPosition.copy(this.position);
  return this;
};

module.exports = Particle;
