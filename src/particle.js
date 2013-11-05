var intersections = 0;

;(function() {

  'use strict'

  // Corrected modulo
  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function Particle(x, y, size, material) {
    if (!(this instanceof Particle)) return new Particle(x, y, size, material);
    this.position = new Newton.Vector(x, y);
    this.lastPosition = this.position.clone();
    this.lastValidPosition = this.position.clone();
    this.velocity = new Newton.Vector(0, 0);
    this.acceleration = new Newton.Vector(0, 0);
    this.material = material || Newton.Material.simple;
    this.size = size || 1.0;
    this.randomDrag = Math.random() * Particle.randomness + 0.0000000001;

    this.colliding = false;
  }

  Particle.randomness = 25;

  Particle.prototype.integrate = function(time) {

    // Find velocity
    this.velocity
      .copy(this.position)
      .sub(this.lastPosition);

    var drag = Math.min(1, this.velocity.getSquaredLength() / (this.material.maxVelocitySquared + this.randomDrag));

    this.velocity.scale(1 - drag);

    // Set acceleration based on time squared
    this.acceleration
      .scale(1 - drag)
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

    this.colliding = false;
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

  Particle.prototype.wrap = function(bounds) {
    var velocity = this.position.clone().sub(this.lastPosition);
    var newX = mod(this.position.x, bounds.width) + bounds.left;
    var newY = mod(this.position.y, bounds.height) + bounds.top;
    this.lastPosition.x = this.lastValidPosition.x = newX - velocity.x;
    this.lastPosition.y = this.lastValidPosition.y = newY - velocity.y;
    this.position.x = newX;
    this.position.y = newY;
  };

  Particle.prototype.accelerateVector = function(vector) {
    this.acceleration.add(vector);
  };

  Particle.prototype.force = function(x, y, mass) {
    mass = mass || this.getMass();
    this.acceleration.add({
      x: x / mass,
      y: y / mass
    });
  };

  Particle.prototype.getMass = function() {
    return this.size * this.material.weight;
  };

  Particle.prototype.getSquaredSpeed = function() {
    return this.velocity.getSquaredLength();
  };

  Particle.prototype.attractSquare = function(x, y, m, minDist) {
    var mass = this.getMass();
    var delta = new Newton.Vector(x, y).sub(this.position);
    var r = Math.max(delta.getLength(), minDist || 1);
    var f = (m * mass) / (r * r);
    var ratio = m / (m + mass);

    this.acceleration.add({
      x: -f * (delta.x / r) * ratio,
      y: -f * (delta.y / r) * ratio
    });
  };

  Particle.prototype.collide = function(edges) {
    var nearest, intersect;
    var dx, dy, oldDistance, newDistance;
    var partOfEdge;
    var i = edges.length;

    while (i--) {

      // TODO: this is wonky
      partOfEdge = this === edges[i].p1 || this === edges[i].p2;
      intersect = !partOfEdge && edges[i].findIntersection(
        this.lastPosition.x, this.lastPosition.y,
        this.position.x, this.position.y);

      if (intersect) {
        //debugger

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
              wall: edges[i]
            };
          }
        }
        else {
          nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            wall: edges[i]
          };
        }
      }
    }
    if (nearest) {

      var velocity = this.position.clone().sub(this.lastPosition);
      var bouncePoint = nearest.wall.getRepelled(nearest.x, nearest.y);
      var reflectedVelocity = nearest.wall.getReflection(velocity, this.material.restitution);

      this.position.copy(bouncePoint);
      this.setVelocity(reflectedVelocity.x, reflectedVelocity.y);
      this.lastValidPosition = bouncePoint;

      this.colliding = true;

      return nearest;
    }
  };

  window.Newton = window.Newton || {};
  window.Newton.Particle = Particle;

})();
