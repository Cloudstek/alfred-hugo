/* eslint-disable camelcase */
'use strict';
const path = require('path');
const tempy = require('tempy');

exports.hugo = () => {
    delete require.cache[path.resolve(__dirname, '../index.js')];

    process.env.alfred_workflow_version = '1.0.0';
    process.env.alfred_workflow_bundleid = 'my.work.flow';
    process.env.alfred_workflow_cache = tempy.directory();

    return require('../index');
};

exports.updater = () => {
    delete require.cache[path.resolve(__dirname, '../updater.js')];

    process.env.alfred_workflow_version = '1.0.0';
    process.env.alfred_workflow_bundleid = 'my.work.flow';
    process.env.alfred_workflow_cache = tempy.directory();

    return require('../updater');
};
