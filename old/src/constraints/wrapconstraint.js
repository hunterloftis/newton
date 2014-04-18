;(function(Newton) {

  'use strict'

  // Corrected modulo
  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function WrapConstraint(left, top, right, bottom, particles) {
    if (!(this instanceof WrapConstraint)) return new WrapConstraint(left, top, right, bottom, particles);

    this.rect = Newton.Rectangle(left, top, right, bottom);
    this.particles = particles;

    this.layer = undefined;
  }

  WrapConstraint.prototype.category = 'WrapConstraint';
  WrapConstraint.prototype.priority = 0;

  WrapConstraint.prototype.addTo = function(simulator, layer) {
    simulator.addConstraints([this]);
    this.layer = layer;
  };

  WrapConstraint.prototype.resolve = function(time, allParticles) {
    var particles = this.particles || allParticles;
    var i = -1, len = particles.length;
    var particle, pos;
    var rect = this.rect;

    while (++i < len) {
      pos = particles[i].position;
      if (pos.x < rect.left || pos.x > rect.right || pos.y < rect.top || pos.y > rect.bottom) {
        particle = particles[i];
        var newX = mod(particle.position.x, this.rect.width) + this.rect.left;
        var newY = mod(particle.position.y, this.rect.height) + this.rect.top;
        particle.shiftTo(newX, newY);
      }
    }
  };

  Newton.WrapConstraint = WrapConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
