function Body() {
  if (!(this instanceof Body)) return new Body();

  this._entities = [];
  this._sim = undefined;
}

Body.prototype.type = 'Body';

Body.prototype.add = function(entity) {
  this._entities.push(entity);
  if (this._sim) this._sim.add(entity);
  return entity;
};

Body.prototype.setSimulator = function(sim) {
  this._sim = sim;
  for (var i = 0; i < this._entities.length; i++) {
    sim.add(this._entities[i]);
  }
};

module.exports = Body;
