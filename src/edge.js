;(function(Newton) {

  'use strict';

  function Edge(p1, p2, material) {
    if (!(this instanceof Edge)) return new Edge(p1, p2, material);
    this.p1 = p1;
    this.p2 = p2;
    this.material = material || Material.simple;

    this.compute();

    this._rect = new Newton.Rectangle(0, 0, 0, 0);
  };

  Edge.COLLISION_TOLERANCE = 0.5;

  Edge.getAbc = function(x1, y1, x2, y2) {
    var a = y2 - y1;
    var b = x1 - x2;
    var c = a * x1 + b * y1;

    return { a: a, b: b, c: c };
  };

  // TODO: currently assuming that particles are stationary, need to compute() after changes
  Edge.prototype.compute = function() {
    this.anchor = this.p1.position.clone();                       // TODO: tightly coupled
    this.vector = this.p2.position.clone().sub(this.p1.position);  // TODO: ditto
    this.length = this.vector.getLength();
    this.angle = this.vector.getAngle();
    this.normal = this.vector.clone().turnLeft().unit();
    this.unit = this.vector.clone().unit();
    this.bounds = Newton.Rectangle
      .fromVectors(this.p1.position, this.p2.position)
      .expand(Edge.COLLISION_TOLERANCE);
  };

  Edge.prototype.getCoords = function() {
    return {
      x1: this.p1.position.x,
      y1: this.p1.position.y,
      x2: this.p2.position.x,
      y2: this.p2.position.y
    };
  };

  Edge.prototype.getRepelled = function(x, y) {
    return new Newton.Vector(x, y).add(this.normal);
  };

  Edge.prototype.getProjection = function(vector) {
    var dot = this.vector.getDot(vector);
    return this.unit.clone().scale(dot);
  };

  Edge.prototype.getAngleDelta = function(vector) {
    return this.angle - vector.getAngle();
  };

  Edge.prototype.getAbc = function() {
    return Edge.getAbc(this.p1.position.x, this.p1.position.y,
      this.p2.position.x, this.p2.position.y);
  }

  Edge.prototype.findIntersection = function(x1, y1, x2, y2) {
    var bounds1 = this.bounds;
    var bounds2 = this._rect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);

    if (!bounds1.overlaps(bounds2)) return false;

  //  debugger;

    var l1 = this.getAbc();
    var l2 = Edge.getAbc(x1, y1, x2, y2);
    var det = l1.a * l2.b - l2.a * l1.b;

    if (det === 0) return false;

    var x = (l2.b * l1.c  - l1.b * l2.c) / det;
    var y = (l1.a * l2.c - l2.a * l1.c) / det;

    if ( !(bounds1.contains(x, y) && bounds2.contains(x, y)) ) return false;

    // TODO: figure out whether this should be moved up or if it's too expensive
    var coords = this.getCoords();
    var dot = x1 * coords.x1 + y1 * coords.y1;

    if (dot >= 0) return false;

    return {
      x: x,
      y: y
    };
  };

  // friction = range(0, 1)
  // restitution = range(0.1, 1)
  Edge.prototype.getReflection = function(velocity, restitution) {
    var dir = this.normal.clone();
    var friction = this.material.friction;
    var velN = dir.multScalar(velocity.getDot(dir)).multScalar(restitution);
    var velT = velocity.clone().sub(velN).multScalar(1 - friction);
    var reflectedVel = velT.sub(velN);
    return reflectedVel;
  };

  Newton.Edge = Edge;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
