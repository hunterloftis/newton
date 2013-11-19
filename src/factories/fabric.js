;(function(Newton) {

  'use strict'

  function Fabric(x1, y1, x2, y2, width, height) {
    var spacing = (x2 - x1) / width;
    var body = Newton.Body();
    var particle;

    for (var w = 0; w < width; w++) {
      for (var h = 0; h < height; h++) {
        particle = body.Particle(x1 + w * spacing, y1 + h * spacing);
        if (h === 0) particle.pin();
      }
    }

    for (var w = 0; w < width; w++) {
      for (var h = 0; h < height; h++) {
        if (h > 0) body.DistanceConstraint(body.particles[w * height + h], body.particles[w * height + h - 1], 0.2);
        if (w > 0) body.DistanceConstraint(body.particles[w * height + h], body.particles[w * height + h - height], 0.2);
        if (w === 0 && h > 0) body.Edge(body.particles[w * height + h], body.particles[w * height + h - 1]);
        if (h === height - 1 && w > 0) body.Edge(body.particles[w * height + h], body.particles[w * height + h - height]);
        if (w === width - 1 && h > 0) body.Edge(body.particles[w * height + h - 1], body.particles[w * height + h]);
      }
    }

    return body;
  }

  Newton.Fabric = Fabric;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
