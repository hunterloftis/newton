function ParticleSystem() {
  this.particles = [];
}

ParticleSystem.prototype.add = function(particle) {
  this.particles.push(particle);
};

ParticleSystem.prototype.integrate = function(time) {
  var i = this.particles.length;
  while(i--) {
    this.particles[i].integrate(time);
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
