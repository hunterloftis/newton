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

    this.particles = particles || [];
    this.material = material || Newton.Material.simple;

    this.layer = undefined;
  };

  Volume.COLLISION_TOLERANCE = 0.5;


  Newton.Volume = Volume;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
