import test from 'ava';

import {hugo} from './_init';

/**
 * Set-up
 */
test.beforeEach('setup', t => {
    const h = hugo();
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

    h.options({
        checkUpdates: false
    });

    t.context.hugo = h;
    t.context.items = items;
});

/**
 * Exact match
 */
test('exact match', t => {
    const h = t.context.hugo;

    let matches = h.matches(t.context.items, 'bla@test.org', {
        keys: ['email'],
        threshold: 0
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.is(matches[0].title, 'Pinguin Test');
    t.is(matches[0].email, 'bla@test.org');
});

/**
 * Exact match from output buffer (existing items)
 */
test('exact match from output buffer', t => {
    const h = t.context.hugo;

    // Add items to output buffer
    t.is(h.itemCount, 0);
    h.addItems(t.context.items);
    t.is(h.itemCount, 3);

    // Filter items
    h.filterItems('bla@test.org', {
        keys: ['email'],
        threshold: 0
    });

    let matches = h.outputBuffer.items;
    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.is(matches[0].title, 'Pinguin Test');
    t.is(matches[0].email, 'bla@test.org');
});

/**
 * Match multiple keys
 */
test('match multiple keys', t => {
    const h = t.context.hugo;

    let matches = h.matches(t.context.items, 'test', {
        keys: ['email', 'title']
    });

    t.true(Array.isArray(matches));
    t.true(matches.length === 3);
});

/**
 * Match multiple keys from output buffer (existing items)
 */
test('match multiple keys from output buffer', t => {
    const h = t.context.hugo;

    // Add items to output buffer
    t.is(h.itemCount, 0);
    h.addItems(t.context.items);
    t.is(h.itemCount, 3);

    // Filter items
    h.filterItems('test', {
        keys: ['email', 'title']
    });

    let matches = h.outputBuffer.items;
    t.true(Array.isArray(matches));
    t.true(matches.length === 3);
});

/**
 * No matches
 */
test('no matches', t => {
    const h = t.context.hugo;

    let matches = h.matches(t.context.items, 'bla@test.it', {
        keys: ['email'],
        threshold: 0
    });

    t.true(Array.isArray(matches));
    t.true(matches.length === 0);
});

/**
 * No matches from output buffer (existing items)
 */
test('no matches from output buffer', t => {
    const h = t.context.hugo;

    // Add items to output buffer
    t.is(h.itemCount, 0);
    h.addItems(t.context.items);
    t.is(h.itemCount, 3);

    // Filter items
    h.filterItems('bla@test.it', {
        keys: ['email'],
        threshold: 0
    });

    let matches = h.outputBuffer.items;
    t.true(Array.isArray(matches));
    t.is(matches.length, 0);
    t.is(h.itemCount, 0);
});
