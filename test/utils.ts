/* eslint-disable @typescript-eslint/camelcase */
import test from 'ava';
import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import sinon from 'sinon';
import bplist from 'bplist-creator';
import semver from 'semver';

// Stub home directory
const homeDir = path.resolve('build', 'cache', crypto.randomBytes(8).toString('hex'));
sinon.stub(os, 'homedir').returns(homeDir);

import utils from '../src/utils';
import { hugo } from './helpers/init';

test.serial('resolve alfred 3 preferences', (t) => {
    // Write new binary plist
    const plist = bplist({});

    // Write file to expected path
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-3.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs('3.0.0');
    const pSemver = utils.resolveAlfredPrefs(semver.parse('3.0.0'));

    t.is(p, path.join(homeDir, 'Library/Application Support/Alfred 3/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test.serial('resolve alfred 4 preferences', (t) => {
    // Write new binary plist
    const plist = bplist({});

    // Write file to expected path
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs('4.0.0');
    const pSemver = utils.resolveAlfredPrefs(semver.parse('4.0.0'));

    t.is(p, path.join(homeDir, 'Library/Application Support/Alfred/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test.serial('resolve randomly versioned preferences', (t) => {
    // Write new binary plist
    const plist = bplist({});

    const major = Math.floor(Math.random() * (15 - 5)) + 5;
    const version = `${major}.0.0`;

    t.log(`Using version: ${version}`);

    // Write file to expected path
    const plistPath = path.join(homeDir, `/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-${major}.plist`);

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs(version);
    const pSemver = utils.resolveAlfredPrefs(semver.parse(version));

    t.is(p, path.join(homeDir, `Library/Application Support/Alfred ${major}/Alfred.alfredpreferences`));
    t.is(pSemver, p);
});

test.serial('prefer unversioned preferences over versioned preferences', (t) => {
    // Write new binary plist
    const plist = bplist({});

    // Write file to expected path
    const plist3Path = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-3.plist');
    const plist4Path = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences.plist');

    fs.ensureFileSync(plist3Path);
    fs.writeFileSync(plist3Path, plist);

    fs.ensureFileSync(plist4Path);
    fs.writeFileSync(plist4Path, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs('4.0.0');
    const pSemver = utils.resolveAlfredPrefs(semver.parse('4.0.0'));

    t.is(p, path.join(homeDir, 'Library/Application Support/Alfred/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test.serial('resolve synced alfred 3 preferences', (t) => {
    // Write new binary plist
    const plist = bplist({
        syncfolder: '~/Dropbox',
    });

    // Write file to expected path
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-3.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs('3.0.0');
    const pSemver = utils.resolveAlfredPrefs(semver.parse('3.0.0'));

    t.is(p, path.join(homeDir, 'Dropbox/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test('resolve synced alfred 4 preferences', (t) => {
    // Write new binary plist
    const plist = bplist({
        syncfolder: '~/Dropbox',
    });

    // Write file to expected path
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs('4.0.0');
    const pSemver = utils.resolveAlfredPrefs(semver.parse('4.0.0'));

    t.is(p, path.join(homeDir, 'Dropbox/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test.serial('resolve randomly versioned synced preferences', (t) => {
    // Write new binary plist
    const plist = bplist({
        syncfolder: '~/Dropbox',
    });

    const major = Math.floor(Math.random() * (15 - 5)) + 5;
    const version = `${major}.0.0`;

    t.log(`Using version: ${version}`);

    // Write file to expected path
    const plistPath = path.join(homeDir, `/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-${major}.plist`);

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file
    const p = utils.resolveAlfredPrefs(version);
    const pSemver = utils.resolveAlfredPrefs(semver.parse(version));

    t.is(p, path.join(homeDir, 'Dropbox/Alfred.alfredpreferences'));
    t.is(pSemver, p);
});

test.serial('resolve non-existing alfred 3 preferences', (t) => {
    // Write new binary plist
    const plist = bplist({});

    // Write alfred 4 preferences file
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    // Resolve preferences file for alfred 3
    t.throws(() => {
        utils.resolveAlfredPrefs('3.0.0');
    });

    t.throws(() => {
        utils.resolveAlfredPrefs(semver.parse('3.0.0'));
    });
});

test.serial('resolve alfred 3 preferences using alfredMeta', (t) => {
    const plist = bplist({});
    const h = hugo();

    process.env.alfred_version = '3.0.0';
    delete process.env.alfred_preferences;

    // Write file to expected path
    const plistPath = path.join(homeDir, '/Library/Preferences/com.runningwithcrayons.Alfred-Preferences-3.plist');

    fs.ensureFileSync(plistPath);
    fs.writeFileSync(plistPath, plist);

    t.is(typeof h.alfredMeta, 'object');
    t.is(h.alfredMeta.preferences, path.join(homeDir, 'Library/Application Support/Alfred 3/Alfred.alfredpreferences'));
});

test.afterEach.always(() => {
    fs.removeSync(homeDir);
});
