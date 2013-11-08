;(function(Newton) {

  'use strict';

  'use strict'

  function Layer() {
    if (!(this instanceof Layer)) return new Layer();
    this.bodies = [];
    this.forces = [];
    this.watchedLayers = [this];
    this.wrapper = undefined;

    // TODO: add flags when things change to invalidate these caches
    // instead of invalidating them at the beginning of every frame
    this.cachedParticles = [];
    this.cachedForces = [];
    this.cachedEdges = [];
  }

  Layer.prototype.respondTo = function(layers) {
    this.watchedLayers = layers || [];
    return this;
  };

  Layer.prototype.addForce = function(force) {
    this.forces.push(force);
    return this;
  };

  Layer.prototype.wrapIn = function(rect) {
    this.wrapper = rect;
    return this;
  };

  Layer.prototype.addBody = function(body) {
    this.bodies.push(body);
    return this;
  };

  // TODO: measure the performance impact of these collations
  Layer.prototype.collect = function(time) {
    var particles = this.cachedParticles;
    var forces = this.cachedForces;
    var edges = this.cachedEdges;
    var bodies = this.bodies;
    var watched = this.watchedLayers;
    var i, ilen, j, jlen;

    particles.length = 0;
    forces.length = 0;
    edges.length = 0;

    for (i = 0, ilen = bodies.length; i < ilen; i++) {
      particles.push.apply(particles, bodies[i].particles); // TODO: figure out if this is faster or slower than using concat and incurring GC penalties
    }

    for (i = 0, ilen = this.watchedLayers.length; i < ilen; i++) {
      forces.push.apply(forces, watched[i].forces);                   // TODO: ditto
      for (j = 0, jlen = watched[i].bodies.length; j < jlen; j++) {
        edges.push.apply(edges, watched[i].bodies[j].edges);          // TODO: ditto
      }
    }
  };

  Layer.prototype.integrate = function(time) {
    var particles = this.cachedParticles;
    var forces = this.cachedForces;
    var particle;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      for (var j = 0, jlen = forces.length; j < jlen; j++) {
        forces[j].applyTo(particle);
      }
      particle.integrate(time);
    }
  };

  Layer.prototype.constrain = function(time) {
    return;
    var particles = this.cachedParticles;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      if (this.wrapper) particles[i].wrap(this.wrapper);
    }
  };

  // TODO: right now this will check for particle -> edge collisions but not edge -> particle collisions
  Layer.prototype.collide = function(time) {
    var particles = this.cachedParticles;
    var edges = this.cachedEdges;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particles[i].collide(edges);
    }
  };

  Newton.Layer = Layer;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
