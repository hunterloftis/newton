;(function(Newton) {

  'use strict';

  'use strict'

  function Material(options) {
    if (!(this instanceof Material)) return new Material(options);
    options = options || {};
    this.weight = options.weight || 1;
    this.restitution = options.restitution || 1;
    this.friction = options.friction || 0;
    this.maxVelocity = options.maxVelocity || 100;
    this.maxVelocitySquared = this.maxVelocity * this.maxVelocity;
  }

  Material.prototype.setMaxVelocity = function(v) {
    this.maxVelocity = v;
    this.maxVelocitySquared = v * v;
    return this;
  };

  Material.simple = new Material();

  Newton.Material = Material;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
