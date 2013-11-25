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

    // Another idea: instead of figuring out where the particle should go (and maybe allowing the particle to tunnel through and wrap)
    // we should send a line back through to the volume's centerpoint
    // (to encourage volumes to stick together)
    // but who knows, this might work fine
    // plus that solution would be weird for free particles and for bodies with arms etc

    // TODO: compare by squared distances

    var pos = particle.position;

    if (pointInPoly(pos, poly)) {
      var solution;
      var nearest = Infinity;
      for (var i = 1; i < this.particles.length; i++) {
        var projection = particle.position.clone().projectSegment(
          this.particles[i - 1].position, this.particles[i].position).sub(particle.position);

        var distance = projection.getLength();
        if (distance < nearest) {
          solution = {
            correction: projection.scale(0.8),  // TODO: figure out a good scaling factor
            particle: particle,
            v1: this.particles[i - 1],
            v2: this.particles[i]
          };
          nearest = distance;
        }
      }
      return solution;
    }

    return false;
  };

  Newton.Volume = Volume;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
