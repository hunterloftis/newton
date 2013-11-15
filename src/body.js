;(function(Newton) {

  'use strict'

  function Body(material) {
    if (!(this instanceof Body)) return new Body(material);

    this.particles = [];
    this.edges = [];
    this.constraints = [];

    this.material = material; // TODO: make this matter

    this.simulator = undefined;
  }

  Body.prototype.addTo = function(simulator) {
    if (this.simulator) throw new Error('Not implemented: reparenting a body');

    // Add our particles, edges, and constraints to the simulation
    simulator.addParticles(this.particles);
    simulator.addEdges(this.edges);
    simulator.addConstraints(this.constraints);

    this.simulator = simulator;
  };

  Body.prototype.addParticle = function(particle) {
    this.particles.push(particle);
    if (this.simulator) this.simulator.addParticles([particle]);
  };

  Body.prototype.Particle = function() {
    var particle = Newton.Particle.apply(
      Newton.Particle, Array.prototype.slice.call(arguments));
    this.addParticle(particle);
    return particle;
  }

  Body.prototype.addEdge = function(edge) {
    this.edges.push(edge);
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

  Newton.Body = Body;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
