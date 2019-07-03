'use strict';

const {promisify} = require('util');
const {build_tree, find, get_nodes} = require('../utils/narytree');
const {getClient} = require('./connect');
const data = require('../tanzania.villages.json');

const tree = build_tree('Tanzania Republic Of', data);
const regions = get_nodes(tree, 0);

// For each region, insert villages
async function insert() {
  try {
    const query = promisify(getClient().query);
    await query('BEGIN');
    for (const region of regions) {
      // Insert each region into the database and return back id
      const {name, id} = await query('INSERT INTO tbl_countries(name) VALUES($1) RETURNING id, name', [regio.name]);
      // retrieve districts related to this node
      const districts = find(tree, name);
      // Insert districts
      for (const district of districts) {
        // Insert districts
      }
    }
    await query('COMMIT');
  } catch (e) {
    console.error(e);
    await query('ROLLBACK');
  }
}
