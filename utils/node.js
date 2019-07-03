'use strict';

const {inspect} = require('util');

function Node(data, ...children) {
  this.data = data;
  this.children = children;
}

Node.prototype.prependChild = function(node) {
  return this.children.unshift(node);
};

Node.prototype.appendChild = function(node) {
  this.children.push(node);
};

Node.prototype.findFirstMatch = function(predicate) {

  const isAMatch = predicate.apply(null, [this]);

  if (isAMatch) {
    return this;
  }

  for (const child of this.children) {
    const match = child.findFirstMatch(predicate);
    if (match != null) {
      return match;
    }
  }

  return null;
};

Node.prototype.findAllMatches = function(predicate) {
  function _collectMatches(node, res=[]) {
    const matched = predicate.apply(null, [node]);
    if (matched) {
      res.push(node);
    }

    for (const child of node.children) {
      _collectMatches(child, res);
    }
  };

  const res = [];
  _collectMatches(this, res);

  return res;
};

module.exports = Node;
