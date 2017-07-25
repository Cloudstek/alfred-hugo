import test from 'ava';
import hookStd from 'hook-std';

import {hugo} from './_init';

/**
 * Set-up
 */
test.beforeEach('setup', t => {
    const h = hugo();

    h.options({
        checkUpdates: false
    });

    t.context.hugo = h;
});

/**
 * Items only
 */
test('items only', t => {
    const h = t.context.hugo;

    h.addItem({
        title: 'foo'
    });

    h.addItems([
        {
            title: 'bar',
            subtitle: 'foo'
        },
        {
            title: 'boop',
            subtitle: 'bleep'
        }
    ]);

    // Assert output
    t.snapshot(h._outputBuffer);
});

/**
 * Variables only
 */
test('variables only', t => {
    const h = t.context.hugo;

    h.addVariable('foo', 'bar');
    h.addVariables({
        bleep: 'bloop',
        boop: {
            tap: 'top'
        }
    });

    // Assert output
    t.snapshot(h._outputBuffer);
});

/**
 * Variables and items combined
 */
test('variables and items combined', t => {
    const h = t.context.hugo;

    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    // Assert output
    t.snapshot(h._outputBuffer);
});

/**
 * Item variables
 */
test('items with variables', t => {
    const h = t.context.hugo;

    // Set Alfred version to 3.4.1 or later
    process.env.alfred_version = '3.4.1'; // eslint-disable-line camelcase

    // Add items
    h.addItems([
        {
            title: 'Test 1',
            variables: {
                foo: 'bar'
            }
        },
        {
            title: 'Test 2',
            arg: 'foobar',
            variables: {
                bar: 'foo'
            }
        },
        {
            title: 'Test 3',
            arg: {
                variables: {
                    foo: 'bar'
                }
            }
        },
        {
            title: 'Test 4',
            arg: {
                arg: 'foobar',
                variables: {
                    bar: 'foo'
                }
            }
        },
        {
            title: 'Test 5',
            arg: {
                arg: 'foobar',
                variables: {
                    bar: 'foo'
                }
            },
            variables: {
                foo: 'bar'
            }
        }
    ]);

    // Add variables
    h.addVariable('bloop', 'bleep');
    h.addVariables({
        flooble: 'flab',
        flabby: 'flop'
    });

    // Assert output
    t.is(h.alfredMeta.version, '3.4.1');
    t.snapshot(h._outputBuffer);
});

/**
 * Item variables (legacy, < 3.4.1)
 */
test('items with legacy variables (< 3.4.1)', t => {
    const h = t.context.hugo;

    // Set Alfred version to pre 3.4.1
    process.env.alfred_version = '3.4.0'; // eslint-disable-line camelcase

    // Add items
    h.addItems([
        {
            title: 'Test 1',
            variables: {
                foo: 'bar'
            }
        },
        {
            title: 'Test 2',
            arg: 'foobar',
            variables: {
                bar: 'foo'
            }
        },
        {
            title: 'Test 3',
            arg: {
                variables: {
                    foo: 'bar'
                }
            }
        },
        {
            title: 'Test 4',
            arg: {
                arg: 'foobar',
                variables: {
                    bar: 'foo'
                }
            }
        },
        {
            title: 'Test 5',
            arg: {
                arg: 'foobar',
                variables: {
                    bar: 'foo'
                }
            },
            variables: {
                foo: 'bar'
            }
        }
    ]);

    // Add variables
    h.addVariable('bloop', 'bleep');
    h.addVariables({
        flooble: 'flab',
        flabby: 'flop'
    });

    // Assert output
    t.is(h.alfredMeta.version, '3.4.0');
    t.snapshot(h._outputBuffer);
});

/**
 * Retun parameter
 * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
 */
test.cb('rerun parameter', t => {
    const h = t.context.hugo;

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        output = JSON.parse(output);

        t.snapshot(output);
        t.end();
    });

    h.rerun(1.4);
    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    h.feedback();
});

/**
 * Invalid rerun parameter
 * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
 */
test.cb('invalid rerun parameter', t => {
    const h = t.context.hugo;

    t.plan(2);

    const unhook = hookStd.stdout(output => {
        unhook();

        output = JSON.parse(output);

        // Output should not contain rerun
        t.falsy(output.rerun);
        t.snapshot(output);

        t.end();
    });

    // Rerun is out of bounds
    h.rerun(100);

    // Add some variables and items
    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    h.feedback();
});

/**
 * Invalid items
 */
test('invalid items', t => {
    const h = t.context.hugo;

    // Add invalid items
    h.addItem({
        foo: 'bar'
    });

    h.addItems([
        {
            bloop: 'bleep'
        },
        {
            fleeble: 'flap'
        }
    ]);

    // Add valid item
    h.addItem({
        title: 'foo'
    });

    // Assert output
    t.snapshot(h._outputBuffer);
});
