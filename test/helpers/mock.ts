import readPkg from "read-pkg";
import semver from "semver";
import nock from "nock";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";
import mockdate from "mockdate";
import moment, { DurationInputArg1, DurationInputArg2 } from "moment";

export function date() {
    mockdate.set(moment.utc("2019-01-01T14:00:00").valueOf());
}

export function forwardTime(amount?: DurationInputArg1, unit?: DurationInputArg2) {
    mockdate.set(moment.utc().add(amount, unit));
}

export function npm(times: number = 1, pkg?: any, code: number = 200, latestVersion?: string) {
    pkg = pkg || readPkg.sync();

    if (latestVersion !== null) {
        latestVersion = latestVersion || semver.parse(pkg.version).inc("major").toString();
    }

    // Build versions response
    const versions: { [key: string]: any } = {
        "1.0.0": {
            name: pkg.name,
            version: "1.0.0",
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
    let body = "";

    if (code >= 200 && code <= 299) {
        body = JSON.stringify({
            "name": pkg.name,
            "dist-tags": distTags,
            versions,
        });
    }

    // Mock requests
    return nock("https://registry.npmjs.org")
        .get("/" + pkg.name)
        .times(times)
        .reply(code, body);
}

export function packal(times: number = 1, code: number = 200, filename: string = "appcast.xml") {
    filename = path.join("test", "helpers", "mocks", filename);

    // Response body
    let body = "";

    if (code >= 200 && code <= 299) {
        body = fs.readFileSync(filename, { encoding: "utf8" });
    }

    return nock("https://github.com")
        .get("/packal/repository/blob/master/my.work.flow/appcast.xml")
        .times(times)
        .reply(code, body);
}

export function file() {
    const filePath = path.join("build", "cache", crypto.randomBytes(8).toString("hex"));

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
