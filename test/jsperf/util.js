function time(label, fn) {
  var start = Date.now();
  fn();
  console.log(label + ':', Date.now() - start);
};

module.exports = {
  time: time
};
