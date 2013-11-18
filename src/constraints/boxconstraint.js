;(function(Newton) {

  'use strict'

  function BoxConstraint(left, top, right, bottom, particles) {
    if (!(this instanceof BoxConstraint)) return new BoxConstraint(left, top, right, bottom, particles);

    this.rect = Newton.Rectangle(left, top, right, bottom);
    this.particles = particles;
  }

  BoxConstraint.prototype.category = 'boxconstraint';
  BoxConstraint.prototype.priority = 0;

  BoxConstraint.prototype.addTo = function(simulator) {
    simulator.addConstraints([this]);
  };

  BoxConstraint.prototype.resolve = function(time, allParticles) {
    var particles = this.particles || allParticles;
    var i = -1, len = particles.length;

    while (++i < len) {
      particles[i].contain(this.rect);
    }
  };

  Newton.BoxConstraint = BoxConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
