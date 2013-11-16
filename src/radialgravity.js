;(function(Newton) {

  'use strict';

  'use strict'

  function RadialGravity(x, y, strength, falloff) {
    if (!(this instanceof RadialGravity)) return new RadialGravity(x, y, strength, falloff);
    this.x = x;
    this.y = y;
    this.strength = strength;

    this.simulator = undefined;
    this.layer = undefined;
  }

  RadialGravity.prototype.addTo = function(simulator, layer) {
    simulator.forces.push(this);
    this.simulator = simulator;
    this.layer = layer;
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
    particle.attractSquare(this.x, this.y, this.strength, 20);
  };

  Newton.RadialGravity = RadialGravity;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
