import fs from 'fs-extra';
import crypto from 'crypto';
import Fuse from 'fuse.js';
import Axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import path from 'path';
import semver from 'semver';
import NotificationCenter from 'node-notifier/notifiers/notificationcenter';
import { Cache, ICacheOptions } from '@cloudstek/cache';

import { Action } from './action';
import { FileCache } from './file-cache';
import { Updater } from './updater';
import utils from './utils';
import { AlfredMeta, FilterResults, HugoOptions, WorkflowMeta, UpdateSource, Item } from './types';

export class Hugo {
    public cache: Cache;
    public config: Cache;
    public rerun: number;
    public variables: { [key: string]: any } = {};
    public items: Item[] = [];

    private readonly actions: Action[];
    private readonly fuseDefaults: Fuse.FuseOptions<Item>;
    private options: HugoOptions;
    private readonly updater: Updater;
    private readonly notifier: NotificationCenter;

    public constructor(options?: HugoOptions) {
        // Save options
        this.options = {
            checkUpdates: true,
            updateInterval: moment.duration(1, 'day'),
            updateItem: true,
            updateNotification: true,
            updateSource: UpdateSource.NPM,
        };

        this.configure(options || {});

        // Set defaults for FuseJS
        this.fuseDefaults = {
            keys: ['match'],
            threshold: 0.4,
        };

        // Configure config store
        this.config = new Cache({
            dir: this.workflowMeta.data,
            name: 'config.json',
            ttl: false,
        });

        // Configure cache store
        this.cache = new Cache({
            dir: this.workflowMeta.cache,
        });

        // Initialize updater
        this.updater = new Updater(this.cache, this.options.updateInterval);

        // Notifier
        this.notifier = new NotificationCenter({
            withFallback: true,
        });

        // Actions
        this.actions = [];
    }

    /**
     * Set Hugo options
     *
     * @param options Options to set
     *
     * @return Hugo
     */
    public configure(options: HugoOptions): Hugo {
        // Update options
        options = Object.assign({}, this.options, options);

        // Convert updateInterval to moment.Duration object
        if (options.updateInterval) {
            if (!moment.isDuration(options.updateInterval)) {
                options.updateInterval = moment.duration(options.updateInterval, 'seconds');
            }
        }

        if (!options.updateInterval || (options.updateInterval as moment.Duration).asSeconds() < 1) {
            options.checkUpdates = false;
            delete options.updateInterval;
        }

        if (typeof options.updateSource !== 'string' || !UpdateSource[options.updateSource.toLowerCase() as any]) {
            throw new Error('Invalid update source.');
        }

        this.options = options;

        return this;
    }

    /**
     * Alfred metadata
     *
     * @return AlfredMeta
     */
    public get alfredMeta(): AlfredMeta {
        let version = semver.valid(semver.coerce(process.env.alfred_version));

        // Check if version is valid
        if (version === null) {
            if (process.env.alfred_debug === '1') {
                console.error(`Invalid Alfred version: ${process.env.alfred_version}`);
            }

            version = undefined;
        }

        // Gather environment information
        const data: AlfredMeta = {
            debug: process.env.alfred_debug === '1',
            preferences: process.env.alfred_preferences || utils.resolveAlfredPrefs(version),
            preferencesLocalHash: process.env.alfred_preferences_localhash,
            theme: process.env.alfred_theme,
            themeBackground: process.env.alfred_theme_background,
            themeSelectionBackground: process.env.alfred_theme_selection_background,
            themeSubtext: parseFloat(process.env.alfred_theme_subtext || '0'),
            version,
        };

        // Find and load curent Alfred theme file
        if (process.env.HOME && data.theme) {
            const themeFile = path.resolve(data.preferences, 'themes', data.theme, 'theme.json');

            try {
                fs.statSync(themeFile);
                data.themeFile = themeFile;
            } catch (e) {
                if (process.env.alfred_debug === '1') {
                    console.error(`Could not find theme file "${themeFile}"`);
                }
            }
        }

        return data;
    }

    /**
     * Alfred theme
     *
     * @return any | null
     */
    public get alfredTheme(): any | null {
        const themeFile = this.alfredMeta.themeFile;

        if (!themeFile || utils.fileExists(themeFile) === false) {
            return null;
        }

        const theme = fs.readJsonSync(themeFile);

        return theme.alfredtheme;
    }

    /**
     * Workflow metadata
     *
     * @return WorkflowMeta
     */
    public get workflowMeta(): WorkflowMeta {
        let version = semver.valid(semver.coerce(process.env.alfred_workflow_version));

        // Check if version is valid
        if (version === null) {
            if (process.env.alfred_debug === '1') {
                // eslint-disable-next-line max-len
                console.error(`Invalid workflow version: ${process.env.alfred_workflow_version}. Open your workflow in Alfred, click on the [x]-Symbol and set a semantic version number.`);
            }

            version = undefined;
        }

        return {
            bundleId: process.env.alfred_workflow_bundleid,
            cache: process.env.alfred_workflow_cache,
            data: process.env.alfred_workflow_data,
            icon: path.join(process.cwd(), 'icon.png'),
            name: process.env.alfred_workflow_name,
            uid: process.env.alfred_workflow_uid,
            version,
        };
    }

    /**
     * Reset Hugo.
     *
     * @return Hugo
     */
    public reset(): Hugo {
        this.rerun = undefined;
        this.variables = {};
        this.items = [];

        return this;
    }

    /**
     * Alfred user input
     *
     * @return string[]
     */
    public get input(): string[] {
        return process.argv.slice(2);
    }

    /**
     * Current output buffer
     *
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     *
     * @return FilterResults to be output and interpreted by Alfred
     */
    public get output(): FilterResults {
        if (this.rerun !== null && (this.rerun < 0.1 || this.rerun > 5.0)) {
            throw new Error('Invalid value for rerun, must be between 0.1 and 5.0');
        }

        return {
            rerun: this.rerun,
            items: this.items,
            variables: this.variables,
        };
    }

    /**
     * Run a callback when first script argument matches keyword. Callback wil have remaining arguments as argument.
     *
     * @example node index.js myaction "my query"
     *
     * @param name Action name and optionally aliases
     * @param callback Callback to execute when query matches action name
     *
     * @return Action
     */
    public action(
        name: string|string[],
        callback?: (args: string[]) => void,
    ): Action {
        const action = new Action(name, callback);

        this.actions.push(action);

        return action;
    }

    /**
     * Find defined action from arguments and run it.
     *
     * @param args
     *
     * @return Hugo
     */
    public run(args?: string[]): Hugo {
        if (!args) {
            args = process.argv.slice(2);
        }

        for (const action of this.actions) {
            if (action.run(args) === true) {
                break;
            }
        }

        return this;
    }

    /**
     * Cache processed file.
     *
     * This allows you to read and process the data once, then storing it in cache until the file has changed again.
     *
     * @param filePath File path
     * @param options Cache options
     *
     * @return FileCache
     */
    public cacheFile(filePath: string, options?: ICacheOptions): FileCache {
        return new FileCache(filePath, options || {
            dir: this.workflowMeta.cache,
        });
    }

    /**
     * Clear cache
     *
     * Clear the whole workflow cache directory.
     *
     * @return Promise<void>
     */
    public async clearCache(): Promise<void> {
        if (this.workflowMeta.cache) {
            return fs.emptyDir(this.workflowMeta.cache);
        }
    }

    /**
     * Clear cache
     *
     * Clear the whole workflow cache directory.
     */
    public clearCacheSync(): void {
        if (this.workflowMeta.cache) {
            fs.emptyDirSync(this.workflowMeta.cache);
        }
    }

    /**
     * Filter list of candidates with fuse.js
     *
     * @see http://fusejs.io
     *
     * @param {Array.<Object>} candidates Input data
     * @param {string} query Search string
     * @param {Object} options fuse.js options
     *
     * @return Item[]
     */
    public match(candidates: Item[], query: string, options?: Fuse.FuseOptions<Item>): Item[] {
        options = Object.assign({}, this.fuseDefaults, options || {});

        if (query.trim().length === 0) {
            return candidates;
        }

        // Set match attribute to title when missing to mimic Alfred matching behaviour
        for (const key of options.keys) {
            const name = typeof key === 'string' ? key : key.name;

            if (name === 'match') {
                candidates = candidates.map((candidate) => {
                    if (!candidate.match) {
                        candidate.match = candidate.title;
                    }

                    return candidate;
                });

                break;
            }
        }

        // Make sure to always return Item[]
        options.id = undefined;
        options.includeMatches = false;
        options.includeScore = false;

        // Create fuse.js fuzzy search object
        const fuse = new Fuse(candidates, options);

        // Return results
        return fuse.search(query) as Item[];
    }

    /**
     * Send a notification
     *
     * Notification title defaults to the Workflow name, or when not available to 'Alfred'.
     * You can adjust all the options that node-notifier supports. Please see their documentation for available options.
     *
     * @see https://github.com/mikaelbr/node-notifier
     *
     * @param notification Notification options
     *
     * @return Promise<string| void>
     */
    public async notify(notification: NotificationCenter.Notification): Promise<string | void> {
        return new Promise((resolve, reject) => {
            const defaults: NotificationCenter.Notification = {
                contentImage: this.workflowMeta.icon,
                title: ('Alfred ' + this.workflowMeta.name).trim(),
            };

            // Set options
            notification = Object.assign({}, defaults, notification);

            // Notify
            this.notifier.notify(notification, (err, response) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(response);
            });
        });
    }

    /**
     * Check for updates and notify the user
     *
     * @param pkg Package.json contents. When undefined, will read from file.
     *
     * @return Promise<void>
     */
    public async checkUpdates(pkg?: any): Promise<void> {
        // No need to check if we're not showing anything, duh.
        if (this.options.checkUpdates !== true ||
                (this.options.updateItem !== true && this.options.updateNotification !== true)) {
            return;
        }

        await this.updater.checkUpdates(this.options.updateSource as string, pkg)
            .then((result) => {
                if (!result) {
                    return;
                }

                // Version information
                const current = this.workflowMeta.version;
                const latest = result.version;

                if (!current) {
                    return;
                }

                // Display notification
                if (semver.gt(latest, current)) {
                    if (result.checkedOnline === true && this.options.updateNotification === true) {
                        this.notify({
                            message: `Workflow version ${latest} available. Current version: ${current}.`,
                        });
                    }
                    if (this.options.updateItem === true) {
                        // Make sure update item is only added once
                        this.items = this.items.filter((item) => {
                            return item.title !== 'Workflow update available!';
                        });

                        this.items.push({
                            title: 'Workflow update available!',
                            subtitle: `Version ${latest} is available. Current version: ${current}.`,
                            icon: {
                                path:  this.workflowMeta.icon,
                            },
                            arg: result.url,
                            variables: {
                                task: 'wfUpdate',
                            },
                        });
                    }
                }
            })
            .catch((err) => {
                if (process.env.alfred_debug === '1') {
                    console.error(err.message);
                }
                return;
            });
    }

    /**
     * Fetch url and parse JSON. Useful for REST APIs.
     *
     * @see https://www.npmjs.com/package/got
     *
     * @param url Url to request
     * @param options http.request options
     * @param ttl Cache lifetime (in seconds). Undefined to disable or false to enable indefinite caching.
     *
     * @return Promise<any>
     */
    public async fetch(url: string, options?: AxiosRequestConfig, ttl?: number | false): Promise<any> {
        const urlHash = crypto.createHash('md5').update(url).digest('hex');

        // Check cache for a hit
        if (ttl && ttl > 0) {
            if (this.cache.has(urlHash)) {
                return this.cache.get(urlHash);
            }
        }

        // Do request
        return Axios.get(url, options)
            .then((response) => {
                if (ttl && ttl > 0) {
                    this.cache.set(urlHash, response.data, ttl);
                    this.cache.commit();
                }

                return response.data;
            });
    }

    /**
     * Flush the output buffer so Alfred shows our items
     *
     * @return Promise<void>
     */
    public async feedback(): Promise<void> {
        // Check for updates
        if (this.options.checkUpdates === true) {
            await this.checkUpdates();
        }

        const output = this.output;

        // Output JSON
        console.log(JSON.stringify(output, null, '\t'));

        // Reset everything
        this.reset();
    }
}
