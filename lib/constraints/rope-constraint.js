// TODO: make ordering smarter. detect chains
// TODO: inherit from distanceconstraint, or just give distanceconstraint some options

var Vector = require('../vector');
var Constraint = require('../constraint');

function RopeConstraint(p1, p2) {
  if (!(this instanceof RopeConstraint)) return new RopeConstraint(p1, p2);
  Constraint.call(this);

  this._p1 = p1;
  this._p2 = p2;
  this._distance = this.getDistance();
  this._stiffness = 1;
}

RopeConstraint.prototype = Object.create(Constraint.prototype);

RopeConstraint.prototype.getDistance = function() {
  return Vector.getDistance(this._p1.position, this._p2.position);
};

RopeConstraint.prototype.correct = function(time, particles) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength();
  var offBy = length - this._distance;

  if (offBy <= 0) return;

  // TODO: handle different masses
  var factor = offBy / length * this._stiffness;
  var correction1 = delta.pool().scale(factor * 1);
  var correction2 = delta.scale(-factor * 1);

  this._p1.move(correction1);
  this._p2.move(correction2);

  delta.free();
  correction1.free();
};

module.exports = RopeConstraint;
