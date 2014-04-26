var Constraint = require('../constraint');

function PinConstraint(particle, position) {
  if (!(this instanceof PinConstraint)) return new PinConstraint(particle, position);
  Constraint.call(this);

  this._particle = particle;
  this._position = position || particle.position.clone();
}

PinConstraint.prototype = Object.create(Constraint.prototype);

PinConstraint.prototype.correct = function(time, particles) {
  this._particle.place(this._position);
};

PinConstraint.prototype.setPosition = function(position) {
  this._position = position;
};

module.exports = PinConstraint;
