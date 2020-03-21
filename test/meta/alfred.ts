/* eslint-disable @typescript-eslint/camelcase */
import test from 'ava';
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

import { hugo } from '../helpers/init';

const backupConsoleError = console.error;

test.serial('valid version', (t) => {
    const h = hugo();

    process.env.alfred_version = '3.0.0';

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.version, '3.0.0');
});

test.serial('single digit version', (t) => {
    const h = hugo();

    process.env.alfred_version = '3';

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.version, '3.0.0');
});

test.serial('two digit version', (t) => {
    const h = hugo();

    process.env.alfred_version = '3.0';

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.version, '3.0.0');
});

test.serial('no version', (t) => {
    const consoleStub = sinon.stub(console, 'error');
    const h = hugo();

    process.env.alfred_debug = '0';
    delete process.env.alfred_version;

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.version);
    t.false(consoleStub.called);

    // Check if debug message is output
    process.env.alfred_debug = '1';

    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.version);
    t.true(consoleStub.calledWith('Invalid Alfred version: undefined'));
});

test.serial('invalid version', (t) => {
    const consoleStub = sinon.stub(console, 'error');
    const h = hugo();

    process.env.alfred_debug = '0';
    process.env.alfred_version = 'foobar';

    // Check version number
    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.version);
    t.false(consoleStub.called);

    // Check if debug message is output
    process.env.alfred_debug = '1';

    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.version);
    t.true(consoleStub.calledWith('Invalid Alfred version: foobar'));
});

test.serial('existing theme', (t) => {
    const h = hugo();

    process.env.alfred_theme = 'foo';

    const themeFilePath = path.resolve(process.env.alfred_preferences, 'themes', process.env.alfred_theme, 'theme.json');

    fs.ensureFileSync(themeFilePath);
    fs.writeJsonSync(themeFilePath, {
        alfredtheme: {
            foo: 'bar',
        },
    });

    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.themeFile, themeFilePath);
});

test.serial('non-existing theme', (t) => {
    const consoleStub = sinon.stub(console, 'error');
    const h = hugo();

    // Valid theme name but directory doesn't exist.
    process.env.alfred_debug = '0';
    process.env.alfred_theme = 'default';

    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.themeFile);
    t.false(consoleStub.called);

    // Check if debug message is output
    process.env.alfred_debug = '1';

    t.is(typeof h.alfredMeta, 'object');
    t.falsy(h.alfredMeta.themeFile);
    t.true(consoleStub.called);
    t.regex(consoleStub.getCall(0).args[0], /^Could not find theme file /);
});

test.afterEach.always(() => {
    console.error = backupConsoleError;
});
