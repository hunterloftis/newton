var time = require('./util').time;

var ITERATIONS = 100000000;

function Layer(id, num) {
  this.id = id;
  this.num = num;
}

Layer.prototype = {
  id: '',
  num: 0
};

time('object comparison', function() {
  var layer = new Layer('abcdef', 123);
  var a = { layer: layer };
  var b = { layer: {} };

  for (var i = 0; i < ITERATIONS; i++) {
    if (a.layer === layer);
    if (b.layer === layer);
  }
});

time('id comparison', function() {
  var layer = new Layer('abcdef', 123);
  var a = { layer: layer.id };
  var b = { layer: 'efgh' };

  for (var i = 0; i < ITERATIONS; i++) {
    if (a.layer === layer.id);
    if (b.layer === layer.id);
  }
});

time('id comparison without prop lookups', function() {
  var layer = new Layer('abcdef', 123);
  var a = layer.id;
  var b = 'efgh';

  for (var i = 0; i < ITERATIONS; i++) {
    if (a === layer.id);
    if (b === layer.id);
  }
});

time('numeric id comparison', function() {
  var layer = new Layer('abcdef', 123);
  var a = { layer: layer.num };
  var b = { layer: 456 };

  for (var i = 0; i < ITERATIONS; i++) {
    if (a.layer === layer.num);
    if (b.layer === layer.num);
  }
});
