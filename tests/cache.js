import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import tempy from 'tempy';
import test from 'ava';

import {hugo} from './_init';

/**
 * Clean-up
 */
function cleanUp() {
    fs.emptyDirSync(path.resolve(path.join(os.tmpdir(), 'my.work.flow')));
    fs.emptyDirSync(process.env.alfred_workflow_cache);
}

/**
 * Set-up
 */
test.beforeEach('setup', t => {
    const h = hugo();

    const testData = {
        foo: 'bar'
    };

    h.options({
        checkUpdates: false,
        useTmpCache: false
    });

    t.context.hugo = h;
    t.context.testData = testData;

    cleanUp();
});

/**
 * Check tmp cache directory
 */
test.serial('tmp cache dir', t => {
    const h = t.context.hugo;

    // Set options
    h.options({
        useTmpCache: true
    });

    // Check cache path
    t.is(path.resolve(path.join(os.tmpdir(), 'my.work.flow')), h.workflowMeta.cache);

    // Set and get cache data
    h.cache.set('test', t.context.testData);
    t.deepEqual(h.cache.get('test'), t.context.testData);
});

/**
 * Check standard cache directory
 */
test.serial('standard cache dir', t => {
    const h = t.context.hugo;

    // Check cache path
    t.is(process.env.alfred_workflow_cache, h.workflowMeta.cache);

    // Set and get cache data
    h.cache.set('test', t.context.testData);
    t.deepEqual(h.cache.get('test'), t.context.testData);
});

/**
 * Check cache instance is reinitialized on cache dir change
 */
test.serial('changing cache dir', t => {
    const h = t.context.hugo;

    // Check cache path
    t.is(process.env.alfred_workflow_cache, h.workflowMeta.cache);

    // Set cache data
    h.cache.set('test', t.context.testData);

    // Change cache option
    h.options({
        useTmpCache: true
    });

    // Check cache again
    t.is(path.resolve(path.join(os.tmpdir(), 'my.work.flow')), h.workflowMeta.cache);
    t.false(h.cache.has('test'));
});

/**
 * Check cache is properly cleaned
 */
test.serial('cleaning cache dir', t => {
    const h = t.context.hugo;

    // Set cache data
    h.cache.set('test', t.context.testData);
    t.deepEqual(h.cache.get('test'), t.context.testData);

    // Clear cache
    h.clearCacheSync();

    // Check cache
    t.falsy(h.cache.get('test'));

    // Change cache option
    h.options({
        useTmpCache: false
    });

    // Set cache data
    h.cache.set('test', t.context.testData);
    t.deepEqual(h.cache.get('test'), t.context.testData);

    // Clear cache
    h.clearCacheSync();

    // Check cache
    t.falsy(h.cache.get('test'));
});

/**
 * Process file and store results in file cache
 */
test.serial('process file and cache it', t => {
    const h = t.context.hugo;
    const tmpFile = tempy.file();

    t.plan(6);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = h.cacheFile(tmpFile, 'foo');

    // Listen to change event to process data
    cachedFile.on('change', (cache, file, hash) => {
        t.is(cache.constructor.name, 'FileCacheStore');
        t.is(typeof file, 'string');
        t.true(file.length > 0);
        t.is(typeof hash, 'string');
        t.true(file.length > 0);

        cache.store({
            hello: 'world!'
        });
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, {
        hello: 'world!'
    });
});

/**
 * Process file and check if cached when requested the second time
 */
test.serial('process file and check if cached', t => {
    const h = t.context.hugo;
    const tmpFile = tempy.file();

    t.plan(3);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = h.cacheFile(tmpFile, 'foo');

    // Listen to change event to process data
    cachedFile.once('change', cache => {
        t.is(cache.constructor.name, 'FileCacheStore');
        cache.store(t.context.testData);
    });

    // Fetch data (uncached)
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, t.context.testData);

    // Listen to change event (which should not be emitted now)
    cachedFile.once('change', () => {
        t.fail('Data has not been cached.');
    });

    // Fetch data again
    data = cachedFile.get();

    // Verify data
    t.deepEqual(data, t.context.testData);
});

/**
 * Tear-down
 */
test.afterEach.always('cleanup', () => {
    cleanUp();
});
