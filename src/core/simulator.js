;(function(Newton) {

  'use strict'

  function noop() {}

  function prioritySort(a, b) {
    return b.priority - a.priority;
  }

  if(!Array.isArray) {
    Array.isArray = function (vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }

  function Simulator(callback, renderers, integrationFps, iterations) {
    if (!(this instanceof Simulator)) return new Simulator(callback, renderers, integrationFps, iterations);

    this.callback = callback || noop;
    this.renderers = renderers || noop;
    if (!Array.isArray(this.renderers)) this.renderers = [this.renderers];
    this.step = this._step.bind(this);
    this.lastTime = 0;
    this.running = false;
    this.fps = 0;
    this.frames = 0;
    this.countTime = 0;
    this.countInterval = 250;
    this.accumulator = 0;
    this.simulationStep = 1000 / (integrationFps || 60);
    this.iterations = iterations || 3;
    this.startTime = 0;

    this.layers = {};

    // The basic elements of the simulation
    this.particles = [];
    this.edges = [];
    this.forces = [];
    this.constraints = [];

    // only these particles can collide with things
    this.collisionParticles = [];
  }

  Simulator.prototype.start = function() {
    this.running = true;
    this.countTime = Date.now() + 1000;
    this.startTime = Date.now();
    Newton.frame(this.step);
  };

  Simulator.prototype.stop = function() {
    this.running = false;
  };

  Simulator.prototype._step = function() {
    if (!this.running) return;

    // slice of time
    var time = Date.now();
    var step = time - this.lastTime;
    this.lastTime = time;
    if (step > 100) step = 0;         // in case the page becomes inactive
    this.accumulator += step;

    while (this.accumulator >= this.simulationStep) {
      this.simulate(this.simulationStep, time - this.startTime);
      this.accumulator -= this.simulationStep;
    }

    for (var i = 0; i < this.renderers.length; i++) {
      this.renderers[i](step, this);
    }

    this.frames++;
    if (time >= this.countTime) {
      this.fps = (this.frames / (this.countInterval + time - this.countTime) * 1000).toFixed(0);
      this.frames = 0;
      this.countTime = time + this.countInterval;
    }

    Newton.frame(this.step);
  };

  Simulator.prototype.simulate = function(time, totalTime) {
    this.cull(this.particles);
    this.cull(this.constraints);
    this.callback(time, this, totalTime);
    this.integrate(time);
    this.constrain(time);
    this.updateEdges();   // TODO: fix this hack, edges should be more dynamic than they are
    this.collide(time);
  };

  Simulator.prototype.cull = function(array) {
    var i = 0;
    while (i < array.length) {
      if (array[i].isDestroyed) array.splice(i, 1);
      else i++;
    }
  };

  Simulator.prototype.integrate = function(time) {
    var particles = this.particles;
    var forces = this.forces;
    var particle, force;

    var layers = this.layers;
    var linked;
    var emptyLink = [];

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      linked = particle.layer ? layers[particle.layer].linked : emptyLink;
      if (!particle.pinned) {
        for (var j = 0, jlen = forces.length; j < jlen; j++) {
          force = forces[j];
          // TODO: optimize for speed
          if (!force.layer || linked.indexOf(force.layer) !== -1) {
            force.applyTo(particle);
          }
        }
      }
      particle.integrate(time);
    }
  };

  Simulator.prototype.constrain = function(time) {
    var constraints = this.constraints;

    for (var j = 0, jlen = this.iterations; j < jlen; j++) {
      for (var i = 0, ilen = constraints.length; i < ilen; i++) {
        constraints[i].resolve(time, this.particles);
      }
    }
  };

  Simulator.prototype.updateEdges = function() {
    for (var i = 0, ilen = this.edges.length; i < ilen; i++) {
      this.edges[i].compute();
    }
  };

  Simulator.prototype.collide = function(time) {
    var particles = this.collisionParticles;
    var edges = this.edges;
    var intersect;
    var particle, edge;
    var nearest;

    var layers = this.layers;
    var linked;
    var emptyLink = [];

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      linked = particle.layer ? layers[particle.layer].linked : emptyLink;
      intersect = undefined;
      nearest = undefined;
      for (var j = 0, jlen = edges.length; j < jlen; j++) {
        edge = edges[j];
        if (!edge.layer || linked.indexOf(edge.layer) !== -1) {
          if (particle !== edge.p1 && particle !== edge.p2) {
            intersect = edge.findIntersection(particle.lastPosition, particle.position);

            if (intersect && (!nearest || intersect.distance < nearest.distance)) {
              nearest = intersect;
            }
          }
        }
      }
      if (nearest) particle.collide(nearest);
    }
  };

  Simulator.prototype.ensureLayer = function(name) {
    if (!name) return;
    if (!this.layers[name]) this.layers[name] = {
      linked: [name]
    };
  };

  Simulator.prototype.add = function(entity, layer) {
    var entities = Array.isArray(entity) ? entity : [entity];

    this.ensureLayer(layer);
    while (entities.length) entities.shift().addTo(this, layer);

    return this;
  };

  Simulator.prototype.link = function(layer, linkedLayers) {
    this.ensureLayer(layer);
    this.layers[layer].linked = linkedLayers.split(' ');
    return this;
  };

  Simulator.prototype.addParticles = function(particles) {
    this.particles.push.apply(this.particles, particles);
  };

  Simulator.prototype.addEdges = function(edges) {
    this.edges.push.apply(this.edges, edges);
    for (var i = 0; i < edges.length; i++) {
      this.addCollisionParticles([edges[i].p1, edges[i].p2]);
    }
  };

  Simulator.prototype.addCollisionParticles = function(particles) {
    var i = particles.length;
    while (i--) if (this.collisionParticles.indexOf(particles[i]) === -1) {
      this.collisionParticles.push(particles[i]);
    }
    return this;
  };

  Simulator.prototype.addConstraints = function(constraints) {
    this.constraints.push.apply(this.constraints, constraints);
    this.constraints.sort(prioritySort);
  };

  // TODO: this could be dramatically optimized by starting with bounding boxes
  Simulator.prototype.findParticle = function(x, y, radius) {
    var particles = this.particles;
    var found = undefined;
    var nearest = radius;
    var distance;

    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      distance = particles[i].getDistance(x, y);
      if (distance <= nearest) {
        found = particles[i];
        nearest = distance;
      }
    }

    return found;
  };

  Simulator.prototype.addBody = function(body) {
    this.particles.push.apply(this.particles, body.particles);
    this.edges.push.apply(this.edges, body.edges);              // TODO: handle cases where the body's particles & edges change after adding
    this.bodies.push(body);
  };

  Simulator.prototype.Layer = function() {
    var newLayer = Newton.Layer();
    this.layers.push(newLayer);
    return newLayer;
  };

  Newton.Simulator = Simulator;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
