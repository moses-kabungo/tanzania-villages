'use strict';

const fs = require('fs');

const util = require('util');

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

function compute_depth(root) {
  if (!root) {
    return 0;
  }
  const depths = [];
  for (const child of root.children) {
    depths.push(compute_depth(child));
  }
  
  // use height of the longest child
  const max_depth = depths.reduce((max, curr) => Math.max(max, curr), -1) + 1;
  return max_depth;
}

function get_nodes(root, level, res = []) {
  if (root == null || root.empty()) return null;
  if (level === 0) {
    // retrieve data for the nodes
    for (const child of root.children) {
      res.push({ name: child.name });
    }
    return res;
  }
  for (const child of root.children) {
    get_nodes(child, level - 1, res);
  }
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

function set2arr(key, value) {
  if (typeof value === 'object' && value instanceof Set) {
    return [...value];
  }
  return value;
}

module.export = {
  node,
  get_node,
  compute_depth,
  find,
  build_tree
};
