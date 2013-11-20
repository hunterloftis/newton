;(function(Newton) {

  'use strict'

  function Squishy(ox, oy, r, points) {
    var spacing = (Math.PI * 2) / points;
    var body = Newton.Body();

    var anchor = Newton.Particle(ox, oy);

    for (var i = 0; i < points; i++) {
      var x = ox + r * Math.cos(i * spacing - Math.PI * 0.5);
      var y = oy + r * Math.sin(i * spacing - Math.PI * 0.5);
      body.Particle(x, y);
      for (var j = 0; j < i; j++) {
        body.DistanceConstraint(body.particles[i], body.particles[j], 0.008);
      }
      if (i > 0) body.Edge(body.particles[i - 1], body.particles[i]);
      body.DistanceConstraint(body.particles[i], anchor, 0.008);
    }
    body.Edge(body.particles[points - 1], body.particles[0]);

    body.addParticle(anchor);

    return body;
  }

  Newton.Squishy = Squishy;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
