import fs from 'fs';
import path from 'path';
import test from 'ava';
import del from 'del';
import tempfile from 'tempfile';

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
        path.join(path.sep, 'tmp', 'my.work.flow'),
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
test('tmp cache dir', t => {
    const h = t.context.hugo;

    t.plan(2);

    // Set options
    h.options({
        useTmpCache: true
    });

    // Check cache path
    t.is(path.join(path.sep, 'tmp', 'my.work.flow'), h.workflowMeta.cache);

    // Set and get cache data
    h.cache.set('test', testData);
    t.deepEqual(testData, h.cache.get('test'));
});

/**
 * Check standard cache directory
 */
test('standard cache dir', t => {
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
    t.deepEqual(testData, h.cache.get('test'));
});

/**
 * Check cache instance is reinitialized on cache dir change
 */
test('changing cache dir', t => {
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
    t.is(path.join(path.sep, 'tmp', 'my.work.flow'), h.workflowMeta.cache);
    t.false(h.cache.has('test'));
});

/**
 * Check file cache
 */
test('file cache', t => {
    const h = t.context.hugo;
    const file = tempfile();

    t.plan(5);

    fs.writeFileSync(file, 'Hello world!');

    // Fetch data (uncached)
    let data = h.cacheFile(file, 'foo', file => {
        t.is('Hello world!', file);

        return testData;
    });

    // Verify data
    t.deepEqual(testData, data);

    // Fetch data again (should be cached)
    data = h.cacheFile(file, 'foo', () => {
        t.fail('Data has not been cached.');
    });

    // Verify data
    t.deepEqual(testData, data);

    // Alter data
    fs.writeFileSync(file, 'Foo bar!');

    // Fetch data again (should not be cached)
    data = h.cacheFile(file, 'foo', file => {
        t.is('Foo bar!', file);
        return {
            hello: 'world',
            foo: 'bar'
        };
    });

    // Verify data
    t.deepEqual({
        hello: 'world',
        foo: 'bar'
    }, data);
});

/**
 * Tear-down
 */
test.afterEach.always(async () => {
    return cleanUp();
});
