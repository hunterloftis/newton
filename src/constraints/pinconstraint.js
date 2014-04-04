;(function(Newton) {

  'use strict';

  function PinConstraint(particle) {
    if (!(this instanceof PinConstraint)) return new PinConstraint(particle);

    this.particle = particle;
    this.position = particle.position.clone();

    this.id = ++PinConstraint.count;
  }

  PinConstraint.count = 0;

  PinConstraint.prototype.type = 'Constraint';
  PinConstraint.prototype.category = 'PinConstraint';
  PinConstraint.prototype.priority = 0;

  PinConstraint.prototype.addTo = function(simulator) {
    simulator.addConstraints([this]);
  };

  PinConstraint.prototype.resolve = function(time, allParticles) {
    this.particle.placeAt(this.position.x, this.position.y);
  };

  Newton.PinConstraint = PinConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
