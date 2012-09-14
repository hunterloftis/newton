function ParticleSystem() {
  this.particles = [];
}

ParticleSystem.prototype.add = function(particles) {
  if (particles instanceof Array) {
    return this.particles.concat(particles);
  }
  this.particles.push(particles);
};

ParticleSystem.prototype.integrate = function(time, correction) {
  var i = this.particles.length;
  while(i--) {
    this.particles[i].integrate(time, correction);
  }
};

ParticleSystem.prototype.each = function(callback) {
  var i = this.particles.length;
  while(i--) {
    callback(this.particles[i]);
  }
};