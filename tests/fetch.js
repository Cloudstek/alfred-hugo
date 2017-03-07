import test from 'ava';
import nock from 'nock';
import delay from 'delay';
import {hugo} from './_init';

const URL = 'http://foo.bar';

test.before(() => {
    nock(URL).get('/no-cache').reply(200, {foo: 'bar'});
    nock(URL).get('/cache').once().reply(200, {message: 'hello'});
    nock(URL).get('/cache').twice().reply(200, {message: 'world!'});
});

test('no cache', async t => {
    const h = hugo();
    t.deepEqual(await h.fetch(`${URL}/no-cache`, {}, false), {foo: 'bar'});
    t.falsy(h.cache.get(`${URL}/no-cache`));
});

test('cached', async t => {
    const h = hugo();
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
