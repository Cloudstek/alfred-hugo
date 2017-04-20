import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import tempy from 'tempy';
import test from 'ava';

import {hugo} from './_init';
import FileCache from './../file-cache';

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
 * Process file and store results in file cache
 */
test.serial('process file and cache it', t => {
    const h = t.context.hugo;
    const tmpFile = tempy.file();

    t.plan(7);

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

        cache.store(t.context.testData);
        cache.set('hello', 'world!');
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, Object.assign({}, t.context.testData, {
        hello: 'world!'
    }));

    // Listen to change event (which should not be emitted now)
    cachedFile.once('change', () => {
        t.fail('Data has not been cached.');
    });

    // Fetch data again
    data = cachedFile.get();

    // Verify data
    t.deepEqual(data, Object.assign({}, t.context.testData, {
        hello: 'world!'
    }));
});

test.serial('process file with no cache dir set', t => {
    const tmpFile = tempy.file();

    t.plan(4);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = new FileCache(tmpFile, 'foo', null);

    // Listen to change event to process data
    cachedFile.once('change', cache => {
        t.is(cache.constructor.name, 'FileCacheStore');
        cache.store(t.context.testData);
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, t.context.testData);

    // Listen to change event again (cache should be empty)
    cachedFile.once('change', cache => {
        t.deepEqual(cache.contents, {});
    });

    // Fetch data again (should be empty as well as this time we didn't store anything after processing)
    data = cachedFile.get();

    // Verify data
    t.deepEqual(data, {});
});

test.serial('clear cache', async t => {
    const h = t.context.hugo;
    const tmpFile = tempy.file();

    t.plan(4);

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    let cachedFile = h.cacheFile(tmpFile, 'foo');

    // Listen to change event to process data
    cachedFile.once('change', cache => {
        t.is(cache.constructor.name, 'FileCacheStore');
        cache.store(t.context.testData);
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.deepEqual(data, t.context.testData);

    // Clear cache
    await cachedFile.clearCache();

    // Listen to change event again (cache should be empty)
    cachedFile.once('change', cache => {
        t.deepEqual(cache.contents, {});
    });

    // Fetch data again (should be empty)
    data = cachedFile.get();

    // Verify data
    t.deepEqual(data, {});
});

test.serial('process non-existing file', t => {
    const h = t.context.hugo;

    // Get FileCache instance
    let cachedFile = h.cacheFile(path.resolve(__dirname, 'idontexist.txt'), 'foo');

    // Listen to change event to process data
    cachedFile.on('change', () => {
        t.fail('File does not exist and this should not be called.');
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.falsy(data);
});

/**
 * Tear-down
 */
test.afterEach.always('cleanup', () => {
    cleanUp();
});
