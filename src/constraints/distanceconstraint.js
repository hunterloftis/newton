;(function(Newton) {

  'use strict'

  // TODO: implement check & correction with square of distance
  function DistanceConstraint(p1, p2, stiffness, distance) {
    if (!(this instanceof DistanceConstraint)) return new DistanceConstraint(p1, p2, stiffness, distance);

    this.p1 = p1;
    this.p2 = p2;
    this.stiffness = stiffness || 1;
    this.distance = (typeof distance === 'undefined') ? this.getDistance() : distance;

    this.isDestroyed = false;
  }

  DistanceConstraint.prototype.category = 'linear';
  DistanceConstraint.prototype.priority = 4;

  DistanceConstraint.prototype.getDistance = function() {
    return Newton.Vector.getDistance(this.p1.position, this.p2.position);
  };

  DistanceConstraint.prototype.resolve = function(time) {
    if (this.p1.isDestroyed || this.p2.isDestroyed) {
      this.isDestroyed = true;
      return;
    }

    var pos1 = this.p1.position;
    var pos2 = this.p2.position;
    var delta = pos2.pool().sub(pos1);
    var length = delta.getLength();
    var invmass1 = 1 / this.p1.getMass();   // TODO: simplify the size * materialWeight thing?
    var invmass2 = 1 / this.p2.getMass();
    var factor = (length - this.distance) / (length * (invmass1 + invmass2)) * this.stiffness;
    var correction1 = delta.pool().scale(factor * invmass1);
    var correction2 = delta.scale(-factor * invmass2);

    this.p1.correct(correction1);
    this.p2.correct(correction2);

    delta.free();
    correction1.free();
  };

  DistanceConstraint.prototype.getCoords = function() {
    return {
      x1: this.p1.position.x,
      y1: this.p1.position.y,
      x2: this.p2.position.x,
      y2: this.p2.position.y
    };
  };

  Newton.DistanceConstraint = DistanceConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);