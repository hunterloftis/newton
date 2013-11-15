;(function(Newton) {

  'use strict';

  'use strict'

  function RadialGravity(x, y, strength, falloff) {
    if (!(this instanceof RadialGravity)) return new RadialGravity(x, y, strength, falloff);
    this.x = x;
    this.y = y;
    this.strength = strength;

    this.simulator = undefined;
  }

  RadialGravity.prototype.addTo = function(simulator) {
    simulator.forces.push(this);
    this.simulator = simulator;
  };

  RadialGravity.prototype.setLocation = function(x, y) {
    this.x = x;
    this.y = y;
  };

  RadialGravity.prototype.setStrength = function(strength) {
    this.strength = strength;
  };

  // TODO: make falloff matter
  RadialGravity.prototype.applyTo = function(particle) {
    if (particle.pinned) return;
    particle.attractSquare(this.x, this.y, this.strength, 20);
  };

  Newton.RadialGravity = RadialGravity;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
