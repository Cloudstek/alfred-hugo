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

test.serial('actions defined with empty name', (t) => {
    process.argv = [
        'node',
        'index.js',
    ];

    const h = hugo();

    t.is(h.input.length, 0);

    t.throws(() => {
        h.action('', (query) => {
            t.log(query);
            t.fail();
        });
    }, { message: 'Action name or alias cannot be empty an empty string.' });

    h.run();
});

test.serial('actions defined with empty aliases', (t) => {
    process.argv = [
        'node',
        'index.js',
    ];

    const h = hugo();

    t.is(h.input.length, 0);

    t.throws(() => {
        t.log('foo');
        h.action([], (query) => {
            t.log(query);
            t.fail();
        });
    }, { message: 'Action has no name or aliases.' });

    h.run();
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

    h.action(['hello', 'world'], (query) => {
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

    h.action(['hello', 'world'], (query) => {
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

test.serial('actions defined with aliases and matching action with no query', (t) => {
    t.plan(4);

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

    h.action(['foo', 'zap'], (query) => {
        t.is(query.length, 0);
    });

    t.is(h.input.length, 1);
    t.is(h.input[0], 'foo');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo']);
});

test.serial('actions defined with aliases and matching alias with no query', (t) => {
    t.plan(4);

    process.argv = [
        'node',
        'index.js',
        'zap',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action(['foo', 'zap'], (query) => {
        t.is(query.length, 0);
    });

    t.is(h.input.length, 1);
    t.is(h.input[0], 'zap');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['zap']);
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

test.serial('actions defined with aliases and matching action with query', (t) => {
    t.plan(7);

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

    h.action(['foo', 'zap'], (query) => {
        t.is(query.length, 1);
        t.is(query[0], 'bar');
    });

    t.is(h.input.length, 2);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'bar');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar']);
});

test.serial('actions defined with aliases and matching alias with query', (t) => {
    t.plan(7);

    process.argv = [
        'node',
        'index.js',
        'zap',
        'bar',
    ];

    const h = hugo();

    h.action('bar', (query) => {
        t.log(query);
        t.fail();
    });

    h.action(['foo', 'zap'], (query) => {
        t.is(query.length, 1);
        t.is(query[0], 'bar');
    });

    t.is(h.input.length, 2);
    t.is(h.input[0], 'zap');
    t.is(h.input[1], 'bar');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['zap', 'bar']);
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
    t.plan(11);

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
        // Fail if calling just foo without sub action
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

    t.is(h.input.length, 4);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'bar');
    t.is(h.input[2], 'hello');
    t.is(h.input[3], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar', 'hello', 'world']);
});

test.serial('main action with matching sub-action by alias', (t) => {
    t.plan(11);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'zap',
        'hello',
        'world',
    ];

    const h = hugo();

    // Foo action with bar sub-action
    const fooAction = h.action('foo', (query) => {
        // Fail if calling just foo without sub action
        t.fail();
    });

    // Bar sub-action with floop sub-action
    const barAction = fooAction.action(['bar', 'zap'], (query) => {
        t.is(query.length, 2);
        t.is(query[0], 'hello');
        t.is(query[1], 'world');
    });

    barAction.action('floop', (query) => {
        t.fail();
    });

    t.is(h.input.length, 4);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'zap');
    t.is(h.input[2], 'hello');
    t.is(h.input[3], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'zap', 'hello', 'world']);
});

test.serial('main action by alias with matching sub-action', (t) => {
    t.plan(11);

    process.argv = [
        'node',
        'index.js',
        'bleep',
        'bar',
        'hello',
        'world',
    ];

    const h = hugo();

    // Foo action with bar sub-action
    const fooAction = h.action(['foo', 'bleep'], (query) => {
        // Fail if calling just foo without sub action
        t.fail();
    });

    // Bar sub-action with floop sub-action
    const barAction = fooAction.action(['bar', 'zap'], (query) => {
        t.is(query.length, 2);
        t.is(query[0], 'hello');
        t.is(query[1], 'world');
    });

    barAction.action('floop', (query) => {
        t.fail();
    });

    t.is(h.input.length, 4);
    t.is(h.input[0], 'bleep');
    t.is(h.input[1], 'bar');
    t.is(h.input[2], 'hello');
    t.is(h.input[3], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['bleep', 'bar', 'hello', 'world']);
});

test.serial('main action with matching sub-sub-action', (t) => {
    t.plan(12);

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

    t.is(h.input.length, 5);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'bar');
    t.is(h.input[2], 'floop');
    t.is(h.input[3], 'hello');
    t.is(h.input[4], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar', 'floop', 'hello', 'world']);
});

test.serial('main action with matching sub-sub-action by alias', (t) => {
    t.plan(12);

    process.argv = [
        'node',
        'index.js',
        'foo',
        'bar',
        'flap',
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

    barAction.action(['floop', 'flap'], (query) => {
        t.is(query.length, 2);
        t.is(query[0], 'hello');
        t.is(query[1], 'world');
    });

    t.is(h.input.length, 5);
    t.is(h.input[0], 'foo');
    t.is(h.input[1], 'bar');
    t.is(h.input[2], 'flap');
    t.is(h.input[3], 'hello');
    t.is(h.input[4], 'world');

    h.run();

    // Now run with custom args
    process.argv = [];

    h.run(['foo', 'bar', 'flap', 'hello', 'world']);
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
