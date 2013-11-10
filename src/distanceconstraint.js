;(function(Newton) {

  'use strict'

  function DistanceConstraint(p1, p2, distance) {
    if (!(this instanceof DistanceConstraint)) return new DistanceConstraint(p1, p2, distance);

    this.p1 = p1;
    this.p2 = p2;
    this.distance = (typeof distance === 'undefined') ? this.getDistance() : distance;
  }

  DistanceConstraint.prototype.getDistance = function() {
    var pos1 = this.p1.position;
    var pos2 = this.p2.position;
    var diff = pos2.clone().sub(pos1);
    return diff.getLength();
  };

  DistanceConstraint.prototype.resolve = function(time) {
    var pos1 = this.p1.position;
    var pos2 = this.p2.position;
    var diff = pos2.clone().sub(pos1);
    var length = diff.getLength();
    var factor = (length - this.distance) / (length * 2.1);
    var correction = diff.scale(factor);

    this.p1.correct(correction);
    correction.scale(-1);
    this.p2.correct(correction);
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