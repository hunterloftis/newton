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
    var axis = this.axis.position;
    var angle1 = this.p1.position.getAngleFrom(axis);
    var angle2 = this.p2.position.getAngleFrom(axis);
    var diff = (angle2 - angle1 + HALF_CIRCLE) % CIRCLE + HALF_CIRCLE;

    return diff;
  };

  AngleConstraint.prototype.resolve = function(time) {
    if (this.p1.isDestroyed || this.p2.isDestroyed) {
      this.isDestroyed = true;
      return;
    }

    var currentAngle = this.getAngle();
    var angleDelta = this.angle - currentAngle;

    this.p1.position.rotateAbout(this.axis.position, angleDelta * 0.5);
    this.p2.position.rotateAbout(this.axis.position, angleDelta * -0.5);
  };

  Newton.AngleConstraint = AngleConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);