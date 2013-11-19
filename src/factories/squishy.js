;(function(Newton) {

  'use strict'

  function Squishy(ox, oy, r, points) {
    var spacing = (Math.PI * 2) / points;

    var body = Newton.Body();
    var anchor = body.Particle(ox, oy);

    var current, last;

    for (var i = 1; i <= points; i++) {
      var x = ox + r * Math.cos(i * spacing + Math.PI * 0.5);
      var y = oy + r * Math.sin(i * spacing + Math.PI * 0.5);
      current = body.Particle(x, y);
      if (last) {
        body.Edge(last, current);
        body.DistanceConstraint(last, current);
        if (i > 3) {
          body.AngleConstraint(body.particles[i - 1], body.particles[i - 2], body.particles[i]);
        }
      }
      last = current;
    }
    body.Edge(last, body.particles[1]);
    body.DistanceConstraint(last, body.particles[1]);

    body.DistanceConstraint(body.particles[0], body.particles[1], 0.05);
    body.DistanceConstraint(body.particles[0], body.particles[points], 0.05);

    return body;
  }

  Newton.Squishy = Squishy;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
