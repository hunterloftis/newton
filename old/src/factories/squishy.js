;(function(Newton) {

  'use strict'

  function Squishy(ox, oy, r, points) {
    var spacing = (Math.PI * 2) / points;
    var body = Newton.Body();

    var anchor = Newton.Particle(ox, oy);
    var volume = [];

    for (var i = 0; i < points; i++) {
      var x = ox + r * Math.cos(i * spacing - Math.PI * 0.5);
      var y = oy + r * Math.sin(i * spacing - Math.PI * 0.5);
      body.Particle(x, y);
      for (var j = 0; j < i; j++) {
        body.DistanceConstraint(body.particles[i], body.particles[j], 0.008);
      }
      volume.push(body.particles[i])
      body.DistanceConstraint(body.particles[i], anchor, 0.008);
    }
    volume.push(body.particles[0]);

    body.addParticle(anchor);
    body.Volume(volume);

    return body;
  }

  Newton.Squishy = Squishy;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
