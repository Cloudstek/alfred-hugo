import readPkg from 'read-pkg-up';
import semver from 'semver';
import nock from 'nock';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import mockdate from 'mockdate';
import moment, { DurationInputArg1, DurationInputArg2 } from 'moment';

export function date() {
    mockdate.set(moment.utc('2019-01-01T14:00:00').valueOf());
}

export function forwardTime(amount?: DurationInputArg1, unit?: DurationInputArg2) {
    mockdate.set(moment.utc().add(amount, unit).toDate());
}

export function npm(times: number, pkg?: any, code = 200, latestVersion?: string) {
    pkg = pkg || readPkg.sync().packageJson;

    if (latestVersion !== null) {
        latestVersion = latestVersion || semver.parse(pkg.version).inc('major').toString();
    }

    // Build versions response
    const versions: { [key: string]: any } = {
        '1.0.0': {
            name: pkg.name,
            version: '1.0.0',
        },
    };

    versions[pkg.version] = {
        name: pkg.name,
        version: pkg.version,
    };

    versions[latestVersion] = {
        name: pkg.name,
        version: latestVersion,
    };

    const distTags: { [key: string]: any } = {};

    if (latestVersion !== null) {
        distTags.latest = latestVersion;
    }

    // Response body
    let body = '';

    if (code >= 200 && code <= 299) {
        body = JSON.stringify({
            'name': pkg.name,
            'dist-tags': distTags,
            versions,
        });
    }

    // Mock requests
    const url = 'https://registry.npmjs.org';
    const urlPath = '/' + pkg.name;

    if (times >= 0) {
        for (let i = 0; i < times; i++) {
            nock(url)
                .get(urlPath)
                .reply(code, body)
            ;
        }

        return;
    }

    nock(url)
        .persist()
        .get(urlPath)
        .reply(code, body)
    ;
}

export function packal(times: number, code = 200, filename = 'appcast.xml') {
    filename = path.join('test', 'helpers', 'mocks', filename);

    // Response body
    let body = '';

    if (code >= 200 && code <= 299) {
        body = fs.readFileSync(filename, { encoding: 'utf8' });
    }

    // Mock requests
    const url = 'https://github.com';
    const urlPath = '/packal/repository/blob/master/my.work.flow/appcast.xml';

    if (times >= 0) {
        for (let i = 0; i < times; i++) {
            nock(url)
                .get(urlPath)
                .reply(code, body)
            ;
        }

        return;
    }

    nock(url)
        .persist()
        .get(urlPath)
        .reply(code, body)
    ;
}

export function file() {
    const filePath = path.join('build', 'cache', crypto.randomBytes(8).toString('hex'));

    fs.ensureFileSync(filePath);

    return filePath;
}

export function cleanDate() {
    mockdate.reset();
}

export function cleanNock() {
    nock.cleanAll();
}

export function cleanAll() {
    cleanDate();
    cleanNock();
}
