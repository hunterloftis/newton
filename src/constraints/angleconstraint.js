;(function(Newton) {

  'use strict'

  var HALF_CIRCLE = Math.PI;
  var CIRCLE = Math.PI * 2;

  function AngleConstraint(axis, p1, p2, stiffness, angle) {
    if (!(this instanceof AngleConstraint)) return new AngleConstraint(axis, p1, p2, stiffness, angle);

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
    if (this.p1.isDestroyed || this.p2.isDestroyed) {
      this.isDestroyed = true;
      return;
    }

    var diff = this.angle - this.getAngle();

    // if (diff <= -Math.PI) diff += 2 * Math.PI;
    // else if (diff >= Math.PI) diff -= 2 * Math.PI;

    diff *= 0.0025;

    this.p1.position.rotateAbout(this.axis.position, diff);
    this.axis.position.rotateAbout(this.p1.position, -diff);

    this.p2.position.rotateAbout(this.axis.position, -diff);
    this.axis.position.rotateAbout(this.p2.position, diff);
  };

  Newton.AngleConstraint = AngleConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);