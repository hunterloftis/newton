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

  describe('pooling', function() {
    Newton.Vector.pool(10);

    it('should be able to acquire and release', function() {
      assert.equal(Newton.Vector.pool(), 10);
      var v = Newton.Vector.acquire();
      assert.instanceOf(v, Newton.Vector);
      assert.equal(Newton.Vector.pool(), 9);
      v.release();
      assert.equal(Newton.Vector.pool(), 10);
    });

    it('should provide different vectors', function() {
      var v1 = Newton.Vector.acquire();
      var v2 = Newton.Vector.acquire();
      assert.notEqual(v1, v2);
      v1.release();
      v2.release();
    });

    it('should reuse objects', function() {
      var v1 = Newton.Vector.acquire();
      v1.release();
      var v2 = Newton.Vector.acquire();
      assert.strictEqual(v1, v2);
      v2.release();
    });

    it('should return undefined when pool is empty', function() {
      Newton.Vector.pool(1);
      var v1 = Newton.Vector.acquire();
      var v2 = Newton.Vector.acquire();
      assert.instanceOf(v1, Newton.Vector);
      assert.isUndefined(v2);
    });

  });

  describe('scratch', function() {

    it('should be a single instance', function() {
      assert.instanceOf(Newton.Vector.scratch, Newton.Vector);
    });
  });

  describe('clone', function() {
    var v1 = Newton.Vector(2, 3);
    var v2 = v1.clone();

    it('should return a Vector', function() {
      assert.instanceOf(v2, Newton.Vector);
    });

    it('should copy the data from the cloned Vector', function() {
      assert.equal(v1.x, v2.x);
      assert.equal(v1.y, v2.y);
    });

    it('should not share an object reference', function() {
      assert.notEqual(v1, v2);
    });
  });

});
