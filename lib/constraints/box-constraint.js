var Constraint = require('../constraint');
var Vector = require('../vector');

function BoxConstraint(x, y, width, height) {
  if (!(this instanceof BoxConstraint)) return new BoxConstraint(x, y, width, height);
  Constraint.call(this);

  this._min = Vector(x, y);
  this._max = Vector(x + width, y + height);
}

BoxConstraint.prototype = Object.create(Constraint.prototype);

BoxConstraint.prototype.correct = function(time, particles) {
  for (var i = 0; i < particles.length; i++) {
    particles[i].bound(this._min, this._max);
  }
};

module.exports = BoxConstraint;
