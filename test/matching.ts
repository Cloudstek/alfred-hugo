import Test, { TestInterface } from 'ava';

import { hugo } from './helpers/init';
import { TestContext } from './helpers/types';

const test = Test as TestInterface<TestContext>;

test.beforeEach((t) => {
    t.context.items = [
        {
            title: 'Foo',
            subtitle: 'foo bar',
        },
        {
            title: 'Bar',
            subtitle: 'foo bar bleep',
        },
        {
            title: 'Eep',
            match: 'Abra',
            subtitle: 'eep foo blep',
        },
        {
            title: 'Foo bar',
            subtitle: 'ploop',
        },
        {
            title: 'Abra',
            subtitle: 'cadabra',
        },
    ];
});

test('exact match', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'Abra', {
        threshold: 0,
        shouldSort: false,
    });

    t.true(Array.isArray(matches));

    // Should match both item with match property as well as title property
    // See https://www.alfredapp.com/help/workflows/inputs/script-filter/json/#match
    t.is(matches.length, 2);
    t.deepEqual(matches[0], t.context.items[2]);
    t.deepEqual(matches[1], t.context.items[4]);
});

test('exact match by single key', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'foo bar bleep', {
        keys: ['subtitle'],
        threshold: 0,
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.deepEqual(matches[0], t.context.items[1]);
});

test('exact match by single key using weighted syntax', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'foo bar bleep', {
        keys: [
            { name: 'subtitle', weight: 0 }
        ],
        threshold: 0,
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.deepEqual(matches[0], t.context.items[1]);
});

test('exact match multiple keys', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'foo', {
        keys: ['title', 'subtitle'],
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 4);
    t.snapshot(matches);
});

test('exact match multiple keys using weighted syntax', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'foo', {
        keys: [
            { name: 'title', weight: 0 },
            { name: 'subtitle', weight: 1 }
        ],
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 4);
    t.snapshot(matches);
});

test('no matches', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, 'nope', {
        threshold: 0,
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 0);
});

test('no query should return all items', (t) => {
    const h = hugo();

    const matches = h.match(t.context.items, '');

    t.true(Array.isArray(matches));
    t.is(matches.length, 5);
    t.snapshot(matches);
});
