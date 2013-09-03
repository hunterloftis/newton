function Particle(x, y, m) {
  this.position = new Vector(x, y);
  this.lastPosition = this.position.clone();
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.mass = m || 1.0;
  this.elasticity = 0.5;
  this.drag = 0.9999;
  this.bounds = undefined;
}

Particle.MASS_MIN = 1;
Particle.MASS_MAX = 5;

Particle.createRandom = function(x, y) {
  var mass = Math.random() * (Particle.MASS_MAX - Particle.MASS_MIN) + Particle.MASS_MIN;
  var x = Math.random() * 20 + x - 10;
  var y = Math.random() * 20 + y - 10;
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
  this.velocity = this.position.clone()
    .sub(this.lastPosition)
    .scale(correction);

  // Set acceleration based on time squared
  this.acceleration.scale(time * time);

  // Record last location
  this.lastPosition = this.position.clone();

  // Time-Corrected Verlet integration (TCV)
  this.position
    .add(this.velocity)
    .add(this.acceleration);

  // Reset acceleration after integration
  this.acceleration.zero();
};

Particle.prototype.placeAt = function(x, y) {
  this.position.x = this.lastPosition.x = x;
  this.position.y = this.lastPosition.y = y;
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

Particle.prototype.setBounds = function(rect) {
  this.bounds = rect ? rect : undefined;
};

Particle.prototype.contain = function(time, correction) {
  if (this.position.x > this.bounds.right) this.position.x = this.bounds.right;
  else if (this.position.x < this.bounds.left) this.position.x = this.bounds.left;
  if (this.position.y > this.bounds.bottom) this.position.y = this.bounds.bottom;
  else if (this.position.y < this.bounds.top) this.position.y = this.bounds.top;
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
  var i = walls.length;

  while (i--) {
    intersect = walls[i].findIntersection(
      this.lastPosition.x, this.lastPosition.y,
      this.position.x, this.position.y);

    if (intersect) {
      var dx = intersect.x - this.x1;
      var dy = intersect.y - this.y1;
      if (nearest) {
        var oldDistance = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
        var newDistance = Math.sqrt(dx * dx + dy * dy);
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
    var reflectedVelocity = nearest.wall.getReflection(velocity, 0, 1);
    this.placeAt(bouncePoint.x, bouncePoint.y);
    this.setVelocity(reflectedVelocity.x, reflectedVelocity.y);

    return nearest;

    var projection = nearest.wall.getProjection(this.velocity);
    var totalDx = this.x - this.x1;
    var totalDy = this.y - this.y1;
    var totalMotion = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    var spentMotion = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
    var remainingMotion = 1 - spentMotion / totalMotion;

    this.x = nearest.x;
    this.y = nearest.y;

    // TODO: no checks here make it possible to accidentally cross over another segment
    // this.x += projection.x * remainingMotion;
    // this.y += projection.y * remainingMotion;

    this.x1 = this.x - projection.x;
    this.y1 = this.y - projection.y;

    return nearest;
  }
};


if (typeof module !== 'undefined') module.exports = Particle;
