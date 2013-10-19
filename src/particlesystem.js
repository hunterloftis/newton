function ParticleSystem() {
  this.particles = [];
  this.groups = [
    { color: '#118888', particles: [] },
    { color: '#3fc1a6', particles: [] },
    { color: '#8effec', particles: [] },
    { color: '#f10c5c', particles: [] }
  ];
}

ParticleSystem.prototype.add = function(particle) {
  var group = this.getGroup(particle);
  this.particles.push(particle);
  group.particles.push(particle);
};

ParticleSystem.prototype.getGroup = function(particle) {
  var percent = (particle.getMass() - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)
  var index = ~~(percent * this.groups.length);
  return this.groups[index];
};

ParticleSystem.prototype.integrate = function(time, correction) {
  var i = this.particles.length;
  while(i--) {
    this.particles[i].integrate(time, correction);
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
