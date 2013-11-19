;(function(Newton) {

  'use strict'

  function RigidConstraint(particles, iterations) {
    if (!(this instanceof RigidConstraint)) return new RigidConstraint(particles, iterations);

    this.particles = particles;
    this.deltas = this.getDeltas();

    console.log('deltas:', this.deltas);
  }

  RigidConstraint.prototype.category = '';
  RigidConstraint.prototype.priority = 2;

  // TODO: make respect individual particle mass
  RigidConstraint.prototype.getCenterMass = function() {
    var i = -1, len = this.particles.length;
    var center = Newton.Vector(0, 0);

    // console.log('starting with 0, 0');
    while (++i < len) {
      center.add(this.particles[i].position);
      // console.log(this.particles[i].position);
    }

    center.scale(1 / len);

    // console.log('center:', center);
    return center;
  };

  RigidConstraint.prototype.getDeltas = function() {
    var center = this.getCenterMass();
    var i = -1, len = this.particles.length;
    var deltas = Array(len);

    while (++i < len) {
      deltas[i] = this.particles[i].position.clone().sub(center);
    }

    return deltas;
  };

  // RigidConstraint.prototype.getAngleAbout = function(center) {
  //   var angleDelta = 0;
  //   var i = -1, len = this.particles.length;

  //   while (++i < len) {
  //     angleDelta += this.particles[i].position.clone()
  //       .sub(center)
  //       .getAngleFrom(this.deltas[i]);
  //   }

  //   return angleDelta / len;
  // };

  var pause = false;
  $(document).click(function() {
        pause = true;
    })

  RigidConstraint.prototype.resolve = function(time) {
    var center = this.getCenterMass();
    var angleDelta = 0;

    var i = -1, len = this.particles.length;

    while (++i < len) {
      var currentDelta = this.particles[i].position.clone().sub(center);
      var targetDelta = this.deltas[i];

      // console.log('currentDelta.getAngleTo:', currentDelta.getAngleTo(targetDelta));

      var diff = targetDelta.getAngleTo(currentDelta);
      // if (diff <= -Math.PI) diff += 2*Math.PI;
      // else if (diff >= Math.PI) diff -= 2*Math.PI;

      angleDelta += diff;
    }

    angleDelta /= len;

    // if (angleDelta <= -Math.PI) angleDelta += 2*Math.PI;
    // else if (angleDelta >= Math.PI) angleDelta -= 2*Math.PI;

    // if (angleDelta !== 0) console.log('angleDelta:', angleDelta);

    // console.log('angleDelta:', angleDelta);

    //angleDelta *= 29;

    for (i = -1; ++i < len;) {
      var goal = this.deltas[i].clone().rotateBy(angleDelta).add(center);
      // console.log('goal:', goal);

      var diff = goal.sub(this.particles[i].position);

      if (!this.particles[i].pinned) this.particles[i].position.add(diff.scale(0.001));
    }
  };

  Newton.RigidConstraint = RigidConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
