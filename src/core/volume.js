;(function(Newton) {

  'use strict'

  function pointInPoly(pt, poly){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);
    return c;
  }

  function Volume(particles, material) {
    if (!(this instanceof Volume)) return new Volume(particles, material);

    this.particles = [];
    this.material = material || Newton.Material.simple;

    this.layer = undefined;

    this.setParticles(particles);
  };

  Volume.COLLISION_TOLERANCE = 0.5;

  Volume.prototype.setParticles = function(particles) {
    particles.push(particles[0]);
    this.particles = particles;
    return this;
  };

  Volume.prototype.getCollision = function(particle) {
    // TODO: optimize this, start by looking at bounding boxes

    var poly = [];
    for (var i = 0; i < this.particles.length; i++) {
      poly.push(this.particles[i].position);
    }

    if (pointInPoly(particle.position, poly)) {
      var solution;
      var nearest = Infinity;
      for (var i = 1; i < this.particles.length; i++) {
        var point = this.particles[i - 1].position;
        var dir = this.particles[i].position.clone().sub(point);
        var projection = particle.position.clone().projectOnto(point, dir).sub(particle.position).scale(0.001);
        var distance = projection.getLength();
        if (distance < nearest) {
          solution = projection;
          nearest = distance;
        }
      }
      return solution;
    }

    return false;
  };

  Newton.Volume = Volume;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
