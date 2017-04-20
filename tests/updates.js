import fs from 'fs-extra';
import path from 'path';
import test from 'ava';
import nock from 'nock';
import delay from 'delay';
import moment from 'moment';

import {hugo, updater} from './_init';

/**
 * Set-up
 */
test.before('mock requests with nock', () => {
    nock('https://github.com')
        .persist()
        .get('/packal/repository/blob/master/my.work.flow/appcast.xml')
        .reply(200, fs.readFileSync(path.join(__dirname, 'mocks/appcast.xml')));

    nock('https://registry.npmjs.org')
        .persist()
        .get('/alfred-my-workflow')
        .reply(200, JSON.stringify({
            name: 'alfred-my-workflow',
            'dist-tags': {
                latest: '2.1.0'
            },
            versions: {
                '1.0.0': {
                    name: 'alfred-my-workflow',
                    version: '1.0.0'
                },
                '2.1.0': {
                    name: 'alfred-my-workflow',
                    version: '2.1.0'
                }
            }
        }));
});

test.beforeEach('setup', t => {
    const h = hugo();
    const u = updater();

    h.options({
        checkUpdates: true,
        updateNotification: false,
        updateItem: true
    });

    const pkg = {
        name: 'alfred-my-workflow',
        version: '1.0.0'
    };

    t.context.hugo = h;
    t.context.updater = u;
    t.context.pkg = pkg;
});

/**
 * Check Packal for updates uncached
 */
test('check packal for updates uncached', async t => {
    const u = t.context.updater;

    t.plan(4);

    let update = await u.checkUpdates('packal', moment.duration(1, 'day'));

    t.is(update.version, '2.1.0');
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);
});

/**
 * Check Packal for updates cached
 */
test('check packal for updates cached', async t => {
    const u = t.context.updater;

    t.plan(6);

    // Check for updates
    let update = await u.checkUpdates('packal', moment.duration(2, 'seconds'));

    t.is(update.version, '2.1.0');
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);

    // Check for updates again, should be cached.
    update = await u.checkUpdates('packal', moment.duration(1, 'milliseconds'));

    t.false(update.checkedOnline);

    // Let cache expire
    await delay(2500);

    // Check for updates again, should be checked online
    update = await u.checkUpdates('packal', moment.duration(1, 'milliseconds'));

    t.true(update.checkedOnline);
});

/**
 * Check NPM for updates uncached
 */
test('check npm for updates uncached', async t => {
    const u = t.context.updater;

    t.plan(3);

    let update = await u.checkUpdates('npm', moment.duration(1, 'day'), t.context.pkg);

    t.is(update.version, '2.1.0');
    t.is(update.url, `https://www.npmjs.com/package/${t.context.pkg.name}`);
    t.true(update.checkedOnline);
});

/**
 * Check NPM for updates cached
 */
test('check npm for updates cached', async t => {
    const u = t.context.updater;

    t.plan(5);

    // Check for updates
    let update = await u.checkUpdates('npm', moment.duration(2, 'seconds'), t.context.pkg);

    t.is(update.version, '2.1.0');
    t.is(update.url, `https://www.npmjs.com/package/${t.context.pkg.name}`);
    t.true(update.checkedOnline);

    // Check for updates again, should be cached.
    update = await u.checkUpdates('npm', moment.duration(1, 'milliseconds'), t.context.pkg);

    t.false(update.checkedOnline);

    // Let cache expire
    await delay(2500);

    // Check for updates again, should be checked online
    update = await u.checkUpdates('npm', moment.duration(1, 'milliseconds'), t.context.pkg);

    t.true(update.checkedOnline);
});

/**
 * Check update notification item
 */
test.serial('update notification item', async t => {
    const h = t.context.hugo;

    t.plan(8);

    h.options({
        updateSource: 'packal'
    });

    await h.checkUpdates();

    // Check output buffer
    t.true(Array.isArray(h.outputBuffer.items));
    t.is(h.outputBuffer.items.length, 1);

    // Check update item
    let item = h.outputBuffer.items.pop();

    t.is(item.title, `Workflow update available!`);
    t.truthy(item.arg);

    // Check arg property
    let arg = JSON.parse(item.arg);

    t.is(typeof arg, 'object');
    t.truthy(arg.alfredworkflow);
    t.truthy(arg.alfredworkflow.arg);
    t.deepEqual(arg.alfredworkflow.variables, {
        task: 'wfUpdate'
    });
});

/**
 * Tear-down
 */
test.after.always('nock cleanup', () => {
    nock.cleanAll();
});
