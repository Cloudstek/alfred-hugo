import test from "ava";
import sinon from "sinon";

import { UpdateSource } from "../../src";

import { hugo, updater } from "../helpers/init";
import * as mock from "../helpers/mock";

const backupConsoleError = console.error;

test.beforeEach(() => {
    mock.date();
});

test.serial("check with valid update source NPM", async (t) => {
    t.notThrows(() => {
        hugo({
            updateSource: "npm",
        });
    });

    t.notThrows(() => {
        hugo({
            updateSource: "NPM",
        });
    });

    t.notThrows(() => {
        hugo({
            updateSource: UpdateSource.NPM,
        });
    });

    // Mock requests
    mock.npm(2);

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("npm");
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("NPM");
    });
});

test.serial("check with valid update source Packal", async (t) => {
    t.notThrows(() => {
        hugo({
            updateSource: "packal",
        });
    });

    t.notThrows(() => {
        hugo({
            updateSource: "Packal",
        });
    });

    t.notThrows(() => {
        hugo({
            updateSource: UpdateSource.Packal,
        });
    });

    mock.packal(2);

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("packal");
    });

    await t.notThrowsAsync(async () => {
        return updater().checkUpdates("Packal");
    });
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

test("check update notification item", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    const request = mock.packal();

    // Check for updates
    await h.checkUpdates();
    t.true(request.isDone());

    // Check output buffer
    t.true(Array.isArray(h.output.items));
    t.is(h.output.items.length, 1);

    // Check update item
    const item = h.output.items.pop();

    t.snapshot(item);
});

test.serial("check for unpublished workflow twice within interval", async (t) => {
    const u = updater();

    // Mock request
    const request = mock.packal(1, 404);

    // Check for update
    let update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
    t.true(request.isDone());

    // Check for update the second time shortly after. No request should be made.
    update = await u.checkUpdates("packal");

    t.is(typeof update, "undefined");
});

test("check for updates with updates disabled", async (t) => {
    const h = hugo({
        checkUpdates: false,
    });

    const update = await h.checkUpdates();

    t.falsy(update);
});

test("check for updates with update notification and item disabled", async (t) => {
    const h = hugo({
        updateNotification: false,
        updateItem: false,
    });

    const update = await h.checkUpdates();

    t.falsy(update);
});

test.serial("check for updates with invalid workflow version", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    process.env.alfred_workflow_version = "foobar";

    const request = mock.packal();

    const update = await h.checkUpdates();

    t.falsy(update);
    t.true(request.isDone());
});

test.serial("check for updates with updates with unpublished package", async (t) => {
    const h = hugo({
        updateSource: "packal",
    });

    // Mock request
    const request = mock.packal(1, 404);

    const update = await h.checkUpdates();

    t.falsy(update);
    t.true(request.isDone());
});

test.serial("check for updates with updates when exception occurs", async (t) => {
    const consoleStub = sinon.stub(console, "error");

    const h = hugo({
        updateSource: "packal",
    });

    // Mock request
    const request = mock.packal(2, 500);

    let update = await h.checkUpdates();

    t.falsy(update);
    t.is(request.pendingMocks().length, 1);
    t.false(consoleStub.called);

    // Clear cache
    h.cache.clear();

    // Check if debug message is output
    process.env.alfred_debug = "1";

    update = await h.checkUpdates();

    t.falsy(update);
    t.true(request.isDone());
    t.true(consoleStub.calledWith("Request failed with status code 500"));
});

test.afterEach.always(() => {
    console.error = backupConsoleError;

    mock.cleanDate();
});

test.after.always(() => {
    mock.cleanAll();
});
