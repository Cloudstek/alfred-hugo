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
    nock(URL).persist().get('/no-cache').reply(200, {foo: 'bar'});
    nock(URL).get('/cache').once().reply(200, {message: 'hello'});
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

    t.plan(4);

    t.deepEqual(await h.fetch(`${URL}/no-cache`), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));
    t.deepEqual(await h.fetch(`${URL}/no-cache`, {}, false), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));
});

/**
 * Fetch cached
 */
test('fetch cached', async t => {
    const h = t.context.hugo;

    t.plan(10);

    t.falsy(h.cache.get(`${URL}/cache`));
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'hello'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'hello'});

    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'hello'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'hello'});

    await delay(2500);

    t.falsy(h.cache.get(`${URL}/cache`));
    t.deepEqual(await h.fetch(`${URL}/cache`, {}, 2), {message: 'world!'});
    t.deepEqual(h.cache.get(`${URL}/cache`), {message: 'world!'});
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
