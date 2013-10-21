function ParticleSystem() {
  this.particles = [];
  this.forces = [];
}

ParticleSystem.prototype.add = function(particle) {
  this.particles.push(particle);
};

ParticleSystem.prototype.addForce = function(force) {
  this.forces.push(force);
};

ParticleSystem.prototype.integrate = function(time) {
  var particle;
  for (var i = 0, ilen = this.particles.length; i < ilen; i++) {
    particle = this.particles[i];
    for (var j = 0, jlen = this.forces.length; j < jlen; j++) {
      this.forces[j].applyTo(particle);
    }
    particle.integrate(time);
    particle.wrap(container);   // TODO
    particle.collide(walls);    // TODO
  }
};

ParticleSystem.prototype.each = function(method, args) {
  var i = this.particles.length;
  var particle;
  while(i--) {
    particle = this.particles[i];
    particle[method].apply(particle, args);
  }
};

ParticleSystem.prototype.callback = function(callback) {
  var i = this.particles.length;
  while (i--) {
    callback(this.particles[i]);
  }
};

ParticleSystem.prototype.wrapBy = function(rect) {

};
