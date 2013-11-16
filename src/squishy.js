;(function(Newton) {

  'use strict'

  function Squishy(ox, oy, r, points) {
    var spacing = (Math.PI * 2) / points;

    var body = Newton.Body();
    var current, last;

    for (var i = 0; i < points; i++) {
      var x = ox + r * Math.cos(i * spacing);
      var y = oy + r * Math.sin(i * spacing);
      current = body.Particle(x, y);
      if (last && i > 1) body.Edge(last, current);
      last = current;
    }
    body.Edge(last, body.particles[1]);

    for (var i = 0; i < points; i++) {
      for (var j = i + 1; j < points; j++) {
        body.DistanceConstraint(body.particles[i], body.particles[j], 0.001);
      }
    }

    return body;
  }

  Newton.Squishy = Squishy;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
