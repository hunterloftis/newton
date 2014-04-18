var Force = require('../force');
var Vector = require('../vector');

function LinearForce(strength, angle) {
  if (!(this instanceof LinearForce)) return new LinearForce(strength, angle);
  Force.call(this);

  this._vector = Vector(strength, 0).rotate(angle);
}

LinearForce.prototype = Object.create(Force.prototype);

LinearForce.prototype.applyTo = function(particle) {
  particle.accelerate(this._vector);
};

module.exports = LinearForce;
