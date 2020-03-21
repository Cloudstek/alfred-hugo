import test from 'ava';
import fs from 'fs-extra';
import path from 'path';

import { hugo } from '../helpers/init';

test.serial('existing theme', (t) => {
    const h = hugo();

    process.env.alfred_theme = 'foo';

    const themeFilePath = path.resolve(process.env.alfred_preferences, 'themes', process.env.alfred_theme, 'theme.json');

    fs.ensureFileSync(themeFilePath);
    fs.writeJsonSync(themeFilePath, {
        alfredtheme: {
            foo: 'bar',
        },
    });

    t.is(typeof h.alfredTheme, 'object');
    t.deepEqual(h.alfredTheme, {
        foo: 'bar',
    });
});

test.serial('non-existing theme', (t) => {
    const h = hugo();

    // Valid theme name but directory doesn't exist.
    process.env.alfred_theme = 'foo';

    t.is(h.alfredTheme, null);
});
