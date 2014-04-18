suite('Layer Speed', function () {
  set('iterations', 1000000);

  function Layer(id, num) {
    this.id = id;
    this.num = num;
  }

  Layer.prototype = {
    id: '',
    num: 0
  };

  bench('object comparison', function () {
    var layer = new Layer('abcdef', 123);
    var a = { layer : layer };
    var b = { layer : {} };

    if(a.layer === layer);
    if(b.layer === layer);
  });

  bench('id comparison', function () {
    var layer = new Layer('abcdef', 123);
    var a = { layer : layer.id };
    var b = { layer : 'efgh' };

    if(a.layer === layer.id);
    if(b.layer === layer.id);
  });

  bench('id comparison without prop lookups', function() {
    var layer = new Layer('abcdef', 123);
    var a = layer.id;
    var b = 'efgh';

    if(a === layer.id);
    if(b === layer.id);
  });

  bench('numeric id comparison', function() {
    var layer = new Layer('abcdef', 123);
    var a = { layer : layer.num };
    var b = { layer : 456 };

    if(a.layer === layer.num);
    if(b.layer === layer.num); 
  });

});