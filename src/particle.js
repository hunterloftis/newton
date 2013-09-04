function Particle(x, y, m, restitution) {
  this.position = new Vector(x, y);
  this.lastPosition = this.position.clone();
  this.lastValidPosition = this.position.clone();
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.mass = m || 1.0;
  this.restitution = restitution || 1;
  this.drag = 0;
}

Particle.MASS_MIN = 1;
Particle.MASS_MAX = 5;

Particle.createRandom = function(x, y, spread) {
  var mass = Math.random() * (Particle.MASS_MAX - Particle.MASS_MIN) + Particle.MASS_MIN;
  var x = Math.random() * spread * 2 + x - spread;
  var y = Math.random() * spread * 2 + y - spread;
  return new Particle(x, y, mass);
};

Particle.getMassRange = function() {
  return Particle.MASS_MAX - Particle.MASS_MIN;
};

Particle.prototype.isSlow = function() {
  return this.velocity.getSquaredLength() <= 1;
};

Particle.prototype.integrate = function(time, correction) {

  // Find velocity
  this.velocity
    .copy(this.position)
    .sub(this.lastPosition)
    .scale(correction)
    .scale(1 - this.drag);

  // Set acceleration based on time squared
  this.acceleration
    .scale(1 - this.drag)
    .scale(time * time);

  // Record last location
  this.lastPosition.copy(this.position);

  // Time-Corrected Verlet integration (TCV)
  this.position
    .add(this.velocity)
    .add(this.acceleration);

  // Reset acceleration after integration
  this.acceleration.zero();

  // Reset last valid position after integration
  this.lastValidPosition.copy(this.lastPosition);
};

Particle.prototype.placeAt = function(x, y) {
  this.position.set(x, y);
  this.lastPosition.copy(this.position);
  this.lastValidPosition.copy(this.lastPosition);
  return this;
};

Particle.prototype.moveBy = function(dx, dy) {
  this.lastPosition = this.position.clone();
  this.position.add(dx, dy);
  return this;
};

Particle.prototype.setVelocity = function(x, y) {
  this.lastPosition.copy(this.position).subXY(x, y);
  return this;
};

Particle.prototype.contain = function(bounds) {
  if (this.position.x > bounds.right) {
    this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.right;
  }
  else if (this.position.x < bounds.left) {
    this.position.x = this.lastPosition.x = this.lastValidPosition.x = bounds.left;
  }
  if (this.position.y > bounds.bottom) {
    this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.bottom;
  }
  else if (this.position.y < bounds.top) {
    this.position.y = this.lastPosition.y = this.lastValidPosition.y = bounds.top;
  }
};

Particle.prototype.force = function(x, y, mass) {
  mass = mass || this.mass;
  this.acceleration.add({
    x: x / mass,
    y: y / mass
  });
};

Particle.prototype.gravitate = function(x, y, m) {
  var delta = new Vector(x, y).sub(this.position);
  var r = delta.getLength();
  var f = (m * this.mass) / (r * r);
  var ratio = m / (m + this.mass);

  this.acceleration.add({
    x: f * (delta.x / r) * ratio,
    y: f * (delta.y / r) * ratio
  });
};

Particle.prototype.collide = function(walls) {
  var nearest, intersect;
  var dx, dy, oldDistance, newDistance;
  var i = walls.length;

  while (i--) {
    intersect = walls[i].findIntersection(
      this.lastPosition.x, this.lastPosition.y,
      this.position.x, this.position.y);

    if (intersect) {
      dx = intersect.x - this.lastPosition.x;
      dy = intersect.y - this.lastPosition.y;
      if (nearest) {
        oldDistance = nearest.dx * nearest.dx + nearest.dy * nearest.dy;
        newDistance = dx * dx + dy * dy;
        if (newDistance < oldDistance) {
          nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            wall: walls[i]
          };
        }
      }
      else {
        nearest = {
          dx: dx,
          dy: dy,
          x: intersect.x,
          y: intersect.y,
          wall: walls[i]
        };
      }
    }
  }
  if (nearest) {
    var velocity = this.position.clone().sub(this.lastPosition);
    var bouncePoint = nearest.wall.getRepelled(nearest.x, nearest.y);
    var reflectedVelocity = nearest.wall.getReflection(velocity, nearest.wall.friction, this.restitution);

    this.position.copy(bouncePoint);
    this.setVelocity(reflectedVelocity.x, reflectedVelocity.y);
    this.lastValidPosition = bouncePoint;

    return nearest;
  }
};


if (typeof module !== 'undefined') module.exports = Particle;
