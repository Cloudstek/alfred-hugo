import Test, { TestInterface } from "ava";
import semver from "semver";
import nock from "nock";
import readPkg from "read-pkg-up";

import { UpdateSource } from "../../src";

import { updater, hugo } from "../helpers/init";
import { TestContext } from "../helpers/types";
import * as mock from "../helpers/mock";

const test = Test as TestInterface<TestContext>;

test.beforeEach(() => {
    mock.date();
});

test.serial("check with valid update source NPM", async (t) => {
    // Mock requests
    mock.npm(5);

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: "npm",
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: "NPM",
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: UpdateSource.NPM,
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("npm");
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("NPM");
    });
});

test.serial("check for updates uncached", async (t) => {
    const u = updater();

    // Mock request
    mock.npm(1);

    // Package
    const pkg = readPkg.sync().packageJson;

    const update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, semver.parse(pkg.version).inc("major").toString());
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
});

test.serial("check for updates uncached with custom package.json", async (t) => {
    const u = updater();

    // Package
    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock request
    mock.npm(1, pkg);

    const update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
});

test.serial("check for updates cached", async (t) => {
    const u = updater();

    // Mock requests
    mock.npm(2);

    // Package
    const pkg = readPkg.sync().packageJson;

    // Check for updates
    let update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, semver.parse(pkg.version).inc("major").toString());
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
});

test.serial("check for updates cached with custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock requests
    mock.npm(2, pkg);

    // Check for updates
    let update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
    t.is(nock.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);
    t.is(nock.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
});

test("check for updates with no package name set", async (t) => {
    const u = updater();

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", {
            version: "1.0.0",
        });
    }, {instanceOf: Error, message: "Invalid package.json."});
});

test("check for updates with no package version set", async (t) => {
    const u = updater();

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", {
            name: "alfred-my-workflow",
        });
    }, {instanceOf: Error, message: "Invalid package.json."});
});

test.serial("check for updates with unpublished package", async (t) => {
    const u = updater();

    const pkg = readPkg.sync().packageJson;

    // Mock request
    mock.npm(1, pkg, 404);

    const update = await u.checkUpdates("npm");

    t.is(typeof update, "undefined");
});

test.serial("check for updates with unpublished package from custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock request
    mock.npm(1, pkg, 404);

    const update = await u.checkUpdates("npm", pkg);

    t.is(typeof update, "undefined");
});

test.serial("check for updates with package without latest dist-tag", async (t) => {
    const u = updater();

    const pkg = readPkg.sync().packageJson;

    // Mock request
    nock("https://registry.npmjs.org")
        .get("/" + pkg.name)
        .reply(200, JSON.stringify({
            "name": pkg.name,
            "dist-tags": {},
            "versions": {
                "1.0.0": {
                    name: pkg.name,
                    version: "1.0.0",
                },
                "2.0.0": {
                    name: pkg.name,
                    version: "2.0.0",
                },
            },
        }));

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm");
    }, {instanceOf: Error, message: "No latest version found in response."});
});

test.serial("check for updates with package without latest dist-tag from custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock request
    mock.npm(1, pkg, 200, null);

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", pkg);
    }, {instanceOf: Error, message: "No latest version found in response."});
});

test.serial("check for updates when invalid version is returned", async (t) => {
    const u = updater();

    const pkg = readPkg.sync().packageJson;

    // Mock request
    mock.npm(1, pkg, 200, "foobar");

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm");
    }, {instanceOf: Error, message: "Invalid version in response."});
});

test.afterEach((t) => {
    if (!nock.isDone()) {
        t.fail("Not all requests were performed.");
    }
});

test.afterEach.always(() => {
    mock.cleanAll();
});
