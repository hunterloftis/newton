;(function(Newton) {

  'use strict'

  function map(array, fn) {
    var index = -1;
    var length = array.length;
    var result = Array(length);
    while (++index < length) {
      result[index] = fn(array[index]);
    }
    return result;
  }

  function RigidConstraint(particles, iterations) {
    if (!(this instanceof RigidConstraint)) return new RigidConstraint(particles, iterations);

    this.particles = particles;
    this.centerMass = this.getCenterMass();
    this.baseAngle = this.getAverageAngle();
    this.deltas = this.getDeltas();

    console.log('centerMass:', this.getCenterMass());
    console.log('averageAngle:', this.getAverageAngle());
    console.log('deltas:', this.getDeltas());
  }

  RigidConstraint.prototype.category = 'rigid';

  RigidConstraint.prototype.getCenterMass = function() {
    var centerMass = Newton.Vector(0, 0);
    var length = this.particles.length;
    var index = -1;

    while (++index < length) {
      centerMass.add(this.particles[index].position);
    }
    centerMass.scale(1 / length);

    return centerMass;
  };

  RigidConstraint.prototype.getAverageAngle = function() {
    var average = 0;
    var delta = Newton.Vector();
    var length = this.particles.length;
    var index = -1;
    var centerMass = this.getCenterMass();

    while (++index < length) {
      delta.copy(this.particles[index].position).sub(centerMass);
      average += delta.getAngle();
    }

    return average;
  };

  RigidConstraint.prototype.getDeltas = function() {
    var centerMass = this.getCenterMass();
    var delta = Newton.Vector();

    return map(this.particles, function(particle) {
      delta.copy(particle.position).sub(centerMass);
      return {
        distance: delta.getLength(),
        angle: delta.getAngle(),
        delta: delta.clone()
      };
    });
  }

  var flags = 0;

  RigidConstraint.prototype.resolve = function(time) {
    var centerMass = this.getCenterMass();
    var angle = this.getAverageAngle() - this.baseAngle;
    var length = this.particles.length;
    var index = -1;
    var delta;
    var correctedPosition = Newton.Vector();

    if (flags++ < 30) console.log('angle:', angle);

    while(++index < length) {
      delta = this.deltas[index];
      correctedPosition.copy(centerMass).add(delta.delta);
      // correctedPosition
      //   .copy(centerMass)
      //   .addXY(delta.distance, 0)
      //   .rotate(delta.angle);
      this.particles[index].moveTo(correctedPosition.x, correctedPosition.y);
    }

    this.centerMass = centerMass;
  };

  Newton.RigidConstraint = RigidConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
