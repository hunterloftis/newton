// TODO: make ordering smarter. detect chains
// TODO: inherit from distanceconstraint, or just give distanceconstraint some options

var Vector = require('../vector');
var Constraint = require('../constraint');

// avoid dividing by zero
var NO_DBZ = 0.000001;

function RopeConstraint(p1, p2, options) {
  if (!(this instanceof RopeConstraint)) return new RopeConstraint(p1, p2, options);
  Constraint.call(this);

  options = options || {};
  this._p1 = p1;
  this._p2 = p2;
  this._distance = options.length || this.getDistance();
  this._stiffness = options.stiffness || 1;
  this._expansion = 0.001;
  this._compression = 1;
  this._strength = options.strength || Infinity;

  this._deleted = false;
}

RopeConstraint.prototype = Object.create(Constraint.prototype);

RopeConstraint.prototype.getDistance = function() {
  return Vector.getDistance(this._p1.position, this._p2.position);
};

RopeConstraint.prototype.correct = function(time, particles, i, iterations) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength() || NO_DBZ;
  var offBy = length - this._distance;
  var multiplier = offBy <= 0 ? this._expansion : this._compression;

  // TODO: handle different masses
  var factor = offBy / length * this._stiffness * multiplier;
  var correction1 = delta.pool().scale(factor * 1);
  var correction2 = delta.scale(-factor * 1);

  this._p1.move(correction1);
  this._p2.move(correction2);

  delta.free();
  correction1.free();
};

RopeConstraint.prototype.evaluate = function(time, particles) {
  var pos1 = this._p1.position;
  var pos2 = this._p2.position;
  var delta = pos2.pool().sub(pos1);
  var length = delta.getLength();
  var offBy = length - this._distance;
  var stress = offBy / this._distance;

  if (stress > this._strength) this._deleted = true;
};

module.exports = RopeConstraint;
