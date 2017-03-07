import test from 'ava';
import hookStd from 'hook-std';
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

test.beforeEach(() => {
    const unhook = hookStd.stdout(() => {
        unhook();
    });
});

test('items only', async t => {
    const h = hugo();

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

    let output = await h.feedback();

    t.deepEqual(output, {
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

test('variables only', async t => {
    const h = hugo();

    h.addVariable('foo', 'bar');
    h.addVariables({
        bleep: 'bloop',
        boop: {
            tap: 'top'
        }
    });

    let output = await h.feedback();

    t.deepEqual(output, {
        variables: {
            foo: 'bar',
            bleep: 'bloop',
            boop: {
                tap: 'top'
            }
        }
    });
});

test('variables and items combined', async t => {
    const h = hugo();

    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    let output = await h.feedback();

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

test('rerun parameter', async t => {
    const h = hugo();

    h.rerun(1.4);
    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    let output = await h.feedback();

    t.deepEqual(output, {
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

test('invalid rerun parameter', async t => {
    const h = hugo();

    h.rerun(100);
    h.addVariable('foo', 'bar');
    h.addItem({
        title: 'foo'
    });

    let output = await h.feedback();

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

test('invalid items', async t => {
    const h = hugo();

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

    let output = await h.feedback();

    t.deepEqual(output, {
        items: [
            {
                title: 'foo'
            }
        ]
    });
});
