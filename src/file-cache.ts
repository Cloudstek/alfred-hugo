import { Cache } from "@cloudstek/cache";
import { ICacheOptions } from "@cloudstek/cache";
import Crypto from "crypto";
import { EventEmitter } from "events";
import fs from "fs-extra";

import * as utils from "./utils";

/**
 * File cache.
 *
 * This allows you to read and process the data once, then storing it in cache until the file has changed again.
 */
export class FileCache extends EventEmitter {
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
        options.name = Crypto.createHash("sha1").update(filePath).digest("hex") + ".json";
        this.cache = new Cache(options);
    }

    /**
     * Get (cached) contents.
     */
    public get() {
        if (utils.fileExists(this.filePath) === false) {
            return null;
        }

        // Read file
        const file = fs.readFileSync(this.filePath, "utf8");

        // Calculate file hash
        const hash = Crypto.createHash("sha1").update(file, "utf8").digest("hex");

        if (this.cache.has("hash") === false || this.cache.get("hash") !== hash) {
            this.emit("change", this.cache, file, hash);

            this.cache.set("hash", hash);
            this.cache.commit();

            return this.cache.all();
        }

        return this.cache.all();
    }
}
