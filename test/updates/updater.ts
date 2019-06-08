import test from "ava";
import sinon from "sinon";
import moment from "moment";
import nock from "nock";

import { hugo, updater } from "../helpers/init";
import * as mock from "../helpers/mock";

const backupConsoleError = console.error;

test.beforeEach(() => {
    mock.date();
});

test("check with invalid update source as string", async (t) => {
    t.throws(() => {
        hugo({
            updateSource: "foobar",
        });
    }, "Invalid update source.");

    await t.throwsAsync(async () => {
        return updater().checkUpdates("foobar");
    }, "Invalid update source.");
});

test.serial("check update with no new updates", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    // Ensure that no new version exists
    process.env.alfred_workflow_version = "3.0.0";

    // Mock request
    mock.packal(1);

    // Check for updates
    await h.checkUpdates();
    t.true(nock.isDone());

    // Check output buffer
    t.is(h.output.items.length, 0);
});

test.serial("update notification only when checked online", async (t) => {
    const h = hugo({
        updateSource: "packal",
        updateItem: false,
    });

    const notifyStub = sinon.stub(h, "notify");

    // Mock request
    mock.packal(1);

    // Check for updates
    await h.checkUpdates();
    t.true(nock.isDone());

    // Check for updates again (should be cached)
    await h.checkUpdates();

    // Notify should only be called once
    t.true(notifyStub.calledOnce);

    // Make sure update item was not added
    t.is(h.items.length, 0);
});

test.serial("update item only", async (t) => {
    const h = hugo({
        updateSource: "packal",
        updateNotification: false,
    });

    const notifyStub = sinon.stub(h, "notify");

    // Mock request
    mock.packal(1);

    // Check for updates
    await h.checkUpdates();
    t.true(nock.isDone());

    // Check for updates again (should be cached)
    await h.checkUpdates();

    // Notify should only be called once
    t.false(notifyStub.calledOnce);

    // Make sure update item was added
    t.is(h.items.length, 1);

    // Check update item
    const item = h.output.items.pop();

    t.snapshot(item);
});

test.serial("check update item", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    // Mock request
    mock.packal(1);

    // Check for updates
    await h.checkUpdates();
    t.true(nock.isDone());

    // Check output buffer
    t.is(h.output.items.length, 1);

    // Check update item
    const item = h.output.items.pop();

    t.snapshot(item);
});

test.serial("check for unpublished workflow twice within interval", async (t) => {
    const u = updater();

    // Mock request
    mock.packal(1, 404);

    // Check for update
    let update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
    t.true(nock.isDone());

    // Check for update the second time shortly after. No request should be made.
    update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
});

test.serial("check for updates with updates disabled", async (t) => {
    const h = hugo({
        checkUpdates: false,
        updateSource: "npm",
    });

    // Mock request
    mock.npm(1);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.false(nock.isDone());

    nock.cleanAll();
});

test.serial("check for updates with update notification and item disabled", async (t) => {
    const h = hugo({
        updateNotification: false,
        updateItem: false,
        updateSource: "npm",
    });

    // Mock request
    mock.npm(1);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.false(nock.isDone());

    nock.cleanAll();
});

test.serial("check for updates with updateInterval undefined", async (t) => {
    const h = hugo({
        updateInterval: undefined,
        updateSource: "npm",
    });

    // Mock request
    mock.npm(1);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.false(nock.isDone());

    nock.cleanAll();
});

test.serial("check for updates with updateInterval under one second", async (t) => {
    const h = hugo({
        updateInterval: moment.duration(1, "milliseconds"),
        updateSource: "npm",
    });

    // Mock request
    mock.npm(1);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.false(nock.isDone());

    nock.cleanAll();
});

test.serial("check for updates with invalid workflow version", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    process.env.alfred_workflow_version = "foobar";

    // Mock request
    mock.packal(1);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.true(nock.isDone());
});

test.serial("check for updates with updates with unpublished package", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    // Mock request
    mock.packal(1, 404);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.true(nock.isDone());
});

test.serial("check for updates with updates when exception occurs", async (t) => {
    const consoleStub = sinon.stub(console, "error");

    const h = hugo({
        updateSource: "packal",
    });

    // Mock request
    mock.packal(2, 500);

    let update = await h.checkUpdates();

    t.falsy(update);
    t.is(nock.pendingMocks().length, 1);
    t.false(consoleStub.called);

    // Clear cache
    h.cache.clear();

    // Check if debug message is output
    process.env.alfred_debug = "1";

    update = await h.checkUpdates();

    t.falsy(update);
    t.true(nock.isDone());
    t.true(consoleStub.calledWith("Request failed with status code 500"));
});

test.afterEach((t) => {
    if (!nock.isDone()) {
        t.fail("Not all requests were performed.");
    }
});

test.afterEach.always(() => {
    console.error = backupConsoleError;

    mock.cleanAll();
});
