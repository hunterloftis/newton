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
  if (this.position.x < min.x) {
    this.position.x = this.lastPosition.x = min.x;
  }
  else if (this.position.x > max.x) {
    this.position.x = this.lastPosition.x = max.x;
  }
  if (this.position.y < min.y) {
    this.position.y = this.lastPosition.y = min.y;
  }
  else if (this.position.y > max.y) {
    this.position.y = this.lastPosition.y = max.y;
  }
};

Particle.prototype.getPoint = function() {
  return {
    x: this.position.x,
    y: this.position.y
  };
};

Particle.prototype.getVelocity = function() {
  return this.position.clone().sub(this.lastPosition);
};

Particle.prototype.integrate = function(time) {
  this._velocityBuffer
    .copy(this.position)
    .sub(this.lastPosition);

  this.acceleration
    .scale(time * time * 0.001);  // scale to units / second / second

  this.lastPosition.copy(this.position);

  this.position
    .add(this._velocityBuffer)
    .add(this.acceleration);

  this.acceleration.zero();
};

Particle.prototype.move = function(v) {
  this.position.add(v);
};

Particle.prototype.place = function(v) {
  this.position.copy(v);
  this.lastPosition.copy(this.position);
  return this;
};

Particle.prototype.setVelocity = function(v) {
  this.lastPosition.copy(this.position).sub(v);
};

module.exports = Particle;
