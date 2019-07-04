'use strict';

const Node = require('./node');
const _ = require('lodash');
const {inspect} = require('util');
const data = require('../tanzania.villages.json');

const operations = {
  $or: (node, arr) =>
    arr.some(data => data === node.data),

  $and: (node, obj) =>
    _.isEqual(node.data, obj),

  $not: (node, obj) =>
    !_.isEqual(node.data, obj)
};

function NaryTree(title, orderedLabels, root=null) {
  this.title = title;
  this.root = root;
  this.orderedLabels = orderedLabels;

  this.buildNodes = function(dataSet, matcher) {
    if (this.root == null) {
      this.root = new Node({type: 'root', label: 'country'}, this.title);
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
      
        const currNode = new Node({ type: 'node', label: this.orderedLabels[i] }, data[this.orderedLabels[i]]);
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

NaryTree.prototype.query = function(qargs, callback) {

  const isFunction = typeof qargs.value === 'object'
    && Object.getOwnPropertyNames(qargs.value)
             .every(param => operations[param] != null);
  const uops = isFunction
    ? Object.getOwnPropertyNames(qargs.value)
    : [];
  const nodes = this.root.findAllMatches((node) => {

    let isSuccess = true;
    if (qargs.label !== node.metadata.label) {
      return !isSuccess;
    }

    if (!isFunction) {
      return qargs.value === node.data;
    }

    for (const uop of uops) {

      if (!qargs.value[uop]) {
         continue;
      }

      isSuccess = isSuccess && operations[uop].apply(null, [node, qargs.value[uop]])
      if (!isSuccess) {
        break;
      }
    }

    return isSuccess;
  });

  callback.apply(null, [null, nodes || []])
};

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

NaryTree.prototype.harvestData = function(level, node=null) {
  // Get tree component at the that level
  const _getData = (node, l, res) => {
    if (!node) return null;
    if (l === 1) {
      res.push(node.data);
      return;
    }
    node.children.forEach(child => _getData(child, l - 1, res));
  };
  const res = [];
  _getData(node || this.root, level, res);
  return res;
};

NaryTree.fromDataSet = function(title, dataSet, order, matcher) {
  const instance =  new NaryTree(title, order);
  instance.buildNodes(dataSet, matcher);
  return instance;
};

const tree = NaryTree.fromDataSet(
  'Tanzania Republic Of',
  data.slice(0, 2000),
  ['region', 'district', 'ward', 'village'],
  (data) => (node) => {
      return node.data === data;
  }
);

tree.query({
  label: 'region',
  value: { $or: ['Arusha Region', 'Dodoma Region']}
}, (err, data) => {
  if (err) {
    console.error(inspect(err, false, null, true));
    return;
  }
  console.log(JSON.stringify(data, null, 2));
});

// console.log(`Depth = ${tree.depth()}`);

// console.log(JSON.stringify(tree));

// console.log(JSON.stringify(tree.harvestData(2)));
