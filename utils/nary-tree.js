'use strict';

const Node = require('./node');
const _ = require('lodash');
const {inspect} = require('util');
const data = require('../tanzania.villages.json');

function NaryTree(title, orderedLabels, root=null) {
  this.title = title;
  this.root = root;
  this.orderedLabels = orderedLabels;

  this.buildNodes = function(dataSet, matcher) {
    if (this.root == null) {
      this.root = new Node(this.title);
    }

    for (const data of dataSet) {
      let index = 0, lastNode;
      for (let i = 0; i < this.orderedLabels.length - 1; i++) {
        const node = this.root.findFirstMatch(matcher.apply(null, [data[this.orderedLabels[i]]]));
        if (node != null) {
          lastNode = node;
          index = i + 1;
          continue;
        }

        break;
      }

      for (let i = index; i < this.orderedLabels.length; i++) {
      
        const currNode = new Node(data[this.orderedLabels[i]]);
        if (lastNode == null) {
          this.root.appendChild(currNode);
        } else {
          lastNode.appendChild(currNode);
        }
        lastNode = currNode;
      }
    }
  };
}

NaryTree.prototype.depth = function(node) {
  const _depth = (node) => {
    if (!node) {
      return 0;
    }
    const depths = node.children.map(node => this.depth(node));
    return depths.reduce((max, curr) => Math.max(max, curr), 0) + 1;
  }
  return _depth(node || this.root);
};

NaryTree.prototype.getData = function(level) {
  // Get tree component at the given level
  const _getData = (node, l, res) => {
    if (!node) return null;
    if (l === 1) {
      res.push(node.data);
      return;
    }
    node.children.forEach(child => _getData(child, l - 1, res));
  };
  const res = [];
  _getData(this.root, level, res);
  return res;
};

NaryTree.fromDataSet = function(title, dataSet, order, matcher) {
  const instance =  new NaryTree(title, order);
  instance.buildNodes(dataSet, matcher);
  return instance;
};

const tree = NaryTree.fromDataSet('Tanzania Republic Of',
  data, ['region', 'district', 'ward', 'village'],
  (data) => (node) => {
      return node.data === data;
  }
);

console.log(`Depth = ${tree.depth()}`);

// console.log(JSON.stringify(tree));

console.log(JSON.stringify(tree.getData(2)));
