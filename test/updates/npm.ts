import Test, { TestInterface } from "ava";
import semver from "semver";
import nock from "nock";
import readPkg from "read-pkg";

import { updater } from "../helpers/init";
import { TestContext } from "../helpers/types";
import * as mock from "../helpers/mock";

const test = Test as TestInterface<TestContext>;

test.beforeEach(() => {
    mock.date();
});

test.serial("check for updates uncached", async (t) => {
    const u = updater();

    const pkg = readPkg.sync();
    const request = mock.npm();

    const update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, semver.parse(pkg.version).inc("major").toString());
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test.serial("check for updates uncached with custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };
    const request = mock.npm(1, pkg);

    const update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test.serial("check for updates cached", async (t) => {
    const u = updater();

    const pkg = readPkg.sync();
    const request = mock.npm(2);

    // Check for updates
    let update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, semver.parse(pkg.version).inc("major").toString());
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("npm");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test.serial("check for updates cached with custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };
    const request = mock.npm(2, pkg);

    // Check for updates
    let update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.is(update.url, `https://www.npmjs.com/package/${pkg.name}`);
    t.true(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("npm", pkg);

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test("check for updates with no package name set", async (t) => {
    const u = updater();

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", {
            version: "1.0.0",
        });
    }, "Invalid package.json.");
});

test("check for updates with no package version set", async (t) => {
    const u = updater();

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", {
            name: "alfred-my-workflow",
        });
    }, "Invalid package.json.");
});

test.serial("check for updates with unpublished package", async (t) => {
    const u = updater();

    const pkg = readPkg.sync();

    // Mock request
    const request = mock.npm(1, pkg, 404);

    const update = await u.checkUpdates("npm");

    t.is(typeof update, "undefined");
    t.true(request.isDone());
});

test.serial("check for updates with unpublished package from custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock request
    const request = mock.npm(1, pkg, 404);

    const update = await u.checkUpdates("npm", pkg);

    t.is(typeof update, "undefined");
    t.true(request.isDone());
});

test.serial("check for updates with package without latest dist-tag", async (t) => {
    const u = updater();

    const pkg = readPkg.sync();

    // Mock request
    const request = nock("https://registry.npmjs.org")
        .get("/" + pkg.name)
        .once()
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
    }, "No latest version found in response.");

    t.true(request.isDone());
});

test.serial("check for updates with package without latest dist-tag from custom package.json", async (t) => {
    const u = updater();

    const pkg = {
        name: "alfred-my-workflow",
        version: "1.0.0",
    };

    // Mock request
    const request = mock.npm(1, pkg, 200, null);

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm", pkg);
    }, "No latest version found in response.");

    t.true(request.isDone());
});

test.serial("check for updates when invalid version is returned", async (t) => {
    const u = updater();

    const pkg = readPkg.sync();

    // Mock request
    const request = mock.npm(1, pkg, 200, "foobar");

    await t.throwsAsync(async () => {
        return u.checkUpdates("npm");
    }, "Invalid version in response.");

    t.true(request.isDone());
});

test.afterEach.always(() => {
    mock.cleanAll();
});
