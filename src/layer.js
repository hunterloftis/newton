function Layer() {
  this.bodies = [];
  this.forces = [];
  this.watchedLayers = [];
  this.wrapper = undefined;
}

Layer.prototype.watch = function(layers) {
  this.watchedLayers.concat(layers);
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
