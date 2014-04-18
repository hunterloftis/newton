;(function(Newton) {

  'use strict'

  function LinearGravity(angle, strength, falloff) {
    if (!(this instanceof LinearGravity)) return new LinearGravity(angle, strength, falloff);
    this.angle = angle;
    this.strength = strength;
    this.vector = new Newton.Vector(0, strength).rotateBy(angle);

    this.simulator = undefined;
    this.layer = undefined;
  }

  LinearGravity.prototype.addTo = function(simulator, layer) {
    simulator.forces.push(this);
    this.simulator = simulator;
    this.layer = layer;
  };

  LinearGravity.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.vector.set(0, this.strength).rotateBy(this.angle);
  };

  LinearGravity.prototype.setStrength = function(strength) {
    this.strength = strength;
    this.vector.set(0, this.strength).rotateBy(this.angle);
  };

  // TODO: make falloff matter
  LinearGravity.prototype.applyTo = function(particle) {
    particle.accelerateVector(this.vector);
  };

  Newton.LinearGravity = LinearGravity;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
