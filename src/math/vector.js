;(function(Newton) {

  'use strict';

  'use strict'

  function Vector(x, y) {
    if (!(this instanceof Vector)) return new Vector(x, y);
    this.x = x;
    this.y = y;
  }

  Vector.scratch = new Vector();

  Vector.prototype.clone = function() {
    return new Newton.Vector(this.x, this.y);
  };

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

  Vector.prototype.mult = Vector.prototype.multVector = function(v) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  };

  Vector.prototype.reverse = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  };

  Vector.prototype.div = function(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  };

  Vector.prototype.multScalar = Vector.prototype.scale = function(scalar) {
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

  // TODO: rename to 'rotateBy'
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

  Vector.prototype.getAngleFrom = function(v) {
    var cos = this.x * v.x + this.y * v.y;
    var sin = this.y * v.x - this.x * v.y;

    return Math.atan2(sin, cos);
  };

  Vector.prototype.getAngle2 = function(vLeft, vRight) {
    return vLeft.clone().sub(this).getAngleFrom(vRight.clone().sub(this));
  };


  Vector.prototype.rotateAbout = function(pivot, angle) {
    this.sub(pivot).rotate(angle).add(pivot);
    return this;
  };

  Newton.Vector = Vector;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);

