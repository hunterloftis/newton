var Constraint = require('../constraint');

function PinConstraint(particle) {
  if (!(this instanceof PinConstraint)) return new PinConstraint(particle);
  Constraint.call(this);

  this._particle = particle;
  this._position = particle.position.clone();
}

PinConstraint.prototype = Object.create(Constraint.prototype);

PinConstraint.prototype.priority = 0;

PinConstraint.prototype.correct = function(time, particles) {
  this._particle.place(this._position);
};

module.exports = PinConstraint;
