import fs from "fs-extra";
import path from "path";
import test from "ava";

import { hugo } from "./helpers/init";
import * as mock from "./helpers/mock";

test.serial("process file and cache it", (t) => {
    const h = hugo();
    const tmpFile = mock.file();

    // Create file
    fs.writeFileSync(tmpFile, "Hello world!");

    // Get FileCache instance
    const cachedFile = h.cacheFile(tmpFile);

    // Listen to change event to process data
    cachedFile.once("change", (cache, file, hash) => {
        t.is(cache.constructor.name, "Cache");
        t.is(typeof file, "string");
        t.true(file.length > 0);
        t.is(typeof hash, "string");
        t.true(hash.length > 0);

        cache.set("hello", "world!");
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.is(typeof data, "object");
    t.is(data.hello, "world!");
    t.true(data.hash.length > 0);

    // Listen to change event (which should not be emitted now)
    cachedFile.once("change", () => {
        t.fail("Data has not been cached.");
    });

    // Fetch data again and verify it
    t.deepEqual(cachedFile.get(), data);

    cachedFile.removeAllListeners();

    // Listen to change event to process data
    cachedFile.once("change", (cache, file, hash) => {
        t.is(cache.constructor.name, "Cache");
        t.is(typeof file, "string");
        t.true(file.length > 0);
        t.is(typeof hash, "string");
        t.true(hash.length > 0);

        cache.set("foo", "bar");
    });

    // Change file to trigger change on next get
    fs.writeFileSync(tmpFile, "Foobar");

    // Fetch data
    data = cachedFile.get();

    // Verify data
    t.is(typeof data, "object");
    t.is(data.foo, "bar");
    t.true(data.hash.length > 0);
});

test.serial("process non-existing file", (t) => {
    const h = hugo();

    // Get FileCache instance
    const cachedFile = h.cacheFile(path.resolve(__dirname, "idontexist.txt"));

    // Listen to change event to process data
    cachedFile.on("change", () => {
        t.fail("File does not exist and this should not be called.");
    });

    // Fetch data
    const data = cachedFile.get();

    // Verify data
    t.falsy(data);
});
