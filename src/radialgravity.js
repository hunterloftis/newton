function RadialGravity(x, y, strength, falloff) {
  this.x = x;
  this.y = y;
  this.strength = strength;
}

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
