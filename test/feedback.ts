import test from "ava";
import sinon from "sinon";

import { hugo } from "./helpers/init";
import * as mock from "./helpers/mock";

const backupConsoleLog = console.log;
const backupConsoleError = console.error;

test.beforeEach(() => {
    mock.date();
});

test.serial("feedback without checking for updates", async (t) => {
    const consoleStub = sinon.stub(console, "log");

    const h = hugo({
        checkUpdates: false,
    });

    h.rerun = 3.2;
    h.items.push({
        title: "foo",
    });
    h.variables.foo = "bar";

    await h.feedback();

    // Check output
    t.true(consoleStub.calledOnce);
    t.snapshot(consoleStub.getCall(0).args[0]);

    // Check if state has been reset
    t.is(h.items.length, 0);
    t.deepEqual(h.variables, {});
    t.falsy(h.rerun);
});

test.serial("check for updates on feedback", async (t) => {
    const consoleStub = sinon.stub(console, "log");

    const h = hugo({
        updateSource: "packal",
        updateNotification: false,
    });

    const request = mock.packal(1);

    // Check feedback
    await h.feedback();

    // Check request
    t.true(request.isDone());

    // Feedback again, should not trigger updates
    await h.feedback();

    t.true(consoleStub.calledTwice);
    t.is(consoleStub.getCall(0).args[0], consoleStub.getCall(1).args[0]);
    t.snapshot(consoleStub.getCall(0).args[0]);
});

test.afterEach.always(() => {
    console.log = backupConsoleLog;
    console.error = backupConsoleError;
});

test.after.always(() => {
    mock.cleanAll();
});
