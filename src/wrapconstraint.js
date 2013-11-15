;(function(Newton) {

  'use strict'

  function WrapConstraint(left, top, right, bottom, particles) {
    if (!(this instanceof WrapConstraint)) return new WrapConstraint(left, top, right, bottom, particles);

    this.rect = Newton.Rectangle(left, top, right, bottom);
    this.particles = particles;
  }

  WrapConstraint.prototype.category = 'WrapConstraint';
  WrapConstraint.prototype.priority = 0;

  WrapConstraint.prototype.addTo = function(simulator) {
    simulator.addConstraints([this]);
  };

  WrapConstraint.prototype.resolve = function(time, allParticles) {
    var particles = this.particles || allParticles;
    var i = -1, len = particles.length;

    while (++i < len) {
      particles[i].wrap(this.rect);
    }
  };

  Newton.WrapConstraint = WrapConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
