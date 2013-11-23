;(function(Newton) {

  'use strict'

  // TODO: try to extend this outward a bit?
  function pointInPoly(pt, poly){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);
    return c;
  }

  function Edge(p1, p2, material) {
    if (!(this instanceof Edge)) return new Edge(p1, p2, material);

    this.p1 = p1;
    this.p2 = p2;
    this.material = material || Newton.Material.simple;

    this.layer = undefined;

    this.vector = Newton.Vector();
    this.normal = Newton.Vector();
    this.bounds = Newton.Rectangle();
    this.testRect = Newton.Rectangle();

    this.update();
  };

  Edge.COLLISION_TOLERANCE = 0.5;

  Edge.getAbc = function(x1, y1, x2, y2) {
    var a = y2 - y1;
    var b = x1 - x2;
    var c = a * x1 + b * y1;

    return { a: a, b: b, c: c };
  };

  Edge.prototype.update = function() {
    this.vector
      .copy(this.p2.position)
      .sub(this.p1.position);

    this.normal
      .copy(this.vector)
      .turnLeft()
      .unit();

    this.bounds
      .setV(this.p1.position, this.p2.position)
      .expand(Edge.COLLISION_TOLERANCE);
  };

  Edge.prototype.getCollision = function(particle) {
    var inside = particle.lastPosition
      .getProjection(this.p1.lastPosition, this.lastNormal);

    // >= means it was already inside at the beginning of the frame
    if (inside >= 0) return false;

    var outside = particle.position
      .getProjection(this.p1.position, this.normal);

    // < 0 means it ended up outside at the end of the frame anyway
    if (outside < 0) return false;

    // if true then the particle's trajectory could never hit this edge
    if (this.getIsWider(last, pos)) return false;

    // return the correction vector
    return this.clone().applyProjection(inside, this.normal).sub(this);
  };

  Edge.prototype.findEdgeParticle = function(v1, v2) {
    // TODO: implement check for whether v2 is inside of the polygon made by this edge + this edge's last step
    // TODO: find closest point to v2 on this edge if v2 is inside this poly
    // TODO: return vector for correction of particle at v2

    var poly = [
      this.p1.lastPosition, this.p2.lastPosition,
      this.p2.position, this.p1.position
    ];

    if (pointInPoly(v2, poly)) {
      var targetPoint = this.p1.position.clone().add(this.p2.position).scale(0.5).add(this.normal);
      return targetPoint.sub(v2);
    }

    return false;
  };

  // TODO: implement some method of getting bounds etc of the last position if this thing
  // then use that if last == true
  Edge.prototype.findParticleEdge = function(v1, v2, last) {
    var x1 = v1.x;
    var y1 = v1.y;
    var x2 = v2.x;
    var y2 = v2.y;

    // Dot product determines whether particle is moving towards (>0) or away (<0)
    // var dot = Newton.Vector.claim().set(x2 - x1, y2 - y1).free().getDot(this.normal);
    // if (dot >= 0) return false;

    // var bounds1 = this.bounds;
    // var bounds2 = this.testRect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);

    if (last) {
      var bounds1 = Newton.Rectangle
        .fromVectors(this.p1.lastPosition, this.p2.lastPosition)
        .expand(Edge.COLLISION_TOLERANCE);
        var bounds2 = this.testRect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);
      var p1 = this.p1.lastPosition;
      var p2 = this.p2.lastPosition;
    }
    else {
      var bounds1 = Newton.Rectangle
        .fromVectors(this.p1.position, this.p2.position)
        .expand(Edge.COLLISION_TOLERANCE);
        var bounds2 = this.testRect.set(x1, y1, x2, y2).expand(Edge.COLLISION_TOLERANCE);
      var p1 = this.p1.position;
      var p2 = this.p2.position;
    }

    if (!bounds1.overlaps(bounds2)) return false;

    var l1 = Edge.getAbc(p1.x, p1.y, p2.x, p2.y);
    var l2 = Edge.getAbc(x1, y1, x2, y2);
    var det = l1.a * l2.b - l2.a * l1.b;

    if (det === 0) return false;

    var x = (l2.b * l1.c  - l1.b * l2.c) / det;
    var y = (l1.a * l2.c - l2.a * l1.c) / det;

    if ( !(bounds1.contains(x, y) && bounds2.contains(x, y)) ) return false;

    return Newton.Vector(x - x2, y - y2).add(this.normal);
  };

  // friction = range(0, 1)
  // restitution = range(0.1, 1)
  Edge.prototype.getReflection = function(velocity, restitution) {
    var dir = this.normal.clone();
    var friction = this.material.friction;
    var velN = dir.scale(velocity.getDot(dir)).scale(restitution);
    var velT = velocity.clone().sub(velN).scale(1 - friction);
    var reflectedVel = velT.sub(velN);
    return reflectedVel;
  };

  Edge.prototype.getCoords = function() {
    return {
      x1: this.p1.position.x,
      y1: this.p1.position.y,
      x2: this.p2.position.x,
      y2: this.p2.position.y
    };
  };

  Newton.Edge = Edge;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
