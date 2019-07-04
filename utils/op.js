'use strict';


/**
 *
 *  query ({ $and: { name: 'Ali', age: { $btn: [30, 60] } } });
 *
 */

const op = {
  $and: (node, data) => {

    const properties = Object.getOwnPropertyNames(data);
    const canCompare = properties.every(property => typeof property !== 'object');

    if (canCompare) {
      return _.isEqual(node, data);
    }

    // compare plain properties first
    let condition = false;
    for (const prop of Object.getOwnPropertyNames(data)) {

      if (typeof data[prop] === 'object') {
        condition = condition && eval([node[prop], data[prop]]);
      } else {
        condition = condition && _.isEqual(data[prop], node[prop]);
      }

      if (!condition) {
        return break;
      }
    }

    return condition;
  },

  $or: (node, data) => {
    
  }
  $gt:  (lhs, rhs) => _.gt(lhs, rhs),
  $lt:  (lhs, rhs) => _.lt(lhs, rhs),
  $gte: (lhs, rhs) => _.gte(lhs, rhs);
  $lte: (lhs, rhs) => _.lte(lhs, rhs);
  $eq:  (lhs, rhs) => _.eq(lhs, rhs),
  $ne:  (lhs, rhs) => _.isNotEqual(lhs, rhs),
};
