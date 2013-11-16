;(function(Newton) {

  'use strict'

  function Particle(x, y, size, material) {
    if (!(this instanceof Particle)) return new Particle(x, y, size, material);
    this.position = new Newton.Vector(x, y);
    this.lastPosition = this.position.clone();
    this.lastValidPosition = this.position.clone();
    this.velocity = new Newton.Vector(0, 0);
    this.acceleration = new Newton.Vector(0, 0);
    this.material = material || Newton.Material.simple;
    this.size = size || 1.0;
    this.randomDrag = 0; // TODO: make this optional: Math.random() * Particle.randomness + 0.0000000001;

    this.pinned = false;
    this.colliding = false;
    this.isDestroyed = false;

    this.layer = undefined;
  }

  Particle.randomness = 25;

  Particle.prototype.integrate = function(time) {
    if (this.pinned) return;

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

  // Adds a vector to position (move by force)
  Particle.prototype.correct = function(v) {
    if (this.pinned) return;
    this.position.add(v);
  };

  // Sets the position to a coord (place by force)
  Particle.prototype.moveTo = function(x, y) {
    this.position.set(x, y);
    return this;
  };

  // Sets the position to a coord, preserving existing velocity
  Particle.prototype.shiftTo = function(x, y) {
    var deltaX = x - this.position.x;
    var deltaY = y - this.position.y;
    this.position.addXY(deltaX, deltaY);
    this.lastPosition.addXY(deltaX, deltaY);
  };

  Particle.prototype.destroy = function() {
    this.isDestroyed = true;
  };

  Particle.prototype.moveBy = function(dx, dy) {
    this.lastPosition = this.position.clone();
    this.position.add(dx, dy);
    return this;
  };

  Particle.prototype.getDistance = function(x, y) {
    return this.position.clone().subXY(x, y).getLength();
  };

  Particle.prototype.pin = function(x, y) {
    x = (typeof x !== 'undefined') ? x : this.position.x;
    y = (typeof y !== 'undefined') ? y : this.position.y;
    this.placeAt(x, y);
    this.pinned = true;
    this.size = Infinity;
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

  Particle.prototype.applyForce = function(force) {

    // TODO: check here if the force should apply to this particle
    this.accelerateVector(force.vector);
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

  Newton.Particle = Particle;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
