'use strict';

const Node = require('./node');
const _ = require('lodash');
const {inspect} = require('util');

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

NaryTree.fromDataSet = function(title, dataSet, order, matcher) {
  const instance =  new NaryTree(title, order);
  instance.buildNodes(dataSet, order, matcher);
  return instance;
};

const tree = NaryTree.fromDataSet('Tanzania Republic Of',
  [{region: 'Dar-es-Salaam', district: 'Kinondoni', ward: 'Ubungo', village: 'Sinza A'},
   {region: 'Dar-es-Salaam', district: 'Kinondoni', ward: 'Ubungo', village: 'Sinza B'},
   {region: 'Dar-es-Salaam', district: 'Kinondoni', ward: 'Ubungo', village: 'Sinza C'},
   {region: 'Dodoma', district: 'Dodoma City Council', ward: 'Chamwino', village: 'Chamwindo Mwisho'}],
  (data) => (node) => {
      return node.data === data;
  }
);
console.log(JSON.stringify(tree));
