/* eslint-disable camelcase */
'use strict';
const path = require('path');
const tempfile = require('tempfile');

exports.hugo = () => {
    delete require.cache[path.resolve(__dirname, '../index.js')];
    process.env.alfred_workflow_cache = tempfile();

    return require('..');
};
