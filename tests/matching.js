import test from 'ava';

import {hugo} from './_init';

const items = [
    {
        title: 'Michael Blob',
        email: 'bla@test.com'
    },
    {
        title: 'Harry Test',
        email: 'bla@test.net'
    },
    {
        title: 'Pinguin Test',
        email: 'bla@test.org'
    }
];

test('exact match', t => {
    const h = hugo();
    let matches = h.matches(items, 'bla@test.org', {
        keys: ['email'],
        threshold: 0
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.is(matches[0].title, 'Pinguin Test');
    t.is(matches[0].email, 'bla@test.org');
});

test('exact match from output buffer', t => {
    const h = hugo();

    // Add items to output buffer
    h.addItems(items);
    t.is(h._outputBuffer.items.length, 3);

    // Filter items
    h.filterItems('bla@test.org', {
        keys: ['email'],
        threshold: 0
    });

    let matches = h._outputBuffer.items;
    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.is(matches[0].title, 'Pinguin Test');
    t.is(matches[0].email, 'bla@test.org');
});

test('match multiple keys', t => {
    const h = hugo();
    let matches = h.matches(items, 'test', {
        keys: ['email', 'title']
    });

    t.true(Array.isArray(matches));
    t.true(matches.length === 3);
});

test('match multiple keys from output buffer', t => {
    const h = hugo();

    // Add items to output buffer
    h.addItems(items);
    t.is(h._outputBuffer.items.length, 3);

    // Filter items
    h.filterItems('test', {
        keys: ['email', 'title']
    });

    let matches = h._outputBuffer.items;
    t.true(Array.isArray(matches));
    t.true(matches.length === 3);
});

test('no match', t => {
    const h = hugo();
    let matches = h.matches(items, 'bla@test.it', {
        keys: ['email'],
        threshold: 0
    });

    t.true(Array.isArray(matches));
    t.true(matches.length === 0);
});

test('no match from output buffer', t => {
    const h = hugo();

    // Add items to output buffer
    h.addItems(items);
    t.is(h._outputBuffer.items.length, 3);

    // Filter items
    h.filterItems('bla@test.it', {
        keys: ['email'],
        threshold: 0
    });

    let matches = h._outputBuffer.items;
    t.true(Array.isArray(matches));
    t.true(matches.length === 0);
});
