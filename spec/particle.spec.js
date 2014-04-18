var assert = require('chai').assert;
var Particle = require('../lib/particle');
var Vector = require('../lib/vector');

describe('Particle', function() {

  describe('constructor', function() {

    it('should force instantiation', function() {
      var p = Particle();
      assert.instanceOf(p, Particle);
    });

    it('should have a type of "Particle"', function() {
      var p = Particle();
      assert.equal(p.type, 'Particle');
    });

    it('should have reasonable defaults', function() {
      var p = Particle();
      assert.equal(p.position.x, 0);
      assert.equal(p.position.y, 0);
      assert.equal(p.size, 1);
      assert.equal(p.position.x, p.lastPosition.x);
      assert.equal(p.position.y, p.lastPosition.y);
      assert.equal(p.acceleration.x, 0);
      assert.equal(p.acceleration.y, 0);
    });

    it('should accept position', function() {
      var p = Particle(1, 2);
      assert.equal(p.position.x, 1);
      assert.equal(p.position.y, 2);
    });

    it('should accept size', function() {
      var p = Particle(1, 2, 3);
      assert.equal(p.size, 3);
    });
  });

  describe('#accelerate', function() {

    it('from (1, 2) by (3, 4) should yield (4, 6)', function() {
      var p = Particle();
      assert.equal(p.acceleration.x, 0);
      assert.equal(p.acceleration.y, 0);
      p.accelerate(Vector(1, 2));
      assert.equal(p.acceleration.x, 1);
      assert.equal(p.acceleration.y, 2);
      p.accelerate(Vector(3, 4));
      assert.equal(p.acceleration.x, 4);
      assert.equal(p.acceleration.y, 6);
    });

  });

});
