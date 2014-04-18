;(function(Newton) {

  'use strict'

  function Box(x, y, size) {
    var body = Newton.Body();

    var ul = body.Particle(x - size, y - size);
    var ur = body.Particle(x + size, y - size);
    var ll = body.Particle(x - size, y + size);
    var lr = body.Particle(x + size, y + size);

    body.DistanceConstraint(ul, ur);
    body.DistanceConstraint(lr, ll);

    body.DistanceConstraint(ur, lr);
    body.DistanceConstraint(ll, ul);

    body.DistanceConstraint(ul, lr);
    body.DistanceConstraint(ur, ll);

    body.Volume([ul, ur, lr, ll]);

    return body;
  }

  Newton.Box = Box;

})(typeof exports === 'undefined'? this['Newton']=this['Newton'] || {} : exports);
