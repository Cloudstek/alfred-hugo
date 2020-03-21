import test from 'ava';
import { hugo } from './helpers/init';

test.serial('no actions defined', (t) => {
    process.argv = [
        'node',
        'index.js',
        'foo',
    ];

    const h = hugo();

    t.is(h.input.length, 1);
    t.is(h.input[0], 'foo');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo']);
});

test.serial('actions defined but no matching action', (t) => {
    process.argv = [
        'node',
        'index.js',
        'foo',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action('soap', (query) => {
        t.log(query);
        t.fail();
    });

    t.is(h.input.length, 1);
    t.is(h.input[0], 'foo');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo']);
});

test.serial('actions defined but no action given', (t) => {
    process.argv = [
        'node',
        'index.js',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action('soap', (query) => {
        t.log(query);
        t.fail();
    });

    t.is(h.input.length, 0);

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run([]);
});

test.serial('actions defined and matching action with no query', (t) => {
    t.plan(2);

    process.argv = [
        'node',
        'index.js',
        'foo',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action('foo', (query) => {
        t.is(query.length, 0);
    });

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo']);
});

test.serial('actions defined and matching action with query', (t) => {
    t.plan(4);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'bar',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action('foo', (query) => {
        t.is(query.length, 1);
        t.is(query[0], 'bar');
    });

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar']);
});

test('run actions with custom arguments instead of argv', (t) => {
    t.plan(2);
    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action('foo', (query) => {
        t.is(query.length, 1);
        t.is(query[0], 'bar');
    });

    h.run(['foo', 'bar']);
});

test.serial('main action without callback and no matching sub-action', (t) => {
    process.argv = [
        'node',
        'index.js',
        'foo',
        'hello',
        'world',
    ];

    const h = hugo();

    // Foo with bar sub-action
    h
        .action('foo')
        .action('bar', (query) => {
            t.fail();
        })
    ;

    t.is(h.input.length, 3);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'hello');
    t.is(h.input[2], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'hello', 'world']);
});

test.serial('main action with matching sub-action', (t) => {
    t.plan(6);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'bar',
        'hello',
        'world',
    ];

    const h = hugo();

    // Foo action with bar sub-action
    const fooAction = h.action('foo', (query) => {
        t.fail();
    });

    // Bar sub-action with floop sub-action
    const barAction = fooAction.action('bar', (query) => {
        t.is(query.length, 2);
        t.is(query[0], 'hello');
        t.is(query[1], 'world');
    });

    barAction.action('floop', (query) => {
        t.fail();
    });

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar', 'hello', 'world']);
});

test.serial('main action with matching sub-sub-action', (t) => {
    t.plan(6);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'bar',
        'floop',
        'hello',
        'world',
    ];

    const h = hugo();

    // Foo action with bar sub-action
    const fooAction = h.action('foo', (query) => {
        t.fail();
    });

    // Bar sub-action with floop sub-action
    const barAction = fooAction.action('bar', (query) => {
        t.fail();
    });

    barAction.action('floop', (query) => {
        t.is(query.length, 2);
        t.is(query[0], 'hello');
        t.is(query[1], 'world');
    });

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar', 'floop', 'hello', 'world']);
});

test.serial('main action with sub-actions defined, without query', (t) => {
    t.plan(2);

    process.argv = [
        'node',
        'index.js',
        'foo',
    ];

    const h = hugo();

    // Foo with bar sub-action
    h
        .action('foo', (query) => {
            t.is(query.length, 0);
        })
        .action('bar', (query) => {
            t.fail();
        })
    ;

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo']);
});

test.serial('main action with sub-actions defined, with query but no sub-action match', (t) => {
    t.plan(4);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'hello',
    ];

    const h = hugo();

    // Foo with bar sub-action
    h
        .action('foo', (query) => {
            t.is(query.length, 1);
            t.is(query[0], 'hello');
        })
        .action('bar', (query) => {
            t.fail();
        })
    ;

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'hello']);
});
