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

    describe('with defaults', function() {

      before(function() {
        this.p = Particle();
      });

      it('should have position 0, 0', function() {
        assert.equal(this.p.position.x, 0);
        assert.equal(this.p.position.y, 0);
      });

      it('should have size 1', function() {
        assert.equal(this.p.size, 1);
      });

      it('should have zero velocity', function() {
        assert.equal(this.p.position.x, this.p.lastPosition.x);
        assert.equal(this.p.position.y, this.p.lastPosition.y);
      });

      it('should have zero acceleration', function() {
        assert.equal(this.p.acceleration.x, 0);
        assert.equal(this.p.acceleration.y, 0);
      });

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

  describe('.accelerate()', function() {

    before(function() {
      this.p = Particle();
    });

    it('should yield (4, 6) from (1, 2) + (3, 4)', function() {
      this.p.accelerate(Vector(1, 2));
      assert.equal(this.p.acceleration.x, 1);
      assert.equal(this.p.acceleration.y, 2);
      this.p.accelerate(Vector(3, 4));
      assert.equal(this.p.acceleration.x, 4);
      assert.equal(this.p.acceleration.y, 6);
    });

  });

  describe('.bound()', function() {

    beforeEach(function() {
      this.p = Particle(40, 50);
    });

    it('should stay above min', function() {
      this.p.bound(Vector(75, 75), Vector(100, 100));
      assert.deepEqual(this.p.getPoint(), { x: 75, y: 75 });
    });

    it('should stay below max', function() {
      this.p.bound(Vector(0, 0), Vector(25, 25));
      assert.deepEqual(this.p.getPoint(), { x: 25, y: 25 });
    });

    it('should set x velocity to zero on correction', function() {
      this.p.setVelocity(Vector(5, 5));
      this.p.bound(Vector(0, 0), Vector(25, 100));
      var vel = this.p.getVelocity();
      assert.equal(vel.x, 0);
      assert.equal(vel.y, 5);
    });

    it('should set y velocity to zero on correction', function() {
      this.p.setVelocity(Vector(5, 5));
      this.p.bound(Vector(0, 0), Vector(100, 25));
      var vel = this.p.getVelocity();
      assert.equal(vel.x, 5);
      assert.equal(vel.y, 0);
    });

  });

  describe('getPoint()', function() {
    var p = Particle(3, 4);

    it('should return an object with x and y values', function() {
      assert.deepEqual(p.getPoint(), { x: 3, y: 4 });
    });
  });

  describe('getVelocity()', function() {

    it('should return the current velocity', function() {
      var p = Particle(2, 1);
      p.lastPosition.x = 0;
      p.lastPosition.y = 0;
      var vel = p.getVelocity();
      assert.equal(vel.x, 2);
      assert.equal(vel.y, 1);
    });

  });

  describe('.move()', function() {

    it('should yield (4, 6) from (1, 2) + (3, 4)', function() {
      var p = Particle(1, 2);
      p.move(Vector(3, 4));
      assert.equal(p.position.x, 4);
      assert.equal(p.position.y, 6);
    });

  });

  describe('.integrate()', function() {

    describe('a stationary particle', function() {

      describe('with zero acceleration', function() {

        var p = Particle();

        it('should stay in the same place', function() {
          p.integrate(20);
          assert.deepEqual({x: 0, y: 0}, p.getPoint());
        });

      });

      describe('with acceleration of (1, 2) units / sec / sec', function() {

        var p = Particle();
        p.accelerate(Vector(1, 2));

        it('should move to (0.4, 0.8) after 20ms', function() {
          p.integrate(20);
          assert.deepEqual({ x: 0.4, y: 0.8 }, p.getPoint());
        });

      });

    });

    describe('a moving particle', function() {

      describe('with zero acceleration', function() {
        var p = Particle();
        p.move(Vector(5, -10));
        p.integrate(20);

        it('should continue moving at the same rate', function() {
          assert.deepEqual({ x: 10, y: -20 }, p.getPoint());
        });
      });

      describe('with acceleration of (-2, 5) units / sec / sec', function() {
        var p = Particle();
        p.move(Vector(5, -10));
        p.accelerate(Vector(-2, 5));

        it('should move to (9.2, -18) after 20ms', function() {
          p.integrate(20);
          assert.deepEqual({ x: 9.2, y: -18 }, p.getPoint());
        });
      });

    });

  });

  describe('.place()', function() {

    before(function() {
      this.p = Particle(1, 2);
      this.p.place(Vector(-10, 20));
    });

    it('should position the particle at x, y', function() {
      assert.equal(this.p.position.x, -10);
      assert.equal(this.p.position.y, 20);
    });

    it('should reset velocity to zero', function() {
      var vel = this.p.getVelocity();
      assert.equal(vel.x, 0);
      assert.equal(vel.y, 0);
    });

  });

  describe('.setVelocity()', function() {

    var p = Particle();
    p.setVelocity(Vector(5, -11));

    it('should set the current velocity', function() {
      var vel = p.getVelocity();
      assert.equal(vel.x, 5);
      assert.equal(vel.y, -11);
    });

    it('should not change the current position', function() {
      assert.deepEqual(p.getPoint(), { x: 0, y: 0 });
    });

  });

});
