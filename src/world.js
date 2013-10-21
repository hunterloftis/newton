function World() {
  this.gravity = new Vector();
  this.systems = [];
}

World.prototype.setGravity = function(vec) {
  this.gravity = vec;
};

World.prototype.add = function(system) {
  this.systems.push(system);
};
