import test from 'ava';
import nock from 'nock';
import delay from 'delay';

import {hugo} from './_init';

const URL = 'http://foo.bar';

/**
 * Mocking
 */
test.before(() => {
    nock(URL).get('/no-cache').reply(200, {foo: 'bar'});
    nock(URL).get('/cache').once().reply(200, {message: 'hello'});
    nock(URL).get('/cache').once().reply(200, {message: 'world!'});
});

/**
 * Set-up
 */
test.beforeEach(t => {
    const h = hugo();

    h.options({
        checkUpdates: false
    });

    t.context.hugo = h;
});

test('fetch uncached', async t => {
    const h = hugo();

    t.plan(2);

    t.deepEqual(await h.fetch(`${URL}/no-cache`, {}, false), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));
});

test('fetch cached', async t => {
    const h = hugo();

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
