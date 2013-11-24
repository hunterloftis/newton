;(function(Newton) {

  'use strict'

  function Lattice(x, y, segmentLength, segments, pinLeft, pinRight) {
    var body = Newton.Body();
    var top = body.Particle(x, y);
    var bottom = body.Particle(x, y + segmentLength);

    if (pinLeft) {
      top.pin();
      bottom.pin();
    }

    var vTop = [], vBottom = [];

    for (var i = 1; i <= segments; i++) {
      var nextTop = body.Particle(x + i * segmentLength, y);
      var nextBottom = body.Particle(x + i * segmentLength, y + segmentLength);

      body.DistanceConstraint(top, nextTop);
      body.DistanceConstraint(bottom, nextBottom);
      body.DistanceConstraint(top, nextBottom);
      body.DistanceConstraint(nextTop, bottom);

      body.DistanceConstraint(nextTop, nextBottom);

      vTop.push(top);
      vBottom.push(bottom);

      top = nextTop;
      bottom = nextBottom;
    }

    if (pinRight) {
      top.pin();
      bottom.pin();
    }

    vTop.push(top);
    vBottom.push(bottom);
    vBottom.reverse();
    body.Volume(vTop.concat(vBottom));

    return body;
  }

  Newton.Lattice = Lattice;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
