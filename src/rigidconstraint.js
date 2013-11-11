;(function(Newton) {

  'use strict'

  function RigidConstraint(particles, iterations) {
    if (!(this instanceof RigidConstraint)) return new RigidConstraint(particles, iterations);
  }

  RigidConstraint.prototype.resolve = function(time) {

  };

  Newton.RigidConstraint = RigidConstraint;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
