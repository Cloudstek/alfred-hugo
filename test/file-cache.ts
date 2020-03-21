import fs from 'fs-extra';
import path from 'path';
import test from 'ava';

import { hugo } from './helpers/init';
import * as mock from './helpers/mock';

test.serial('process file and cache it', (t) => {
    const h = hugo();
    const tmpFile = mock.file();

    // Create file
    fs.writeFileSync(tmpFile, 'Hello world!');

    // Get FileCache instance
    const cachedFile = h.cacheFile(tmpFile);

    // Listen to change event to process data
    cachedFile.once('change', (cache, file) => {
        t.is(cache.constructor.name, 'Cache');
        t.is('Hello world!', file);

        cache.set('hello', 'world!');
    });

    // Fetch data
    let data = cachedFile.get();

    // Verify data
    t.is(typeof data, 'object');
    t.is(data.hello, 'world!');

    // Listen to change event (which should not be emitted now)
    cachedFile.once('change', () => {
        t.fail('Data has not been cached.');
    });

    // Fetch data again and verify it
    t.deepEqual(cachedFile.get(), data);

    cachedFile.removeAllListeners();

    // Listen to change event to process data
    cachedFile.once('change', (cache, file) => {
        t.is(cache.constructor.name, 'Cache');
        t.is('Foobar', file);

        cache.set('foo', 'bar');
    });

    // Change file to trigger change on next get
    fs.writeFileSync(tmpFile, 'Foobar');

    // Fetch data
    data = cachedFile.get();

    // Verify data
    t.is(typeof data, 'object');
    t.is(data.foo, 'bar');
});

test.serial('process non-existing file', (t) => {
    const h = hugo();

    // Get FileCache instance
    const cachedFile = h.cacheFile(path.resolve(__dirname, 'idontexist.txt'));

    // Listen to change event to process data
    cachedFile.on('change', () => {
        t.fail('File does not exist and this should not be called.');
    });

    // Fetch data
    const data = cachedFile.get();

    // Verify data
    t.falsy(data);
});
