function Body(material) {
  this.particles = [];
  this.edges = [];
  this.material = material; // TODO: make this matter
}

Body.prototype.addParticle = function(particle) {
  this.particles.push(particle);
};

Body.prototype.each = function(method, args) {
  var i = this.particles.length;
  var particle;
  while(i--) {
    particle = this.particles[i];
    particle[method].apply(particle, args);
  }
};

Body.prototype.callback = function(callback) {
  var i = this.particles.length;
  while (i--) {
    callback(this.particles[i]);
  }
};