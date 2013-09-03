function Rectangle(left, top, right, bottom) {
  this.left = Math.min(left, right);
  this.top = Math.min(top, bottom);
  this.right = Math.max(right, left);
  this.bottom = Math.max(bottom, top);
};

Rectangle.prototype = {
  contains: function(x, y) {
    return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
  },
  overlaps: function(rect) {
    return !(rect.left > this.right || rect.right < this.left ||
        rect.top > this.bottom || rect.bottom < this.top);
  },
  expand: function(amount) {
    this.left -= amount;
    this.right += amount;
    this.top -= amount;
    this.bottom += amount;
    return this;
  }
}