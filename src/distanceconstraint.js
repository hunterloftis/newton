;(function(Newton) {

  'use strict'

  function DistanceConstraint(p1, p2, distance) {
    if (!(this instanceof DistanceConstraint)) return new DistanceConstraint(p1, p2, distance);

    this.p1 = p1;
    this.p2 = p2;
    this.distance = (typeof distance === 'undefined') ? this.getDistance() : distance;

    this.isDestroyed = false;
  }

  DistanceConstraint.prototype.getDistance = function() {
    var pos1 = this.p1.position;
    var pos2 = this.p2.position;
    var diff = pos2.clone().sub(pos1);
    return diff.getLength();
  };

  DistanceConstraint.prototype.resolve = function(time) {
    if (this.p1.isDestroyed || this.p2.isDestroyed) {
      this.isDestroyed = true;
      return;
    }

    var pos1 = this.p1.position;
    var pos2 = this.p2.position;
    var delta = pos2.clone().sub(pos1);
    var length = delta.getLength();
    var invmass1 = 1 / this.p1.getMass();   // TODO: simplify the size * materialWeight thing?
    var invmass2 = 1 / this.p2.getMass();
    var factor = (length - this.distance) / (length * (invmass1 + invmass2));
    var correction1 = delta.clone().scale(factor * invmass1);
    var correction2 = delta.clone().scale(-factor * invmass2);

    this.p1.correct(correction1);
    this.p2.correct(correction2);
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