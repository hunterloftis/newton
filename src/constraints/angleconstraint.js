;(function(Newton) {

  'use strict'

  var HALF_CIRCLE = Math.PI;
  var CIRCLE = Math.PI * 2;

  function AngleConstraint(p1, axis, p2, stiffness, angle) {
    if (!(this instanceof AngleConstraint)) return new AngleConstraint(p1, axis, p2, stiffness, angle);

    this.axis = axis;
    this.p1 = p1;
    this.p2 = p2;
    this.angle = (typeof angle === 'undefined') ? this.getAngle() : angle;
    this.stiffness = stiffness || 1;

    this.isDestroyed = false;
  }

  AngleConstraint.prototype.category = 'angular';
  AngleConstraint.prototype.priority = 6;

  AngleConstraint.prototype.getAngle = function() {
    var p1 = this.p1.position.pool().sub(this.axis.position);
    var p2 = this.p2.position.pool().sub(this.axis.position);

    var angle = p1.getAngleTo(p2);

    p1.free();
    p2.free();

    return angle;
  };

  AngleConstraint.prototype.resolve = function(time) {
    if (this.p1.isDestroyed || this.p2.isDestroyed || this.axis.isDestroyed) {
      this.isDestroyed = true;
      return;
    }

    var diff = this.angle - this.getAngle();

    if (diff <= -Math.PI) diff += 2*Math.PI;
    else if (diff >= Math.PI) diff -= 2*Math.PI;

    diff *= -0.25 * this.stiffness;

    if (!this.p1.pinned)
      this.p1.position.rotateAbout(this.axis.position, diff);   // rotate left about axis
    if (!this.p2.pinned)
      this.p2.position.rotateAbout(this.axis.position, -diff);  // rotate right in reverse about axis
    if (!this.axis.pinned) {
      this.axis.position.rotateAbout(this.p1.position, diff);  // rotate axis about left
      this.axis.position.rotateAbout(this.p2.position, -diff);   // rotate axis about right
    }
  };

  Newton.AngleConstraint = AngleConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);