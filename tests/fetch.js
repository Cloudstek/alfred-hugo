import delay from 'delay';
import fs from 'fs-extra';
import nock from 'nock';
import test from 'ava';

import {hugo} from './_init';

const URL = 'http://foo.bar';

/**
 * Clean-up
 */
function cleanUp() {
    fs.emptyDirSync(process.env.alfred_workflow_cache);
}

/**
 * Set-up
 */
test.before('mock requests with nock', () => {
    // Uncached URL
    nock(URL).persist().get('/no-cache').reply(200, {foo: 'bar'});

    // URL which returns 'hello' only once.
    nock(URL).get('/cache').once().reply(200, {message: 'hello'});

    // URL which returns 'world' only once.
    nock(URL).get('/cache').once().reply(200, {message: 'world!'});
});

test.beforeEach('setup', t => {
    const h = hugo();

    h.options({
        checkUpdates: false,
        useTmpCache: false
    });

    t.context.hugo = h;

    cleanUp();
});

/**
 * Fetch uncached
 */
test('fetch uncached', async t => {
    const h = t.context.hugo;

    // Fetch with caching implicitely disabled
    t.deepEqual(await h.fetch(`${URL}/no-cache`), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));

    // Fetch with caching explicitely disabled
    t.deepEqual(await h.fetch(`${URL}/no-cache`, {}, null), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));
});

/**
 * Fetch cached
 */
test('fetch cached', async t => {
    const h = t.context.hugo;

    // Fetch cached with empty cache
    t.falsy(h.cache.get(`${URL}/cache`));
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'hello'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'hello'});

    // Fetch cached with warm cache and assert we have the right output.
    // Nock is set to only return 'hello' once. So if the request is not cached, it would return 'world'.
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'hello'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'hello'});

    // Wait until cache is expired
    await delay(2500);

    // Assert cache is expired
    t.falsy(h.cache.get(`${URL}/cache`));

    // Fetch cached with empty cache one more time and assert that the request is done.
    // Nock is set to only return 'hello' once, which we received before. This time it should return 'world' to complete
    // our sentence. If not, this would indicate the request is still cached somehow.
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'world!'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'world!'});

    // Fetch cached with a warm cache again.
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'world!'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'world!'});
});

/**
 * Tear-down
 */
test.afterEach.always('cleanup', () => {
    cleanUp();
});

test.after.always('nock cleanup', () => {
    nock.cleanAll();
});
