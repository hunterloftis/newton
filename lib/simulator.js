var Emitter = require('eventemitter2').EventEmitter2;
var onFrame = require('./frame').onFrame;
var Accumulator = require('./accumulator');

function Simulator() {
  if (!(this instanceof Simulator)) return new Simulator();

  Emitter.call(this);

  this._step = this._step.bind(this);
  this._stepInterval = 1000 / 60;     // TODO: option
  this._running = false;
  this._accumulator = undefined;
  this._particles = [];
  this._bodies = [];
  this._forces = [];
  this._constraints = [];
  this._iterations = 10;             // TODO: option
}

Simulator.prototype = Object.create(Emitter.prototype);

Simulator.prototype.start = function() {
  this._running = true;
  this._accumulator = new Accumulator(this._stepInterval, 100);
  onFrame(this._step);
};

Simulator.prototype.add = function(entity) {
  if (entity.type === 'Particle') this._particles.push(entity);
  else if (entity.type === 'Force') this._forces.push(entity);
  else if (entity.type === 'Constraint') {
    this._constraints.push(entity);
    this._constraints.sort(prioritySort);
  }
  else if (entity.type === 'Body') {
    this._bodies.push(entity);
    entity.setSimulator(this);
  }
};

Simulator.prototype.getParticles = function() {
  return this._particles;
};

Simulator.prototype._step = function() {
  if (!this._running) return;

  var time;
  var interval = this._accumulator.freeze();
  while (time = this._accumulator.next()) {
    this._simulate(interval, time);
  }

  onFrame(this._step);
};

Simulator.prototype._simulate = function(time, totalTime) {
  this._integrate(time);
  this._constrain(time);
};

Simulator.prototype._integrate = function(time) {
  var particles = this._particles;
  var forces = this._forces;
  var particle, force;

  for (var p = 0; p < particles.length; p++) {
    particle = particles[p];
    for (var f = 0; f < forces.length; f++) {
      force = forces[f];
      force.applyTo(particle);
    }
    particle.integrate(time);
  }
};

Simulator.prototype._constrain = function(time) {
  var constraints = this._constraints;
  var particles = this._particles;

  for (var i = 0; i < this._iterations; i++) {
    for (var c = 0; c < constraints.length; c++) {
      constraints[c].correct(time, particles);
    }
  }
};

module.exports = Simulator;

function prioritySort(a, b) {
  return b.priority - a.priority || b.id - a.id;
}
