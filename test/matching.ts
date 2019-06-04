import Test, { TestInterface } from "ava";

import { hugo } from "./helpers/init";
import { TestContext } from "./helpers/types";

const test = Test as TestInterface<TestContext>;

test.beforeEach((t) => {
    t.context.items = [
        {
            title: "Foo",
            subtitle: "foo bar",
        },
        {
            title: "Bar",
            subtitle: "foo bar bleep",
        },
        {
            title: "Eep",
            subtitle: "eep foo blep",
        },
        {
            title: "Foo bar",
            subtitle: "ploop",
        },
        {
            title: "Abra",
            subtitle: "cadabra",
        },
    ];
});

test("exact match", (t) => {
    const h = hugo();

    const matches = h.search(t.context.items, "foo bar bleep", {
        keys: ["subtitle"],
        threshold: 0,
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 1);
    t.deepEqual(matches[0], t.context.items[1]);
});

test("exact match multiple keys", (t) => {
    const h = hugo();

    const matches = h.search(t.context.items, "foo", {
        keys: ["title", "subtitle"],
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 4);
    t.snapshot(matches);
});

test("no matches", (t) => {
    const h = hugo();

    const matches = h.search(t.context.items, "nope", {
        threshold: 0,
    });

    t.true(Array.isArray(matches));
    t.is(matches.length, 0);
});

test("no query should return all items", (t) => {
    const h = hugo();

    const matches = h.search(t.context.items, "");

    t.true(Array.isArray(matches));
    t.is(matches.length, 5);
    t.snapshot(matches);
});
