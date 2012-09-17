function Particle(x, y, m) {
  this.mass = m || 1.0;
  this.elasticity = 0.5;
  this.drag = 0.9999;
  this.velX = this.velY = 0;
  this.accX = this.accY = 0;
  this.minX = 0;
  this.minY = 0;
  this.maxX = 100;
  this.maxY = 100;
  this.setPos(x, y);
}

Particle.prototype.setPos = function(x, y) {
  this.x = this.x1 = x;
  this.y = this.y1 = y;
};

Particle.prototype.integrate = function(time, correction) {
  this.velX = this.getChangeX();
  this.velY = this.getChangeY();
  var tSquared = time * time;

  // Record last location
  this.x1 = this.x;
  this.y1 = this.y;

  // Time-Corrected Verlet integration (TCV)
  this.x = this.x + this.velX * correction + this.accX * tSquared;
  this.y = this.y + this.velY * correction + this.accY * tSquared;

  // Reset acceleration after integration
  this.accX = this.accY = 0;
};

Particle.prototype.getChangeX = function() {
  return this.x - this.x1;
};

Particle.prototype.getChangeY = function() {
  return this.y - this.y1;
};

Particle.prototype.boundaries = function(minX, minY, maxX, maxY) {
  this.minX = minX;
  this.minY = minY;
  this.maxX = maxX;
  this.maxY = maxY;
};

Particle.prototype.contain = function(time, correction) {
  if (this.x > this.maxX) this.x = this.maxX;
  else if (this.x < this.minX) this.x = this.minX;
  if (this.y > this.maxY) this.y = this.maxY;
  else if (this.y < this.minY) this.y = this.minY;
};

Particle.prototype.collide = function(segments) {
  var nearest;
  var i = segments.length;
  while (i--) {
    var intersect = segments[i].intersection(this.x1, this.y1, this.x, this.y);
    var dx = intersect.x - this.x1;
    var dy = intersect.y - this.y1;
    if (intersect) {
      if (nearest) {
        var oldDistance = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
        var newDistance = Math.sqrt(dx * dx + dy * dy);
        if (newDistance < oldDistance) {
          nearest = {
            dx: dx,
            dy: dy
          };
        }
      }
      else {
        nearest = {
          dx: dx,
          dy: dy
        };
      }
    }
  }
  if (nearest) {
    var compensationX = nearest.dx > 3 ? nearest.dx * 0.9 : 0;
    var compensationY = nearest.dy > 3 ? nearest.dy * 0.9 : 0;
    this.x = this.x1 + compensationX;
    this.y = this.y1 + compensationY;
  }
};

Particle.prototype.force = function(x, y) {
  this.accX += (x / this.mass);
  this.accY += (y / this.mass);
};

Particle.prototype.accelerate = function(x, y) {
  this.accX += x;
  this.accY += y;
};

Particle.prototype.gravitate = function(x, y, m) {
  var dx = x - this.x;
  var dy = y - this.y;
  var r = Math.sqrt(dx * dx + dy * dy);
  var f = (m * this.mass) / (r * r);
  this.accX += f * (dx / r);
  this.accY += f * (dy / r);
};