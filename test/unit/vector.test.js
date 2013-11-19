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

    it('should be able to acquire and release', function() {
      assert.equal(Newton.Vector.pool(), 0);
      var v = Newton.Vector.claim();
      assert.instanceOf(v, Newton.Vector);
      assert.equal(Newton.Vector.pool(), 0);
      v.free();
      assert.equal(Newton.Vector.pool(), 1);
    });

    it('should provide different vectors', function() {
      var v1 = Newton.Vector.claim();
      var v2 = Newton.Vector.claim();
      assert.notEqual(v1, v2);
      v1.free();
      v2.free();
    });

    it('should reuse objects', function() {
      var v1 = Newton.Vector.claim();
      v1.free();
      var v2 = Newton.Vector.claim();
      assert.strictEqual(v1, v2);
      v2.free();
    });

    it('should automatically expand when pool is empty', function() {
      Newton.Vector.pool(1);
      var v1 = Newton.Vector.claim();
      var v2 = Newton.Vector.claim();
      assert.instanceOf(v1, Newton.Vector);
      assert.instanceOf(v2, Newton.Vector);
      v1.free();
      v2.free();
    });

    it('should claim and copy with pool()', function() {
      Newton.Vector.pool(0);
      assert.equal(Newton.Vector.pool(), 0, 'pool should start empty');
      var v1 = Newton.Vector(3, 4);
      var v2 = v1.pool();
      assert.notEqual(v1, v2, 'pool() instance should be separate');
      assert.equal(v2.x, v1.x, 'pool()d values should be copied');
      assert.equal(Newton.Vector.pool(), 0, 'pool should be empty');
      v2.free();
      assert.equal(Newton.Vector.pool(), 1, 'free() should add one to pool');
    });

  });

  describe('scratch', function() {

    it('should be a single instance', function() {
      assert.instanceOf(Newton.Vector.scratch, Newton.Vector);
    });
  });

  describe('clone()', function() {
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

  describe('copy()', function() {
    var v1 = Newton.Vector(3, 4);
    var v2 = Newton.Vector().copy(v1);

    it('should return a Vector', function() {
      assert.instanceOf(v2, Newton.Vector);
    });

    it('should copy the coordinates', function() {
      assert.equal(v1.x, v2.x);
      assert.equal(v1.y, v2.y);
    });

    it('should not share an object reference', function() {
      assert.notEqual(v1, v2);
    });
  });

  describe('zero()', function() {

    it('should zero out a vector', function() {
      var v = Newton.Vector().zero();
      assert.equal(v.x, 0);
      assert.equal(v.y, 0);
    });
  });

  describe('set()', function() {

    it('should set x and y', function() {
      var v = Newton.Vector().set(1, 2);
      assert.equal(v.x, 1);
      assert.equal(v.y, 2);
    });
  });

  describe('add()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.add(Newton.Vector(3, 4));

    it('should add components', function() {
      assert.equal(v1.x, 4);
      assert.equal(v1.y, 6);
    });

    it('should add in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('addXY()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.addXY(3, 4);

    it('should add components', function() {
      assert.equal(v1.x, 4);
      assert.equal(v1.y, 6);
    });

    it('should add in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('sub()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.sub(Newton.Vector(3, 4));

    it('should subtract components', function() {
      assert.equal(v1.x, -2);
      assert.equal(v1.y, -2);
    });

    it('should subtract in-place', function() {
      assert.equal(v1, v);
    });

    it('should be able to subtract zero', function() {
      var pivot = Newton.Vector(5, -5);
      var v = Newton.Vector(0, 0).sub(pivot);
      assert.equal(v.x, -5);
      assert.equal(v.y, 5);
    });
  });

  describe('subXY()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.subXY(3, 4);

    it('should subtract components in-place', function() {
      assert.equal(v1.x, -2);
      assert.equal(v1.y, -2);
      assert.equal(v1, v);
    });

    it('should subtract in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('mult()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.mult(Newton.Vector(2, 3));

    it('should multiply components', function() {
      assert.equal(v1.x, 2);
      assert.equal(v1.y, 6);
    });

    it('should multiply in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('scale()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.scale(3);

    it('should scale components', function() {
      assert.equal(v1.x, 3);
      assert.equal(v1.y, 6);
    });

    it('should scale in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('div()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.div(Newton.Vector(2, 8));

    it('should divide components', function() {
      assert.equal(v1.x, 0.5);
      assert.equal(v1.y, 0.25);
    });

    it('should divide in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('reverse()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.reverse();

    it('should reverse components', function() {
      assert.equal(v1.x, -1);
      assert.equal(v1.y, -2);
    });

    it('should reverse in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('unit()', function() {
    var v = Newton.Vector(3, 4);
    var v1 = v.unit();

    it('should convert to a unit vector', function() {
      assert.closeTo(v1.x, 0.6, 0.001);
      assert.closeTo(v1.y, 0.8, 0.001);
    });

    it('should modify in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('turnRight()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.turnRight();

    it('should turn right', function() {
      assert.equal(v1.x, -2);
      assert.equal(v1.y, 1);
    });

    it('should modify in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('turnLeft()', function() {
    var v = Newton.Vector(1, 2);
    var v1 = v.turnLeft();

    it('should turn left', function() {
      assert.equal(v1.x, 2);
      assert.equal(v1.y, -1);
    });

    it('should modify in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('rotateBy()', function() {

    it('should return the same values with a zero rotation', function() {
      var v = Newton.Vector(1, 2).rotateBy(0);
      assert.equal(v.x, 1);
      assert.equal(v.y, 2);
    });

    it('should be able to rotate counter-clockwise', function() {
      var v = Newton.Vector(0, 10).rotateBy(Math.PI * 0.25);
      assert.closeTo(v.x, 7.071067811865475, 0.0001, 'x');
      assert.closeTo(v.y, 7.071067811865475, 0.0001, 'y');
    });

    it('should be able to rotate across the 0-boundary', function() {
      var v = Newton.Vector(10, -1).rotateBy(-Math.PI * 0.25);
      assert.closeTo(v.x, 7.778174593052023, 0.0001);
      assert.closeTo(v.y, 6.363961030678927, 0.0001);
    });

    it('should modify in-place', function() {
      var v1 = Newton.Vector(1, 2);
      var v2 = v1.rotateBy(Math.PI);
      assert.equal(v1, v2);
    });

    it('should go from -5,5 to 5,5 with a positive rotation', function() {
      var v = Newton.Vector(-5, 5).rotateBy(Math.PI * 0.5);
      assert.equal(v.x, 5, 'x should equal 5');
      assert.equal(v.y, 5, 'y should equal 5');
    });
  });

  describe('rotateAbout()', function() {

    it('should be able to rotate about the origin', function() {
      var pivot = Newton.Vector(0, 0);
      var v = Newton.Vector(10, 7).rotateAbout(pivot, Math.PI);
      assert.closeTo(v.x, -10, 0.0001);
      assert.closeTo(v.y, -7, 0.0001);
    });

    it('should be able to rotate about an offset pivot', function() {
      var pivot = Newton.Vector(5, -5);
      var v = Newton.Vector(0, 0).rotateAbout(pivot, Math.PI * 0.5);
      assert.closeTo(v.x, 10, 0.0001);
      assert.closeTo(v.y, 0, 0.0001);
    });

  });

  describe('getDot()', function() {

    it('should return the dot product', function() {
      var v1 = Newton.Vector(-6, 8);
      var v2 = Newton.Vector(5, 12);
      assert.equal(v1.getDot(v2), 66);
    });
  });

  describe('getCross()', function() {

    it('should return the cross product', function() {
      var v1 = Newton.Vector(1, 2);
      var v2 = Newton.Vector(3, 4);
      assert.equal(v1.getCross(v2), 10);
    });
  });

  describe('getLength()', function() {

    it('should give total length', function() {
      var len = Newton.Vector(3, 4).getLength();
      assert.equal(len, 5);
    });
  });

  describe('getLength2()', function() {

    it('should give squared length', function() {
      var len = Newton.Vector(3, 4).getLength2();
      assert.equal(len, 25);
    });
  });

  describe('getAngle()', function() {

    it('should be zero for 10, 0', function() {
      assert.equal(Newton.Vector(10, 0).getAngle(), 0);
    });

    it ('should be 45 degrees for 10, -10', function() {
      assert.equal(Newton.Vector(10, -10).getAngle(), Math.PI * 0.25);
    });

    it('should be 90 degrees for 0, -10', function() {
      assert.equal(Newton.Vector(0, -10).getAngle(), Math.PI * 0.5);
    });

    it('should be 135 degrees for -10, -10', function() {
      assert.equal(Newton.Vector(-10, -10).getAngle(), Math.PI * 0.75);
    });

    it('should be 180 degrees for -10, 0', function() {
      // Weird
      assert.equal(Newton.Vector(-10, 0).getAngle(), -Math.PI);
      assert.equal(Newton.Vector(-10, -0).getAngle(), Math.PI);
    });

    it('should be -45 degrees for 10, 10', function() {
      assert.equal(Newton.Vector(10, 10).getAngle(), Math.PI * -0.25);
    });

    it('should be -90 degrees for 0, 10', function() {
      assert.equal(Newton.Vector(0, 10).getAngle(), Math.PI * -0.5);
    });

    it('should be -135 degrees for -10, 10', function() {
      assert.equal(Newton.Vector(-10, 10).getAngle(), Math.PI * -0.75);
    });
  });

  describe('getAngleTo()', function() {

    it('should compute angles between two vectors (0,0 = axis)', function() {
      var v1 = Newton.Vector(10, 0);
      var v2 = Newton.Vector(10, -10);

      assert.equal(v1.getAngleTo(Newton.Vector(10, -10)), Math.PI * 0.25,
        '10, 0 should be 45 degrees to 10, -10');

      assert.equal(v1.getAngleTo(Newton.Vector(0, -10)), Math.PI * 0.5,
        '10, 0 should be 90 degrees to 0, -10');

      assert.equal(v1.getAngleTo(Newton.Vector(10, 10)), Math.PI * -0.25,
        '10, 0 should be -45 degrees to 10, 10');

      // Weird that it has to be negative
      assert.equal(v1.getAngleTo(Newton.Vector(-10, 0)), -Math.PI,
        '10, 0 should be 180 degrees to -10, 0');

      assert.equal(v2.getAngleTo(Newton.Vector(0, 10)), -Math.PI * 0.75,
        '10, -10 should be -135 degrees to 0, 10');
    });
  });
});
