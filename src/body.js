;(function(Newton) {

  'use strict'

  function Body(material) {
    if (!(this instanceof Body)) return new Body(material);

    this.particles = [];
    this.edges = [];
    this.constraints = [];

    this.material = material; // TODO: make this matter

    this.simulator = undefined;
    this.simParticles = [];     // Quick reference for this.simulator.particles
    this.simEdges = [];         // Quick reference for this.simulator.edges
    this.simConstraints = [];   // Quick reference for this.simulator.constraints
  }

  Body.prototype.addTo = function(simulator) {
    if (this.simulator) throw new Error('Not implemented: reparenting a body');

    // Add our particles, edges, and constraints to the simulation
    this.simParticles = simulator.particles;
    this.simEdges = simulator.edges;
    this.simParticles.push.apply(this.simParticles, this.particles);
    this.simEdges.push.apply(this.simEdges, this.edges);
    this.simConstraints = simulator.constraints;
    this.simConstraints.push.apply(this.simConstraints, this.constraints);

    this.simulator = simulator;
  };

  Body.prototype.addParticle = function(particle) {
    this.particles.push(particle);
    this.simParticles.push(particle);
  };

  Body.prototype.Particle = function() {
    var particle = Newton.Particle.apply(
      Newton.Particle, Array.prototype.slice.call(arguments));
    this.addParticle(particle);
    return particle;
  }

  Body.prototype.addEdge = function(edge) {
    this.edges.push(edge);
    this.simEdges.push(edge);
  };

  Body.prototype.Edge = function() {
    var edge = Newton.Edge.apply(
      Newton.Edge, Array.prototype.slice.call(arguments));
    this.addEdge(edge);
    return edge;
  };

  Body.prototype.addConstraint = function(constraint) {
    this.constraints.push(constraint);
    this.simConstraints.push(constraint);
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

  Newton.Body = Body;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
