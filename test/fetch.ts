import Test, { TestInterface } from "ava";
import nock from "nock";

import { hugo } from "./helpers/init";
import { TestContext } from "./helpers/types";
import * as mock from "./helpers/mock";

const test = Test as TestInterface<TestContext>;

test.beforeEach((t) => {
    t.context.url = "http://foo.bar";

    // Mock requests
    nock(t.context.url)
        .get("/")
        .once()
        .reply(200, {message: "hello" });

    nock(t.context.url)
        .get("/")
        .once()
        .reply(200, {message: "world"});

    mock.date();
});

test.serial("fetch uncached", async (t) => {
    const h = hugo();

    // Fetch with caching implicitely disabled
    t.deepEqual(await h.fetch(t.context.url), { message: "hello" });
    t.false(h.cache.has(t.context.url));

    // Fetch with caching explicitely disabled
    t.deepEqual(await h.fetch(t.context.url, null, false), { message: "world" });
    t.false(h.cache.has(t.context.url));
});

test.serial("fetch cached", async (t) => {
    const h = hugo();

    // Fetch cached with empty cache
    t.false(h.cache.has(t.context.url));
    t.deepEqual(await h.fetch(t.context.url, null, 300), { message: "hello" });
    t.deepEqual(h.cache.get(t.context.url), { message: "hello" });

    // Fetch cached with warm cache and assert we have the right output.
    // Nock is set to only return 'hello' once. So if the request is not cached, it would return 'world'.
    t.deepEqual(await h.fetch(t.context.url, null, 300), { message: "hello" });
    t.deepEqual(h.cache.get(t.context.url), { message: "hello" });

    // Let the cache expire
    mock.forwardTime(1, "hour");

    // Assert cache is expired
    t.false(h.cache.has(t.context.url));

    // Fetch cached with empty cache one more time and assert that the request is done.
    // Nock is set to only return 'hello' once, which we received before. This time it should return 'world' to complete
    // our sentence. If not, this would indicate the request is still cached somehow.
    t.deepEqual(await h.fetch(t.context.url, null, 300), { message: "world" });
    t.deepEqual(h.cache.get(t.context.url), { message: "world" });

    // Fetch cached with a warm cache again.
    t.deepEqual(await h.fetch(t.context.url, null, 300), { message: "world" });
    t.deepEqual(h.cache.get(t.context.url), { message: "world" });
});

test.afterEach.always(() => {
    mock.cleanAll();
});
