function Wall(x1, y1, x2, y2, oneWay) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.anchor = new Vector(x1, y1);
  this.vector = new Vector(x2 - x1, y2 - y1);
  this.oneWay = oneWay || false;
  this.length = this.vector.getLength();
  this.angle = this.vector.getAngle();
  this.normal = this.vector.clone().turnLeft().unit();
  this.unit = this.vector.clone().unit();
  this.bounds = new Rectangle(x1, y1, x2, y2).expand(Wall.COLLISION_TOLERANCE);
};

Wall.COLLISION_TOLERANCE = 0.5;

Wall.getAbc = function(x1, y1, x2, y2) {
  var a = y2 - y1;
  var b = x1 - x2;
  var c = a * x1 + b * y1;

  return { a: a, b: b, c: c };
};

Wall.prototype.getRepelled = function(x, y) {
  return new Vector(x, y).add(this.normal);
};

Wall.prototype.getProjection = function(vector) {
  var dot = this.vector.getDot(vector);
  return this.unit.clone().scale(dot);
};

Wall.prototype.getAngleDelta = function(vector) {
  return this.angle - vector.getAngle();
};

Wall.prototype.getAbc = function() {
  return Wall.getAbc(this.x1, this.y1, this.x2, this.y2);
}

Wall.prototype.findIntersection = function(x1, y1, x2, y2) {
  var bounds1 = this.bounds;
  var bounds2 = new Rectangle(x1, y1, x2, y2).expand(Wall.COLLISION_TOLERANCE);

  if (!bounds1.overlaps(bounds2)) return false;

  var l1 = this.getAbc();
  var l2 = Wall.getAbc(x1, y1, x2, y2);
  var det = l1.a * l2.b - l2.a * l1.b;

  if (det === 0) return false;

  var x = (l2.b * l1.c  - l1.b * l2.c) / det;
  var y = (l1.a * l2.c - l2.a * l1.c) / det;

  if ( !(bounds1.contains(x, y) && bounds2.contains(x, y)) ) return false;

  return {
    x: x,
    y: y
  };
};

Wall.prototype.getReflection = function(velocity, friction, restitution) {
  var normal = this.normal.clone();
  var normalVelocity = velocity.clone().getDot(this.unit);
  var projectedVelocity = this.unit.clone().scale(normalVelocity);
  //var tangentialVelocity = velocity.clone().sub(normalVelocity);
  //var reflectedVelocity = tangentialVelocity.sub(normalVelocity);
  //return reflectedVelocity;
  return projectedVelocity;
};

if (typeof module !== 'undefined') global.Wall = Wall;
