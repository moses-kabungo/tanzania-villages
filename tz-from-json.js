'use strict';

const fs = require('fs');

const util = require('util');
const list = require('./tanzania.villages.json');

function node(name, children = new Set()) {
  this.name = name;
  this.children = children;
}

node.prototype.empty = function() {
  return this.children.length === 0;
};

function find(root, name) {
  if (root.name === name) return root;
  if (!root.children || root.empty()) return null;

  for (const child of root.children) {
    const grandParent = find(child, name);
    if (grandParent != null) return grandParent;
  }

  return null;
}


function insert_node(root, data) {
   // find region
   const region = find(root, data.region);
  
   if (region != null) {
    // find district
    const district = find(region, data.district);
    if (district != null) {
      const ward = find(district, data.ward);
      if (ward != null) {
        ward.children.add(
	  new node(data.village));
      } else {
        // add ward
	district.children.add(
	  new node(data.ward,
	    new Set([new node(data.village)])
	  ));
      }
    } else {
       // add new district
       region.children
	.add(
	   new node(data.district, new Set([
	     new node(data.ward, new Set([
	       new node(data.village)
	     ])
	    )]
       )));
    }
  } else {
     // add new region
     root.children
     .add(
      new node(data.region, new Set([
        new node(data.district, new Set([
	  new node(data.ward, new Set([
	    new node(data.village)
	  ]))
	]))
     ])));
  }
}

function build_tree(title, list) {
  let root = null;
  for (let i = 0; i < list.length; i++) {
    if (root == null) {
      root = new node(title, new Set([new node(list[i].region, new Set([
        new node(list[i].district, new Set([
	  new node(list[i].ward, new Set([
	    new node(list[i].village)
	  ]))
	]))
      ]))]));
	continue;
    }
    insert_node(root, list[i]);
  }
  return root;
}

const tree = new build_tree('Tanzania Republic of', list.slice(0, 10));
// console.log(util.inspect(tree, false, null, true));
for (let i = 0; i <= 2; i++) {
  console.log(util.inspect(tree.children[i], false, null, true));
}

const file = fs.createWriteStream('./organized.json', 'utf8');
file.write(JSON.stringify(tree));
file.end();
