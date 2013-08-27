function Rectangle(left, top, right, bottom) {
  this.left = Math.min(left, right);
  this.top = Math.min(top, bottom);
  this.right = Math.max(right, left);
  this.bottom = Math.max(bottom, top);
};

