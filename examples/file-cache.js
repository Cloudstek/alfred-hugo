'use strict';

/**
 * Process a file and cache results
 * This example shows how to use the cacheFile method to process a file once and cache the results until the file has
 * changed again.
 */

const Hugo = require('../');
const path = require('path');
const process = require('process');

// Number of milliseconds per nanosecond
const MS_PER_NS = 1e-6;

/**
 * PHP-like rounding with precision
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 * @param {number} number
 * @param {number} precision
 * @return {number}
 */
function round (number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};

/**
 * My fancy processing function that takes longer than I'd like to complete
 * @param {string} file Input file
 * @return {Object}
 */
function processComments(file) {
    let data = JSON.parse(file);

    return data.map(x => ({
        title: x.name,
        subtitle: x.email,
        arg: x.id,
        valid: true
    }));
}

// Get cached file instance
let file = Hugo.cacheFile(path.join(__dirname, 'comments.json'), 'comments');

// Subscribe to change event
file.on('change', function (cache, file) {
    let result = processComments(file);

    cache.store(result);
});

// == Benchmark ==

const benchRuns = 200;

console.log('Processing comments took:');

// Measture time (uncached)
let uncachedMeasurements = [];
let avgUncached = 0;

for (let i = 0; i < benchRuns; i++) {
    let now = process.hrtime();
    file.get();
    uncachedMeasurements[uncachedMeasurements.length] = process.hrtime(now);
    file.clearCacheSync();
}

for (let i = 0; i < uncachedMeasurements.length; i++) {
    avgUncached = round((uncachedMeasurements[i][0] * 1000) + (uncachedMeasurements[i][1] * MS_PER_NS), 3);
}

console.log(`uncached (${uncachedMeasurements.length}x avg): ${avgUncached}ms`);

// Measture time again (cached)
let cachedMeasurements = [];
let avgCached = 0;

for (let i = 0; i < benchRuns; i++) {
    let now = process.hrtime();
    file.get();
    cachedMeasurements[cachedMeasurements.length] = process.hrtime(now);
}

for (let i = 0; i < cachedMeasurements.length; i++) {
    avgCached = round((cachedMeasurements[i][0] * 1000) + (cachedMeasurements[i][1] * MS_PER_NS), 3);
}

console.log(`cached (${cachedMeasurements.length}x avg): ${avgCached}ms`);

file.clearCacheSync();
