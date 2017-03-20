import del from 'del';
import fs from 'fs';
import os from 'os';
import path from 'path';
import tempfile from 'tempfile';
import test from 'ava';

import {hugo} from './_init';

const testData = {
    foo: 'bar'
};

/**
 * Clean-up
 * @async
 */
async function cleanUp() {
    return del([
        path.resolve(path.join(os.tmpdir(), 'my.work.flow')),
        process.env.alfred_workflow_cache
    ], {
        force: true
    });
}

/**
 * Set-up
 */
test.beforeEach(async t => {
    const h = hugo();

    h.options({
        checkUpdates: false
    });

    t.context.hugo = h;

    return cleanUp();
});

/**
 * Check tmp cache directory
 */
test.serial('tmp cache dir', t => {
    const h = t.context.hugo;

    t.plan(2);

    // Set options
    h.options({
        useTmpCache: true
    });

    // Check cache path
    t.is(path.resolve(path.join(os.tmpdir(), 'my.work.flow')), h.workflowMeta.cache);

    console.log(path.resolve(path.join(os.tmpdir(), 'my.work.flow')));

    // Set and get cache data
    h.cache.set('test', testData);
    t.deepEqual(h.cache.get('test'), testData);
});

/**
 * Check standard cache directory
 */
test.serial('standard cache dir', t => {
    const h = t.context.hugo;

    t.plan(2);

    // Set options
    h.options({
        useTmpCache: false
    });

    // Check cache path
    t.is(process.env.alfred_workflow_cache, h.workflowMeta.cache);

    // Set and get cache data
    h.cache.set('test', testData);
    t.deepEqual(h.cache.get('test'), testData);
});

/**
 * Check cache instance is reinitialized on cache dir change
 */
test.serial('changing cache dir', t => {
    const h = t.context.hugo;

    t.plan(3);

    // Set options
    h.options({
        useTmpCache: false
    });

    // Check cache path
    t.is(process.env.alfred_workflow_cache, h.workflowMeta.cache);

    // Set cache data
    h.cache.set('test', testData);

    // Change cache option
    h.options({
        useTmpCache: true
    });

    // Check cache again
    t.is(path.resolve(path.join(os.tmpdir(), 'my.work.flow')), h.workflowMeta.cache);
    t.false(h.cache.has('test'));
});

/**
 * Process file and store results in file cache
 */
test.serial('process file and cache it', t => {
    const h = t.context.hugo;
    const tmpFile = tempfile();

    t.plan(6);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = h.cacheFile(tmpFile, 'foo');

    // Listen to changed event to process data
    cachedFile.on('changed', (cache, file, hash) => {
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
    const tmpFile = tempfile();

    t.plan(3);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = h.cacheFile(tmpFile, 'foo');

    // Listen to changed event to process data
    cachedFile.once('changed', cache => {
        t.is(cache.constructor.name, 'FileCacheStore');
        cache.store(testData);
    });

    // Fetch data (uncached)
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, testData);

    // Listen to changed event (which should not be emitted now)
    cachedFile.once('changed', () => {
        t.fail('Data has not been cached.');
    });

    // Fetch data again
    data = cachedFile.get();

    // Verify data
    t.deepEqual(data, testData);
});

/**
 * Tear-down
 */
test.afterEach.always(async () => {
    return cleanUp();
});
