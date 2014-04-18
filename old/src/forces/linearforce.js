;(function(Newton) {

  'use strict';

  function LinearForce(angle, strength, falloff) {
    if (!(this instanceof LinearForce)) return new LinearForce(angle, strength, falloff);
    this.angle = angle;
    this.strength = strength;
    this.vector = new Newton.Vector(0, strength).rotateBy(angle);

    this.simulator = undefined;
    this.layer = undefined;
  }

  LinearForce.prototype.addTo = function(simulator, layer) {
    simulator.forces.push(this);
    this.simulator = simulator;
    this.layer = layer;
  };

  LinearForce.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.vector.set(0, this.strength).rotateBy(this.angle);
  };

  LinearForce.prototype.setStrength = function(strength) {
    this.strength = strength;
    this.vector.set(0, this.strength).rotateBy(this.angle);
  };

  // TODO: make falloff matter
  LinearForce.prototype.applyTo = function(particle) {
    particle.accelerateVector(this.vector);
  };

  Newton.LinearForce = LinearForce;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
