var time = require('./util').time;

var ITERATIONS = 100000000;

function Obj() {}
Obj.prototype.type = 'foo';

function Bar() {}

time('check property', function() {
  var i = ITERATIONS;
  var obj = new Obj();
  while (i--) {
    if (obj.type === 'foo');
    if (obj.type === 'bar');
  }
});

time('check type', function() {
  var i = ITERATIONS;
  var obj = new Obj();
  while (i--) {
    if (obj instanceof Obj);
    if (obj instanceof Bar);
  }
});
