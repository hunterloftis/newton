// TODO: make ordering smarter. detect chains

var Vector = require('../vector');
var Constraint = require('../constraint');

function DistanceConstraint(p1, p2) {
  if (!(this instanceof DistanceConstraint)) return new DistanceConstraint(p1, p2);
  Constraint.call(this);

  this._p1 = p1;
  this._p2 = p2;
  this._distance = this.getDistance();
  this._stiffness = 1;
}

DistanceConstraint.prototype = Object.create(Constraint.prototype);

DistanceConstraint.prototype.getDistance = function() {
  return Vector.getDistance(this._p1.position, this._p2.position);
};

DistanceConstraint.prototype.correct = function(time, particles) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength();
  var offBy = length - this._distance;
  // TODO: handle different masses
  var factor = offBy / length * this._stiffness;
  var correction1 = delta.pool().scale(factor * 1);
  var correction2 = delta.scale(-factor * 1);

  this._p1.move(correction1);
  this._p2.move(correction2);

  delta.free();
  correction1.free();
};

module.exports = DistanceConstraint;
