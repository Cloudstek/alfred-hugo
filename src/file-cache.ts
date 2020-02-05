import { Cache } from '@cloudstek/cache';
import { ICacheOptions } from '@cloudstek/cache';
import Crypto from 'crypto';
import { EventEmitter } from 'events';
import fs from 'fs-extra';

import utils from './utils';
import { FileCacheEventEmitter } from './types';

/**
 * File cache.
 *
 * This allows you to read and process the data once, then storing it in cache until the file has changed again.
 */
export class FileCache extends (EventEmitter as new() => FileCacheEventEmitter) {
    private filePath: string;
    private cache: Cache;

    /**
     * FileCache constructor
     *
     * @param filePath File to process and check for changes
     * @param options Cache options
     *
     * @constructor
     */
    constructor(filePath: string, options: ICacheOptions) {
        super();

        this.filePath = filePath;

        // Initialize cache store for this file
        options.name = Crypto.createHash('sha1').update(filePath).digest('hex') + '.json';
        options.ttl = options.ttl || false;

        this.cache = new Cache(options);
    }

    /**
     * Get (cached) contents.
     *
     * Emits the "change" event with the cache instance, file and hash of that file when the file has been changed
     * or expired from the cache.
     */
    public get(): any {
        if (utils.fileExists(this.filePath) === false) {
            return null;
        }

        // Get file fstat
        const stat = fs.statSync(this.filePath);

        if (this.cache.has('mtime') === false || this.cache.get('mtime') !== stat.mtimeMs) {
            this.emit('change', this.cache, fs.readFileSync(this.filePath, 'utf8'));

            this.cache.set('mtime', stat.mtimeMs);
            this.cache.commit();

            return this.cache.all();
        }

        return this.cache.all();
    }
}
