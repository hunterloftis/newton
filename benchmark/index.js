var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var particlesBench = require('./particles.js');

suite.add('1000 particles (this will give maximum ops/sec with 60 fps)', { defer: true, fn: function(d) { particlesBench(1000, d); } } )
suite.add('10000 particles', { defer: true, fn: function(d) { particlesBench(10000, d); } } )
suite.add('20000 particles', { defer: true, fn: function(d) { particlesBench(20000, d); } } )
suite.add('50000 particles', { defer: true, fn: function(d) { particlesBench(50000, d); } } )
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
})
.run({async: true});
