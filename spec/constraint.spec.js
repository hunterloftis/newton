var assert = require('chai').assert;
var Constraint = require('../lib/constraint');

describe('Constraint', function() {

  describe('.setPriority()', function() {

    function Foo() {}
    function Bar() { Constraint.call(this); }
    Bar.prototype = Object.create(Constraint.prototype);

    it('should set Infinity with no matches', function() {
      var c = Constraint();
      c.setPriority([ Foo, Bar ]);
      assert.equal(c.priority, Infinity);
    });

    it('should set zero as the first match', function() {
      var c = Constraint();
      c.setPriority([ Constraint, Foo, Bar ]);
      assert.equal(c.priority, 0);
    });

    it('should set 2 as the third match', function() {
      var c = Constraint();
      c.setPriority([ Foo, Bar, Constraint ]);
      assert.equal(c.priority, 2);
    });
  });

  describe('id', function() {

    it('should increase', function() {
      var a = Constraint();
      var b = Constraint();

      assert.ok(a.id < b.id);
    });

  });

});
