import test from 'ava';

import {hugo} from './_init';

/**
 * Set-up
 */
test.beforeEach('setup', t => {
    const h = hugo();

    h.options({
        checkUpdates: false,
        useTmpCache: false
    });

    t.context.hugo = h;
});

/**
 * Check alfred meta with invalid version number
 */
test('alfred meta with invalid version', t => {
    const h = t.context.hugo;

    // Set alfred version
    process.env.alfred_version = '3.0'; // eslint-disable-line camelcase

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.version, '3.0.0');
});
