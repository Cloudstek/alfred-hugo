import test from "ava";
import nock from "nock";

import { UpdateSource } from "../../src";

import { updater, hugo } from "../helpers/init";
import * as mock from "../helpers/mock";

test.beforeEach(() => {
    mock.date();
});

test.serial("check with valid update source Packal", async (t) => {
    // Mock requests
    mock.packal(5);

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: "packal",
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: "Packal",
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        const h = hugo({
            updateSource: UpdateSource.Packal,
            updateNotification: false,
        });

        return h.checkUpdates();
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("packal");
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("Packal");
    });
});

test.serial("check for updates uncached", async (t) => {
    const u = updater();

    // Mock request
    mock.packal(1);

    const update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);
});

test.serial("check for updates cached", async (t) => {
    const u = updater();

    mock.packal(2);

    let update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.is(update.version, "2.0.0");
    t.regex(update.url, /^https:\/\/encrypted\.google\.com\//);
    t.regex(update.url, /my\.work\.flow/);
    t.true(update.checkedOnline);
    t.is(nock.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be cached.
    update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.false(update.checkedOnline);
    t.is(nock.pendingMocks().length, 1);

    // Forward time
    mock.forwardTime(30, "minutes");

    // Check for updates again, should be checked online
    update = await u.checkUpdates("packal");

    if (!update) {
        t.fail("Update is undefined or false.");
        return;
    }

    t.true(update.checkedOnline);
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

    mock.packal(1, 200, "appcast-noversion.xml");

    await t.throwsAsync(async () => {
        return u.checkUpdates("packal");
    }, "No version found.");
});

test.serial("check for updates when invalid version is returned", async (t) => {
    const u = updater();

    mock.packal(1, 200, "appcast-invalidversion.xml");

    await t.throwsAsync(async () => {
        return u.checkUpdates("packal");
    }, "Invalid version in response.");
});

test.serial("check for updates with unpublished workflow", async (t) => {
    const u = updater();

    // Mock request
    mock.packal(1, 404);

    const update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
});

test.afterEach((t) => {
    if (!nock.isDone()) {
        t.fail("Not all requests were performed.");
    }
});

test.afterEach.always(() => {
    mock.cleanAll();
});
