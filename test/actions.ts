import test from "ava";
import { hugo } from "./helpers/init";

test("actions defined but no matching action", (t) => {
    process.argv = [
        "node",
        "index.js",
        "foo",
    ];

    const h = hugo();

    h.action("bar", (query) => {
        t.log(query);
        t.fail();
    });

    h.action("soap", (query) => {
        t.log(query);
        t.fail();
    });

    t.is(h.input, "foo");
});

test("actions defined but no action given", (t) => {
    process.argv = [
        "node",
        "index.js",
    ];

    const h = hugo();

    h.action("bar", (query) => {
        t.log(query);
        t.fail();
    });

    h.action("soap", (query) => {
        t.log(query);
        t.fail();
    });

    t.is(h.input, "");
});

test("actions defined and matching action with no query", (t) => {
    process.argv = [
        "node",
        "index.js",
        "foo",
    ];

    const h = hugo();

    h.action("bar", (query) => {
        t.log(query);
        t.fail();
    });

    h.action("foo", (query) => {
        t.is(query, "");
        t.pass();
    });
});

test("actions defined and matching action with query", (t) => {
    process.argv = [
        "node",
        "index.js",
        "foo",
        "bar",
    ];

    const h = hugo();

    h.action("bar", (query) => {
        t.log(query);
        t.fail();
    });

    h.action("foo", (query) => {
        t.is(query, "bar");
        t.pass();
    });
});
