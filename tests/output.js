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

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        t.deepEqual(JSON.parse(output), {
            items: [
                {
                    title: 'foo'
                },
                {
                    title: 'bar',
                    subtitle: 'foo'
                },
                {
                    title: 'boop',
                    subtitle: 'bleep'
                }
            ]
        });
    });

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

    h.feedback();
});

/**
 * Variables only
 */
test('variables only', t => {
    const h = t.context.hugo;

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        t.deepEqual(JSON.parse(output), {
            variables: {
                foo: 'bar',
                bleep: 'bloop',
                boop: {
                    tap: 'top'
                }
            }
        });
    });

    h.addVariable('foo', 'bar');
    h.addVariables({
        bleep: 'bloop',
        boop: {
            tap: 'top'
        }
    });

    h.feedback();
});

/**
 * Variables and items combined
 */
test('variables and items combined', t => {
    const h = t.context.hugo;

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        t.deepEqual(JSON.parse(output), {
            variables: {
                foo: 'bar'
            },
            items: [
                {
                    title: 'foo'
                }
            ]
        });
    });

    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    h.feedback();
});

/**
 * Retun parameter
 * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
 */
test('rerun parameter', t => {
    const h = t.context.hugo;

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        t.deepEqual(JSON.parse(output), {
            rerun: 1.4,
            variables: {
                foo: 'bar'
            },
            items: [
                {
                    title: 'foo'
                }
            ]
        });
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
test('invalid rerun parameter', t => {
    const h = t.context.hugo;

    t.plan(2);

    const unhook = hookStd.stdout(output => {
        unhook();

        output = JSON.parse(output);

        // Output should not contain rerun
        t.falsy(output.rerun);
        t.deepEqual(output, {
            variables: {
                foo: 'bar'
            },
            items: [
                {
                    title: 'foo'
                }
            ]
        });
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

    t.plan(1);

    const unhook = hookStd.stdout(output => {
        unhook();

        t.deepEqual(JSON.parse(output), {
            items: [
                {
                    title: 'foo'
                }
            ]
        });
    });

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

    h.feedback();
});
