var assert = require('chai').assert;

var Newton = require('../../newton.js');

describe('Vector', function() {

  describe('constructor', function() {
    it('should not assume a default coord', function() {
      var v = Newton.Vector();
      assert.isUndefined(v.x);
      assert.isUndefined(v.y);
    });
    it('should accept a coord', function() {
      var v = Newton.Vector(0, 1);
      assert.equal(v.x, 0);
      assert.equal(v.y, 1);
    });
  });

})