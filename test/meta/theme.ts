import test from "ava";
import fs from "fs-extra";
import path from "path";

import { hugo } from "../helpers/init";

test("existing theme", (t) => {
    const h = hugo();

    process.env.alfred_theme = "default";

    const themeFilePath = path.resolve(process.env.HOME, "Library", "Application Support", "Alfred 3",
        "Alfred.alfredpreferences", "themes", process.env.alfred_theme, "theme.json");

    fs.ensureFileSync(themeFilePath);
    fs.writeJsonSync(themeFilePath, {
        foo: "bar",
    });

    t.is(typeof h.alfredTheme, "object");
    t.deepEqual(h.alfredTheme, {
        foo: "bar",
    });
});

test("non-existing theme", (t) => {
    const h = hugo();

    // Valid theme name but directory doesn't exist.
    process.env.alfred_theme = "default";

    t.is(typeof h.alfredTheme, "object");
    t.deepEqual(h.alfredTheme, {});
});
