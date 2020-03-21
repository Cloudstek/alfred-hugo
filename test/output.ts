import test from 'ava';

import { hugo } from './helpers/init';

test('items only', (t) => {
    const h = hugo();

    h.items.push(
        {
            title: 'foo',
        },
        {
            title: 'bar',
            subtitle: 'foo',
        },
        {
            title: 'boop',
            subtitle: 'bleep',
        },
    );

    t.snapshot(h.output);
});

test('variables only', (t) => {
    const h = hugo();

    h.variables =  {
        bleep: 'bloop',
        boop: {
            tap: 'top',
        },
    };

    t.snapshot(h.output);
});

test('variables and items combined', (t) => {
    const h = hugo();

    h.variables.foo = 'bar';
    h.items.push({
        title: 'foo',
    });

    t.snapshot(h.output);
});

test('items with variables', (t) => {
    const h = hugo();

    h.items.push(
        {
            title: 'Test 1',
            variables: {
                foo: 'bar',
            },
        },
        {
            title: 'Test 2',
            arg: 'foobar',
            variables: {
                bar: 'foo',
            },
        },
    );

    h.variables = {
        bloop: 'bleep',
        flooble: 'flab',
        flabby: 'flop',
    };

    t.snapshot(h.output);
});

test('rerun parameter', (t) => {
    const h = hugo();

    h.rerun = 1.4;
    h.variables.foo = 'bar';
    h.items.push({
        title: 'foo',
    });

    t.snapshot(h.output);
});

test('invalid rerun parameter', (t) => {
    const h = hugo();

    h.rerun = 10.5;
    h.variables.foo = 'bar';
    h.items.push({
        title: 'foo',
    });

    try {
        const contents = h.output;

        t.falsy(contents);
        t.fail();
    } catch (e) {
        t.pass();
    }
});
