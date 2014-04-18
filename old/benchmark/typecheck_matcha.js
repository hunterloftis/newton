suite('TypeCheck', function() {

  set('iterations', 10000000);

  function Obj() {}
  Obj.prototype.type = 'foo';

  function Bar() {}

  bench('check property', function() {
    var obj = new Obj();

    if(obj.type === 'foo');
    if(obj.type === 'bar');
  });

  bench('check type', function() {
    var obj = new Obj();

    if(obj instanceof Obj);
    if(obj instanceof Bar);
  });

});