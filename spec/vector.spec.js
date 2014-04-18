var assert = require('chai').assert;
var Vector = require('../lib/vector.js');

describe('Vector', function() {

  describe('constructor', function() {

    it('should force instantiation', function() {
      var v = Vector();
      assert.instanceOf(v, Vector);
    });

    it('should assume 0, 0 as defaults', function() {
      var v = Vector();
      assert.equal(v.x, 0);
      assert.equal(v.y, 0);
    });

    it('should accept a coord', function() {
      var v = Vector(1, 2);
      assert.equal(v.x, 1);
      assert.equal(v.y, 2);
    });
  });

  describe('pooling', function() {

    it('should be able to acquire and release', function() {
      assert.equal(Vector.pool(), 0);
      var v = Vector.claim();
      assert.instanceOf(v, Vector);
      assert.equal(Vector.pool(), 0);
      v.free();
      assert.equal(Vector.pool(), 1);
    });

    it('should provide different vectors', function() {
      var v1 = Vector.claim();
      var v2 = Vector.claim();
      assert.notEqual(v1, v2);
      v1.free();
      v2.free();
    });

    it('should reuse objects', function() {
      var v1 = Vector.claim();
      v1.free();
      var v2 = Vector.claim();
      assert.strictEqual(v1, v2);
      v2.free();
    });

    it('should automatically expand when pool is empty', function() {
      Vector.pool(1);
      var v1 = Vector.claim();
      var v2 = Vector.claim();
      assert.instanceOf(v1, Vector);
      assert.instanceOf(v2, Vector);
      v1.free();
      v2.free();
    });

    it('should claim and copy with pool()', function() {
      Vector.pool(0);
      assert.equal(Vector.pool(), 0, 'pool should start empty');
      var v1 = Vector(3, 4);
      var v2 = v1.pool();
      assert.notEqual(v1, v2, 'pool() instance should be separate');
      assert.equal(v2.x, v1.x, 'pool()d values should be copied');
      assert.equal(Vector.pool(), 0, 'pool should be empty');
      v2.free();
      assert.equal(Vector.pool(), 1, 'free() should add one to pool');
    });

  });

/*
  describe('scratch', function() {

    it('should be a single instance', function() {
      assert.instanceOf(Vector.scratch, Vector);
    });
  });
*/

  describe('clone()', function() {
    var v1 = Vector(2, 3);
    var v2 = v1.clone();

    it('should return a Vector', function() {
      assert.instanceOf(v2, Vector);
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
    var v1 = Vector(3, 4);
    var v2 = Vector().copy(v1);

    it('should return a Vector', function() {
      assert.instanceOf(v2, Vector);
    });

    it('should copy the coordinates', function() {
      assert.equal(v1.x, v2.x);
      assert.equal(v1.y, v2.y);
    });

    it('should not share an object reference', function() {
      assert.notEqual(v1, v2);
    });
  });

  describe('equals()', function() {

    before(function() {
      this.a = Vector(1, 2);
      this.b = Vector(1, 3);
      this.c = Vector(4, 2);
      this.d = Vector(1, 2);
    });

    it('should fail with different y values', function() {
      assert.ok(!this.a.equals(this.b));
    });

    it('should fail with different x values', function() {
      assert.ok(!this.a.equals(this.c));
    });

    it('should succeed with matching x and y', function() {
      assert.ok(this.a.equals(this.d));
    });
  });

  describe('zero()', function() {

    it('should zero out a vector', function() {
      var v = Vector().zero();
      assert.equal(v.x, 0);
      assert.equal(v.y, 0);
    });
  });

/*
  describe('set()', function() {

    it('should set x and y', function() {
      var v = Vector().set(1, 2);
      assert.equal(v.x, 1);
      assert.equal(v.y, 2);
    });
  });
*/

  describe('add()', function() {
    var v = Vector(1, 2);
    var v1 = v.add(Vector(3, 4));

    it('should add components', function() {
      assert.equal(v1.x, 4);
      assert.equal(v1.y, 6);
    });

    it('should add in-place', function() {
      assert.equal(v1, v);
    });
  });

/*
  describe('addXY()', function() {
    var v = Vector(1, 2);
    var v1 = v.addXY(3, 4);

    it('should add components', function() {
      assert.equal(v1.x, 4);
      assert.equal(v1.y, 6);
    });

    it('should add in-place', function() {
      assert.equal(v1, v);
    });
  });
*/

  describe('sub()', function() {
    var v = Vector(1, 2);
    var v1 = v.sub(Vector(3, 4));

    it('should subtract components', function() {
      assert.equal(v1.x, -2);
      assert.equal(v1.y, -2);
    });

    it('should subtract in-place', function() {
      assert.equal(v1, v);
    });

    it('should be able to subtract zero', function() {
      var pivot = Vector(5, -5);
      var v = Vector(0, 0).sub(pivot);
      assert.equal(v.x, -5);
      assert.equal(v.y, 5);
    });
  });

/*

  describe('subXY()', function() {
    var v = Vector(1, 2);
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

  describe('merge()', function() {
    var pos3 = Vector(3, 3);
    var neg3 = Vector(-3, -3);
    var mixed3 = Vector(3, -3);

    it('should accept only larger positive values', function() {
      var v1 = Vector(1, 5).merge(pos3);
      var v2 = Vector(-1, 5).merge(mixed3);
      assert.equal(v1.x, 3, 'v1.x');
      assert.equal(v1.y, 5, 'v1.y');
      assert.equal(v2.x, -1, 'v2.x');
      assert.equal(v2.y, 5, 'v2.y');
    });

    it('should accept only smaller negative values', function() {
      var v1 = Vector(-1, -5).merge(neg3);
      var v2 = Vector(1, -5).merge(mixed3)
      assert.equal(v1.x, -3);
      assert.equal(v1.y, -5);
      assert.equal(v2.x, 3);
      assert.equal(v2.y, -5);
    });

    it('should accept any values on zero', function() {
      var v1 = Vector(0, 0).merge(pos3);
      var v2 = Vector(0, 0).merge(neg3);
      assert.equal(v1.x, 3, 'v1.x');
      assert.equal(v1.y, 3, 'v1.y');
      assert.equal(v2.x, -3, 'v2.x');
      assert.equal(v2.y, -3, 'v2.y');
    });
  });

  describe('mult()', function() {
    var v = Vector(1, 2);
    var v1 = v.mult(Vector(2, 3));

    it('should multiply components', function() {
      assert.equal(v1.x, 2);
      assert.equal(v1.y, 6);
    });

    it('should multiply in-place', function() {
      assert.equal(v1, v);
    });
  });

*/

  describe('scale()', function() {
    var v = Vector(1, 2);
    var v1 = v.scale(3);

    it('should scale components', function() {
      assert.equal(v1.x, 3);
      assert.equal(v1.y, 6);
    });

    it('should scale in-place', function() {
      assert.equal(v1, v);
    });
  });

/*
  describe('div()', function() {
    var v = Vector(1, 2);
    var v1 = v.div(Vector(2, 8));

    it('should divide components', function() {
      assert.equal(v1.x, 0.5);
      assert.equal(v1.y, 0.25);
    });

    it('should divide in-place', function() {
      assert.equal(v1, v);
    });
  });

  describe('reverse()', function() {
    var v = Vector(1, 2);
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
    var v = Vector(3, 4);
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
    var v = Vector(1, 2);
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
    var v = Vector(1, 2);
    var v1 = v.turnLeft();

    it('should turn left', function() {
      assert.equal(v1.x, 2);
      assert.equal(v1.y, -1);
    });

    it('should modify in-place', function() {
      assert.equal(v1, v);
    });
  });

*/

  describe('rotate()', function() {

    it('should return the same values with a zero rotation', function() {
      var v = Vector(1, 2).rotate(0);
      assert.equal(v.x, 1);
      assert.equal(v.y, 2);
    });

    it('should be able to rotate counter-clockwise', function() {
      var v = Vector(0, 10).rotate(Math.PI * 0.25);
      assert.closeTo(v.x, 7.071067811865475, 0.0001, 'x');
      assert.closeTo(v.y, 7.071067811865475, 0.0001, 'y');
    });

    it('should be able to rotate across the 0-boundary', function() {
      var v = Vector(10, -1).rotate(-Math.PI * 0.25);
      assert.closeTo(v.x, 7.778174593052023, 0.0001);
      assert.closeTo(v.y, 6.363961030678927, 0.0001);
    });

    it('should modify in-place', function() {
      var v1 = Vector(1, 2);
      var v2 = v1.rotate(Math.PI);
      assert.equal(v1, v2);
    });

    it('should go from -5,5 to 5,5 with a positive rotation', function() {
      var v = Vector(-5, 5).rotate(Math.PI * 0.5);
      assert.equal(v.x, 5, 'x should equal 5');
      assert.equal(v.y, 5, 'y should equal 5');
    });
  });

/*
  describe('rotateAbout()', function() {

    it('should be able to rotate about the origin', function() {
      var pivot = Vector(0, 0);
      var v = Vector(10, 7).rotateAbout(pivot, Math.PI);
      assert.closeTo(v.x, -10, 0.0001);
      assert.closeTo(v.y, -7, 0.0001);
    });

    it('should be able to rotate about an offset pivot', function() {
      var pivot = Vector(5, -5);
      var v = Vector(0, 0).rotateAbout(pivot, Math.PI * 0.5);
      assert.closeTo(v.x, 10, 0.0001);
      assert.closeTo(v.y, 0, 0.0001);
    });

  });

  describe('getDot()', function() {

    it('should return the dot product', function() {
      var v1 = Vector(-6, 8);
      var v2 = Vector(5, 12);
      assert.equal(v1.getDot(v2), 66);
    });
  });

  describe('getCross()', function() {

    it('should return the cross product', function() {
      var v1 = Vector(1, 2);
      var v2 = Vector(3, 4);
      assert.equal(v1.getCross(v2), 10);
    });
  });

*/

  describe('getLength()', function() {

    it('should give total length', function() {
      var len = Vector(3, 4).getLength();
      assert.equal(len, 5);
    });
  });

/*
  describe('getLength2()', function() {

    it('should give squared length', function() {
      var len = Vector(3, 4).getLength2();
      assert.equal(len, 25);
    });
  });

  describe('getAngle()', function() {

    it('should be zero for 10, 0', function() {
      assert.equal(Vector(10, 0).getAngle(), 0);
    });

    it ('should be 45 degrees for 10, -10', function() {
      assert.equal(Vector(10, -10).getAngle(), Math.PI * 0.25);
    });

    it('should be 90 degrees for 0, -10', function() {
      assert.equal(Vector(0, -10).getAngle(), Math.PI * 0.5);
    });

    it('should be 135 degrees for -10, -10', function() {
      assert.equal(Vector(-10, -10).getAngle(), Math.PI * 0.75);
    });

    it('should be 180 degrees for -10, 0', function() {
      // Weird
      assert.equal(Vector(-10, 0).getAngle(), -Math.PI);
      assert.equal(Vector(-10, -0).getAngle(), Math.PI);
    });

    it('should be -45 degrees for 10, 10', function() {
      assert.equal(Vector(10, 10).getAngle(), Math.PI * -0.25);
    });

    it('should be -90 degrees for 0, 10', function() {
      assert.equal(Vector(0, 10).getAngle(), Math.PI * -0.5);
    });

    it('should be -135 degrees for -10, 10', function() {
      assert.equal(Vector(-10, 10).getAngle(), Math.PI * -0.75);
    });
  });

  describe('getAngleTo()', function() {

    it('should compute angles between two vectors (0,0 = axis)', function() {
      var v1 = Vector(10, 0);
      var v2 = Vector(10, -10);

      assert.equal(v1.getAngleTo(Vector(10, -10)), Math.PI * 0.25,
        '10, 0 should be 45 degrees to 10, -10');

      assert.equal(v1.getAngleTo(Vector(0, -10)), Math.PI * 0.5,
        '10, 0 should be 90 degrees to 0, -10');

      assert.equal(v1.getAngleTo(Vector(10, 10)), Math.PI * -0.25,
        '10, 0 should be -45 degrees to 10, 10');

      // Weird that it has to be negative
      assert.equal(v1.getAngleTo(Vector(-10, 0)), -Math.PI,
        '10, 0 should be 180 degrees to -10, 0');

      assert.equal(v2.getAngleTo(Vector(0, 10)), -Math.PI * 0.75,
        '10, -10 should be -135 degrees to 0, 10');
    });
  });

*/

});

