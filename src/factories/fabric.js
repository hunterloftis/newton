;(function(Newton) {

  'use strict'

  function Fabric(x1, y1, x2, y2, width, height) {
    var spacing = (x2 - x1) / width;
    var body = Newton.Body();
    var particle;

    var top = [], right = [], bottom = [], left = [];

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

        var current = body.particles[w * height + h];

        if (h === 0) top.push(current);
        else if (h === height - 1 && w < width - 1) bottom.push(current);
        if (w === 0 && h > 0) left.push(current);
        else if (w === width - 1 && h > 0) right.push(current);
      }
    }

    bottom.reverse();
    left.reverse();

    body.Volume(top.concat(right, bottom, left));

    return body;
  }

  Newton.Fabric = Fabric;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
