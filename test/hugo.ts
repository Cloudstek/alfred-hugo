import test from "ava";
import moment from "moment";
import fs from "fs-extra";
import path from "path";

import * as utils from "../src/utils";

import { hugo } from "./helpers/init";

import { UpdateSource, Hugo } from "../src";

test("initialize with options through constructor", (t) => {
    const hugoDefaults = (new Hugo() as any).options;

    const h = hugo({
        checkUpdates: false,
        updateInterval: moment.duration(2, "hours"),
        updateItem: false,
        updateNotification: false,
        updateSource: UpdateSource.Packal,
    });

    t.notDeepEqual((h as any).options, hugoDefaults);
    t.deepEqual((h as any).options, {
        checkUpdates: false,
        updateInterval: moment.duration(2, "hours"),
        updateItem: false,
        updateNotification: false,
        updateSource: UpdateSource.Packal,
    });
});

test("initialize with update interval as number", (t) => {
    const hugoDefaults = (new Hugo() as any).options;

    const h = hugo({
        updateInterval: 4010,
    });

    t.deepEqual((h as any).options, Object.assign({}, hugoDefaults, {
        updateInterval: moment.duration(4010, "seconds"),
    }));
});

test("initialize with invalid update interval as number", (t) => {
    const h = hugo({
        updateInterval: -100,
    });

    t.falsy((h as any).options.updateInterval);
    t.false((h as any).options.checkUpdates);
});

test("initialize with update interval as duration", (t) => {
    const hugoDefaults = (new Hugo() as any).options;

    const h = hugo({
        updateInterval: moment.duration(3, "hours"),
    });

    t.deepEqual((h as any).options, Object.assign({}, hugoDefaults, {
        updateInterval: moment.duration(3, "hours"),
    }));
});

test("initialize with invalid update interval as duration", (t) => {
    const h = hugo({
        updateInterval: moment.duration(-10, "seconds"),
    });

    t.falsy((h as any).options.updateInterval);
    t.false((h as any).options.checkUpdates);
});

test("test reset", (t) => {
    const h = hugo();

    // Add item
    h.items.push({
        title: "foo",
    });

    // Add variable
    h.variables.foo = "bar";

    // Set rerun
    h.rerun = 3.1;

    t.is(h.items.length, 1);
    t.is(h.variables.foo, "bar");
    t.is(h.rerun, 3.1);

    h.reset();

    t.is(h.items.length, 0);
    t.deepEqual(h.variables, {});
    t.falsy(h.rerun);
});

test("input without action", (t) => {
    process.argv = [
        "node",
        "index.js",
        "foobar",
    ];

    const h = hugo();

    t.is(h.input, "foobar");
});

test("input with action", (t) => {
    process.argv = [
        "node",
        "index.js",
        "myaction",
        "foobar",
    ];

    const h = hugo();

    t.is(h.input, "foobar");
});

test("input with no input", (t) => {
    process.argv = [
        "node",
        "index.js",
    ];

    const h = hugo();

    t.is(h.input, "");
});

test("notify", async (t) => {
    const h = hugo();

    await t.notThrowsAsync(async () => {
        return h.notify({
            title: "Foo",
            message: "Bar",
            timeout: 1,
        });
    });
});

test("notify with missing options", async (t) => {
    const h = hugo();

    await t.throwsAsync(async () => {
        return h.notify({
            title: "Foo",
        });
    });
});

test("clear cache dir", async (t) => {
    const h = hugo();

    fs.writeJsonSync(path.join(h.workflowMeta.cache, "foo.json"), {
        foo: "bar",
    });

    fs.writeFileSync(path.join(h.workflowMeta.cache, "bar"), "foo");

    t.true(utils.fileExists(path.join(h.workflowMeta.cache, "foo.json")));
    t.true(utils.fileExists(path.join(h.workflowMeta.cache, "bar")));

    await h.clearCache();

    t.false(utils.fileExists(path.join(h.workflowMeta.cache, "foo.json")));
    t.false(utils.fileExists(path.join(h.workflowMeta.cache, "bar")));
    t.true(utils.fileExists(h.workflowMeta.cache));
});

test("clear cache dir sync", (t) => {
    const h = hugo();

    fs.writeJsonSync(path.join(h.workflowMeta.cache, "foo.json"), {
        foo: "bar",
    });

    fs.writeFileSync(path.join(h.workflowMeta.cache, "bar"), "foo");

    t.true(utils.fileExists(path.join(h.workflowMeta.cache, "foo.json")));
    t.true(utils.fileExists(path.join(h.workflowMeta.cache, "bar")));

    h.clearCacheSync();

    t.false(utils.fileExists(path.join(h.workflowMeta.cache, "foo.json")));
    t.false(utils.fileExists(path.join(h.workflowMeta.cache, "bar")));
    t.true(utils.fileExists(h.workflowMeta.cache));
});

test.serial("clear cache dir without cache dir set", async (t) => {
    const h = hugo();

    delete process.env.alfred_workflow_cache;

    t.falsy(h.workflowMeta.cache);

    await t.notThrowsAsync(async () => {
        return h.clearCache();
    });
});

test.serial("clear cache dir sync without cache dir set", async (t) => {
    const h = hugo();

    delete process.env.alfred_workflow_cache;

    t.falsy(h.workflowMeta.cache);

    t.notThrows(() => {
        h.clearCacheSync();
    });
});
