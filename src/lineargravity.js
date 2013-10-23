;(function() {

  function LinearGravity(angle, strength, falloff) {
    if (!(this instanceof LinearGravity)) return new LinearGravity(angle, strength, falloff);
    this.angle = angle;
    this.strength = strength;
    this.vector = new Newton.Vector(0, strength).rotate(angle);
  }

  LinearGravity.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.vector.set(0, this.strength).rotate(this.angle);
  };

  LinearGravity.prototype.setStrength = function(strength) {
    this.strength = strength;
    this.vector.set(0, this.strength).rotate(this.angle);
  };

  // TODO: make falloff matter
  LinearGravity.prototype.applyTo = function(particle) {
    particle.accelerateVector(this.vector);
  };

  window.Newton = window.Newton || {};
  window.Newton.LinearGravity = LinearGravity;

})();