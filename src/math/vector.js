;(function(Newton) {

  'use strict'

  function Vector(x, y) {
    if (!(this instanceof Vector)) return new Vector(x, y);
    this.x = x;
    this.y = y;
  }

  // Vector object pooling (avoid GC)

  Vector._pool = [];

  Vector.pool = function(size) {
    if (typeof size !== 'undefined') {
      Vector._pool.length = 0;
      for (var i = 0; i < size; i++) {
        Vector._pool.push(Newton.Vector());
      }
    }
    else {
      return Vector._pool.length;
    }
  };

  Vector.claim = function() {
    return Vector._pool.pop() || Newton.Vector();
  };

  Vector.prototype.free = function() {
    Vector._pool.push(this);
    return this;
  };

  Vector.prototype.pool = function() {
    return Vector.claim().copy(this);
  };

  // One-off vector for single computes

  Vector.scratch = new Vector();

  // Static methods

  Vector.getDistance = function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // New instances

  Vector.prototype.clone = function() {
    return Newton.Vector(this.x, this.y);
  };

  // Setters

  Vector.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  Vector.prototype.zero = function() {
    this.x = 0;
    this.y = 0;
    return this;
  };

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

  Vector.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };

  Vector.prototype.subXY = function(x, y) {
    this.x -= x;
    this.y -= y;
    return this;
  };

  // Scale

  Vector.prototype.mult = function(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  };

  Vector.prototype.scale = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
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

  Vector.prototype.rotateBy = function(angle) {
    var x = this.x;
    var y = -this.y;
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);
    this.x = x * cos - y * sin;
    this.y = -(x * sin + y * cos);
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

  Newton.Vector = Vector;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);

