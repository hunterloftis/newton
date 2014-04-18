var pool = [];  // Vector object pooling (avoid GC)

function Vector(x, y) {
  if (!(this instanceof Vector)) return new Vector(x, y);
  this.x = x || 0;
  this.y = y || 0;
}


Vector.claim = function() {
  return pool.pop() || Vector();
};

Vector.getDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

Vector.pool = function(size) {
  if (typeof size !== 'undefined') {
    pool.length = 0;
    for (var i = 0; i < size; i++) {
      pool.push(Vector());
    }
  }
  else {
    return pool.length;
  }
};


Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.clone = function() {
  return Vector(this.x, this.y);
};

Vector.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};

Vector.prototype.equals = function(v) {
  return this.x === v.x && this.y === v.y;
};

Vector.prototype.pool = function() {
  return Vector.claim().copy(this);
};

Vector.prototype.free = function() {
  pool.push(this);
  return this;
};

Vector.prototype.getLength = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.min = function(v) {
  if (this.x < v.x) this.x = v.x;
  if (this.y < v.y) this.y = v.y;
  return this;
};

Vector.prototype.max = function(v) {
  if (this.x > v.x) this.x = v.x;
  if (this.y > v.y) this.y = v.y;
  return this;
};

Vector.prototype.rotate = function(angle) {
  var x = this.x;
  var y = -this.y;
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  this.x = x * cos - y * sin;
  this.y = -(x * sin + y * cos);
  return this;
};

Vector.prototype.scale = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
  return this;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.zero = function() {
  this.x = this.y = 0;
  return this;
};


module.exports = Vector;


/*


// One-off vector for single computes

Vector.scratch = new Vector();

// Static methods

// New instances

// Setters

Vector.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

// Add

Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.addXY = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};

Vector.prototype.subXY = function(x, y) {
  this.x -= x;
  this.y -= y;
  return this;
};

Vector.prototype.merge = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  if (dx > 0 && this.x >= 0) this.x += dx;
  else if (dx < 0 && this.x <= 0) this.x += dx;
  if (dy > 0 && this.y >= 0) this.y += dy;
  else if (dy < 0 && this.y <= 0) this.y += dy;
  return this;
};

// Scale

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

Vector.prototype.reverse = function() {
  this.x = -this.x;
  this.y = -this.y;
  return this;
};

Vector.prototype.unit = function() {
  this.scale(1 / this.getLength());
  return this;
};

// Rotate

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

Vector.prototype.rotateAbout = function(pivot, angle) {
  this.sub(pivot).rotateBy(angle).add(pivot);
  return this;
};

// Get

Vector.prototype.getDot = function(v) {
  return this.x * v.x + this.y * v.y;
};

Vector.prototype.getCross = function(v) {
  return this.x * v.y + this.y * v.x;
};

Vector.prototype.getLength = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getLength2 = function() {
  // Squared length
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.getAngle = function() {
  return Math.atan2(-this.y, this.x);
};

Vector.prototype.getAngleTo = function(v) {
  // The nearest angle between two vectors
  // (origin of 0,0 for both)
  var cos = this.x * v.x + this.y * v.y;
  var sin = this.y * v.x - this.x * v.y;

  return Math.atan2(sin, cos);
};

// If projection >= 0, it's in this half plane
// Otherwise, it isn't
Vector.prototype.getProjection = function(vPoint, vDir) {
  return this.clone().sub(vPoint).getDot(vDir);
};

Vector.prototype.applyProjection = function(projection, vDir) {
  this.sub(dir.clone().scale(projection));
  return this;
};

Vector.prototype.projectOnto = function(vPoint, vDir) {
  var projection = this.clone().sub(vPoint).getDot(vDir);
  this.sub(vDir.clone().scale(projection));
  return this;
};

Vector.prototype.projectSegment = function(vA, vB) {
  var normal = vB.clone().sub(vA).turnLeft().unit();
  var projection = this.clone().sub(vA).getDot(normal);
  this.sub(normal.scale(projection));

  if (this.x > vA.x && this.x > vB.x) this.x = Math.max(vA.x, vB.x);
  else if (this.x < vA.x && this.x < vB.x) this.x = Math.min(vA.x, vB.x);
  if (this.y > vA.y && this.y > vB.y) this.y = Math.max(vA.y, vB.y);
  else if (this.y < vA.y && this.y < vB.y) this.y = Math.min(vA.y, vB.y);

  return this;
};

*/
