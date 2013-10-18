function Material(options) {
  options = options || {};
  this.weight = options.weight || 1;
  this.restitution = options.restitution || 1;
  this.drag = options.drag || 0;
}

Material.simple = new Material();
