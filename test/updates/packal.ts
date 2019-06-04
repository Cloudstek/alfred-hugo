import test from "ava";

import { updater, hugo } from "../helpers/init";
import * as mock from "../helpers/mock";

test.beforeEach(() => {
    mock.date();
});

test("check for updates uncached", async (t) => {
    const u = updater();

    const request = mock.packal();

    const update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test("check for updates cached", async (t) => {
    const u = updater();

    const request = mock.packal(2);

    let update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);
    t.is(request.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
    t.true(request.isDone());
});

test.serial("check for updates with no bundle id set", async (t) => {
    const u = updater();

    await t.throwsAsync(async () => {
        process.env.alfred_workflow_bundleid = undefined;
        delete process.env.alfred_workflow_bundleid;

        return u.checkUpdates("packal");
    }, "No bundle ID, not checking Packal for updates.");
});

test.serial("check for updates when no version is returned", async (t) => {
    const u = updater();

    const request = mock.packal(1, 200, "appcast-noversion.xml");

    await t.throwsAsync(async () => {
        return u.checkUpdates("packal");
    }, "No version found.");

    t.true(request.isDone());
});

test.serial("check for updates when invalid version is returned", async (t) => {
    const u = updater();

    const request = mock.packal(1, 200, "appcast-invalidversion.xml");

    await t.throwsAsync(async () => {
        return u.checkUpdates("packal");
    }, "Invalid version in response.");

    t.true(request.isDone());
});

test.serial("check for updates with unpublished workflow", async (t) => {
    const u = updater();

    // Mock request
    const request = mock.packal(1, 404);

    const update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
    t.true(request.isDone());
});

test.afterEach.always(() => {
    mock.cleanDate();
});

test.after.always(() => {
    mock.cleanAll();
});
