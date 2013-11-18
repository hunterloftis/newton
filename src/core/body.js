;(function(Newton) {

  'use strict'

  function Body(material) {
    if (!(this instanceof Body)) return new Body(material);

    this.particles = [];
    this.edges = [];
    this.constraints = [];

    this.material = material; // TODO: make this matter

    this.simulator = undefined;
    this.layer = undefined;

    this.isFree = false;
  }

  Body.prototype.addTo = function(simulator, layer) {
    if (this.simulator) throw new Error('Not implemented: reparenting a body');

    // Add our particles, edges, and constraints to the simulation
    simulator.addParticles(this.particles);
    simulator.addEdges(this.edges);
    simulator.addConstraints(this.constraints);

    this.simulator = simulator;
    this.layer = layer;

    // TODO: this is hacky
    for (var i = 0, ilen = this.particles.length; i < ilen; i++) {
      this.particles[i].layer = layer;
    }
    for (var i = 0, ilen = this.edges.length; i < ilen; i++) {
      this.edges[i].layer = layer;
    }
  };

  Body.prototype.free = function() {
    this.isFree = true;
    if (this.simulator) this.simulator.addCollisionParticles(this.particles);
  }

  Body.prototype.addParticle = function(particle) {
    this.particles.push(particle);
    particle.layer = this.layer;  // TODO: make sure this stays in sync
    if (this.simulator) {
      this.simulator.addParticles([particle]);
      if (this.isFree) this.simulator.addCollisionParticles([particle]);
    }
  };

  Body.prototype.Particle = function() {
    var particle = Newton.Particle.apply(
      Newton.Particle, Array.prototype.slice.call(arguments));
    this.addParticle(particle);
    return particle;
  }

  Body.prototype.addEdge = function(edge) {
    this.edges.push(edge);
    edge.layer = this.layer;
    if (this.simulator) this.simulator.addEdges([edge]);
  };

  Body.prototype.Edge = function() {
    var edge = Newton.Edge.apply(
      Newton.Edge, Array.prototype.slice.call(arguments));
    this.addEdge(edge);
    return edge;
  };

  Body.prototype.addConstraint = function(constraint) {
    this.constraints.push(constraint);
    if (this.simulator) this.simulator.addConstraints([constraint]);
  };

  Body.prototype.DistanceConstraint = function() {
    var constraint = Newton.DistanceConstraint.apply(
      Newton.DistanceConstraint, Array.prototype.slice.call(arguments));
    this.addConstraint(constraint);
    return constraint;
  };

  Body.prototype.RigidConstraint = function() {
    var constraint = Newton.RigidConstraint.apply(
      Newton.RigidConstraint, Array.prototype.slice.call(arguments));
    this.addConstraint(constraint);
    return constraint;
  };

  Body.prototype.AngleConstraint = function() {
    var constraint = Newton.AngleConstraint.apply(
      Newton.AngleConstraint, Array.prototype.slice.call(arguments));
    this.addConstraint(constraint);
    return constraint;
  }

  Newton.Body = Body;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
