;(function(Newton) {

  'use strict'

  function noop() {}

  function prioritySort(a, b) {
    return b.priority - a.priority || a.id - b.id;
  }

  if(!Array.isArray) {
    Array.isArray = function (vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }

  function Simulator(callback, renderers, integrationFps, iterations, warp) {
    if (!(this instanceof Simulator)) return new Simulator(callback, renderers, integrationFps, iterations, warp);

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
    this.warp = warp || 1;

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

    // fixed-timestep physics simulation
    while (this.accumulator >= this.simulationStep * this.warp) {
      this.simulate(this.simulationStep, time - this.startTime);
      this.accumulator -= this.simulationStep * this.warp;
    }

    // arbitrary-timestep rendering
    for (var i = 0; i < this.renderers.length; i++) {
      this.renderers[i](step, this);
    }

    // framerate monitoring
    this.frames++;
    if (time >= this.countTime) {
      this.fps = (this.frames / (this.countInterval + time - this.countTime) * 1000).toFixed(0);
      this.frames = 0;
      this.countTime = time + this.countInterval;
    }

    // requestAnimationFrame
    Newton.frame(this.step);
  };

  Simulator.prototype.simulate = function(time, totalTime) {
    this.cull(this.particles);
    this.cull(this.constraints);
    this.cull(this.edges);

    this.callback(time, this, totalTime);
    this.integrate(time);
    this.constrain(time);
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

  Simulator.prototype.collide = function(time) {
    var collisions;

    do {
      collisions = this.detectCollisions(time);
      this.resolveCollisions(time, collisions);
    } (while collisions.length > 0)
  };

  Simulator.prototype.detectCollisions = function(time) {
    var particles = this.collisionParticles;
    var edges = this.edges;
    var layers = this.layers;

    var hit, particle, edge, linked;

    var emptyLink = [];
    var collisions = [];

    // Loop through all collision particles (particles that are part of edges)
    for (var i = 0, ilen = particles.length; i < ilen; i++) {
      particle = particles[i];
      linked = particle.layer ? layers[particle.layer].linked : emptyLink;
      hit = undefined;

      particle.colliding = false;
      particle.isCollisionPoint = false;
      particle.correction.set(0, 0);

      // Loop through all edges to see if this particle ran into the edge
      for (var j = 0, jlen = edges.length; j < jlen; j++) {
        edge = edges[j];
        if (i === 0) edge.update();
        if (!edge.layer || linked.indexOf(edge.layer) !== -1) {
          if (particle !== edge.p1 && particle !== edge.p2) {

            hit = edge.getCollision(particle);

            if (hit) collisions.push({
              particle: particle,
              edge: edge,
              correction: hit,
              distance: hit.getLength()
            });
          }
        }
      } // edges
    } // particles

    return collisions;
  };

  Simulator.prototype.resolveCollisions = function(time, collisions) {

  };

  // TODO: expand this naive approach
  Simulator.prototype.resolveCollisionsOld = function(time, collisions) {
    // idea 1 - sort collisions by penetration depth and solve the largest first
    // flag all participants as "colliding = false" in detect step, then true here at resolution
    // if any participants in a collision have colliding == true, then they have already
    // collided and should be skipped

    // idea 2 - sort collisions globally by correction distance,
    // prevent duplicate edge/edge collisions,
    // sum total differences of corrections per particle eg:
    // var correctionDelta = thisCorrection.sub(p.correction); (make sure same sign?)
    // p.correction.add(correctionDelta);

    // idea 3 - add "near" filter back to detection above
    // then use total correction distance summing

    // sort collisions globally
    collisions.sort(function(a, b) {
      return b.penetration - a.penetration
    });

    for (var i = 0, ilen = collisions.length; i < ilen; i++) {
      var collision = collisions[i];
      var particle = collision.particle;
      var edge = collision.edge;
      var correction = collision.correction;

      if (!particle.isCollisionPoint) {

        var pInvMass = 1 / particle.getMass();
        var eInvMass = 2 / (edge.p1.getMass() + edge.p2.getMass());
        var massTotal = pInvMass + eInvMass;

        particle.colliding = edge.p1.colliding = edge.p2.colliding = true;
        particle.isCollisionPoint = true;

        var pCorrect = correction.clone().scale(pInvMass / massTotal);
        var eCorrect = correction.clone().scale(-eInvMass / massTotal);

        var velocity = particle.position.clone().sub(particle.lastPosition).getLength();

        particle.correction.merge(pCorrect);
        edge.p1.correction.merge(eCorrect);
        edge.p2.correction.merge(eCorrect);
      }
    }
    //if (collisions.length) throw new Error('ok');

    for (var i = 0; i < this.collisionParticles.length; i++) {
      if (this.collisionParticles[i].colliding) {
        this.collisionParticles[i].position.add(this.collisionParticles[i].correction);
        this.collisionParticles[i].stop();
      }
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
    return this;
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

  Newton.Simulator = Simulator;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
