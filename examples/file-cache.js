'use strict';

/**
 * Process a file and cache results
 * This example shows how to use the cacheFile method to process a file once and cache the results until the file has
 * changed again.
 */

const Hugo = require('hugo');

/**
 * My fancy processing function that takes longer than I'd like to complete
 * @param {string} file Input file
 * @return {Object}
 */
function myProcessingFunction(file) {
    let data = JSON.parse(file);

    data.hello = 'world!';
    data.foo = 'bar';

    return data;
}

// Get cached file instance
let file = Hugo.cacheFile('path/to/my/file', 'myfile');

// Subscribe to change event
file.on('change', function (cache, file) {
    let result = myProcessingFunction(file);

    cache.store(result);
});

// Measure time to get first results (uncached)
console.time('uncached');

// Get processed file contents
console.log(file.get());

console.timeEnd('uncached');

// Measture time again (cached)
console.time('cached');

// Get processed file contents
console.log(file.get());

console.timeEnd('cached');
