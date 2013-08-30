function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.clone = function() {
  return new Vector(this.x, this.y);
}

Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.mult = function(v) {
  this.x *= v.x;
  this.y *= v.y;
  return this;
};

Vector.prototype.div = function(v) {
  this.x /= v.x;
  this.y /= v.y;
  return this;
};

Vector.prototype.scale = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
  return this;
};

Vector.prototype.unit = function() {
  this.scale(1 / this.getLength());
  return this;
};

Vector.prototype.turnRight = function() {
  var x = this.x;
  var y = this.y;
  this.x = -y;
  this.y = x;
  return this;
};

Vector.prototype.turnLeft = function() {
  var x = this.x;
  var y = this.y;
  this.x = y;
  this.y = -x;
  return this;
};

Vector.prototype.rotate = function(angle) {
  var x = this.x;
  var y = this.y;
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  this.x = x * cos - y * sin;
  this.y = x * sin + y * cos;
  return this;
};

Vector.prototype.getDot = function(v) {
  return this.x * v.x + this.y * v.y;
};

Vector.prototype.getCross = function(v) {
  return this.x * v.y + this.y * v.x;
};

Vector.prototype.getLength = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getSquaredLength = function() {
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.getAngle = function() {
  return Math.atan2(this.y, this.x);
};

if (typeof module !== 'undefined') global.Vector = Vector;
