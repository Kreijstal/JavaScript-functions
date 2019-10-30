//Helper functions
//Tree Implimentation from https://gist.github.com/RainbowDangerDash/e006151f60003487e208
function Tree(data) {
  this.data = data;
  this.children = [];
  this.parent = null;
  this.length = 0;
  this.level=0//useful for debugging how deep a node is
}
Tree.fromJSON = function(jsonTree) {
  var tree = JSON.parse(jsonTree),
    finalTree = tree.map(function(a) { return new Tree(a.data) });
  tree.forEach(function(a, i) { a.children.forEach(function(b) { finalTree[i].addChild(finalTree[b]) }) });
  return finalTree[0];
}
Tree.prototype.addChild = function(t) {
  if (!(t instanceof this.constructor)) { t = new Tree(t) }
  t.parent = this;
  this.length = this.children.push(t);
  t.level=this.level+1
  return t;
}
Tree.prototype.removeChild = function(i) {
  var c = this.children.splice(i, 1)[0];
  this.length = this.children.length;
  c && (c.parent = null);
  return c;
}
Tree.prototype.splice=function(start,end){
    var c = this.children.splice(start,end);
  this.length = this.children.length;
  return c;
}
Tree.prototype.detachFromParent = function() {
  var parent = this.parent;
  if (parent) {
    parent.removeChild(parent.children.indexOf(this));
  }
  return parent;
}
Tree.prototype.popChild = function() {
  var c = this.children.pop();
  c.detachFromParent && c.detachFromParent();
  return c;
}
Tree.prototype.previousSibling=function(){
  return this.parent&&this.parent.children[this.parent.children.indexOf(this)-1]
}
//Walk the tree
Tree.prototype.forEach = function(f, r, t, i) {
  //r is how deep you want to go, 0 for unlimited.
  //t is the level of the children you want, 0 for unlimited,
  //if you for example only want the children and beyond, but not the value itself, then t would be 1,
  //if you want the grandchildren and beyond but not the children, t would be 2
  //go back i number of steps to see if there are parents
  for (var ii = i, node = this; ii && node.parent && (t > 0 && r > 0); ii--) {
    node = node.parent;
    if (node == this) { //if parent node is equal to this node, then skip
      return this
    }
  }
  i = i | 0;
  r = r | 0;
  t = t | 0;
  if (t-- <= 0) {
    f(this, i);
  }
  if (--r) {
    this.children.forEach(function(a) { a.forEach(f, r, t, i + 1) });
  }
  return this;
}
Tree.prototype.forEachChild = function(f) {
  return this.forEach(f, 2, 1, 0);
};
(function() {
  var _find = function(f) {
    var c = this.children;
    if (!c) { return false }
    for (var d, i = 0, l = c.length; i < l; i++) {
      if (d = f.call(arguments[1], c[i], c)) {
        return d;
      }
    };
  }
  Tree.prototype._find = _find;
  Tree.prototype.find = function(f, r, t) {
    r = r | 0;
    t = t | 0
    return ((t-- <= 0) ? (f(this) && this) : false) || ((--r) ? this._find(function(a) { return a.find(f, r, t) }) : false);
  }
})();
Tree.prototype.findIndex = function(f) {
  return this.children.findIndex(f);
}
Tree.prototype.getChild = function(i) {
  return this.children[i];
}
Tree.prototype.getFirstChild = function() {
  return this.children[0];
}
Tree.prototype.getLastChild = function() {
  return this.children[this.children.length - 1];
}
Tree.prototype.toJSON = function() {
  var child = [];
  this.forEach(function(a) { child.push(a) });
  return JSON.stringify(child.map(function(a) {
    return {
      data: a.data,
      children: a.children.map(function(b) { return child.indexOf(b) })
    }
  }))
}

module.exports = Tree;
