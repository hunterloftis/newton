;(function() {

  function Layer() {
    if (!(this instanceof Layer)) return new Layer();
    this.bodies = [];
    this.forces = [];
    this.watchedLayers = [this];
    this.wrapper = undefined;
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

  // TODO: cache or precompute all these lookups and collations
  Layer.prototype.integrate = function(time) {
    var i, ilen, j, jlen, forces, particles, particle, edges;

    // find all watched forces & local forces
    // find all watched particles & edges
    // loop through all particles and:
    // - apply forces to it
    // - integrate it
    // - wrap it
    // - find and resolve edge collisions (TODO)

    forces = [];
    particles = [];
    edges = [];

    // TODO: figure out how to manage all these different overlapping groups

    for (i = 0, ilen = this.bodies.length; i < ilen; i++) {
      particles = particles.concat(this.bodies[i].particles);
    }

    for (i = 0, ilen = this.watchedLayers.length; i < ilen; i++) {
      forces = forces.concat(this.watchedLayers[i].forces);
      for (var j = 0, jlen = this.watchedLayers[i].bodies.length; j < jlen; j++) {
        edges = edges.concat(this.watchedLayers[i].bodies[j].edges);
      }
    }

    for (i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      for (j = 0, jlen = forces.length; j < jlen; j++) {
        forces[j].applyTo(particle);
      }
      particle.integrate(time);
      if (this.wrapper) particle.wrap(this.wrapper);

      particle.collide(edges);  // TODO: asymmetrical collision resolution
    }
  };

  window.Newton = window.Newton || {};
  window.Newton.Layer = Layer;

})();