// @flow
'use strict';

import Conf from 'conf';
import CacheConf from 'cache-conf';

const ICON_ROOT: string = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/';

/**
 * Hugo
 */
class Hugo {
    /**
     * Output buffer
     * @type {Object}
     */
    outputBuffer: Object;

    /**
     * Refresh (rerun) interval in seconds
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {number|null}
     */
    rerun: ?number;

    /**
     * Cache
     * @see https://www.npmjs.com/package/cache-conf
     * @type {CacheConf}
     */
    cache: CacheConf;

    /**
     * Configuration
     * @see https://www.npmjs.com/package/conf
     * @type {Conf}
     */
    config: Conf;

    /**
     * Hugo constructor
     * @constructor
     */
    constructor() {
        this.outputBuffer = {};

        this.config = new Conf({
            cwd: Hugo.workflowMeta.data
        });

        this.cache = new CacheConf({
            configName: 'cache',
            cwd: Hugo.workflowMeta.cache,
            version: Hugo.workflowMeta.version
        });
    }

    /**
     * Alfred metadata
     * @return {Object}
     */
    static get alfredMeta(): Object {
        return {
            version: process.env.alfred_version,
            theme: process.env.alfred_theme,
            themeBackground: process.env.alfred_theme_background,
            themeSelectionBackground: process.env.alfred_theme_selection_background,
            themeSubtext: parseFloat(process.env.alfred_theme_subtext),
            preferences: process.env.alfred_preferences,
            preferencesLocalHash: process.env.alfred_preferences_localhash
        };
    }

    /**
     * Workflow metadata
     * @return {Object}
     */
    static get workflowMeta(): Object {
        return {
            name: process.env.alfred_workflow_name,
            version: process.env.alfred_workflow_version,
            uid: process.env.alfred_workflow_uid,
            bundleId: process.env.alfred_workflow_bundleid,
            data: process.env.alfred_workflow_data,
            cache: process.env.alfred_workflow_cache
        };
    }

    /**
     * Add item to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */
    addItem(item: Object): void {
        if (!this.outputBuffer.items) {
            this.outputBuffer.items = [];
        }

        if (item.arg && typeof item.arg === 'object') {
            let arg = item.arg.arg;
            let variables = item.arg.variables;

            item.arg = JSON.stringify({
                alfredworkflow: {
                    arg: arg,
                    variables: variables
                }
            });
        }

        this.outputBuffer.items.push(item);
    }

    /**
     * Add items to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */
    addItems(items: Array<Object>): void {
        if (!this.outputBuffer.items) {
            this.outputBuffer.items = [];
        }

        items.map(item => {
            this.addItem(item);
            return item;
        });
    }

    /**
     * Add session variable to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json
     * @type {void}
     */
    addVariable(key: string, value: string): void {
        if (!this.outputBuffer.variables) {
            this.outputBuffer.variables = {};
        }

        this.outputBuffer.variables[key] = value;
    }

    /**
     * Add session variables to output buffer
     * @see https://www.alfredapp.com/help/workflows/inputs/script-filter/json/
     * @type {void}
     */
    addVariables(variables: Object): void {
        if (!this.outputBuffer.variables) {
            this.outputBuffer.variables = variables;
            return;
        }

        this.outputBuffer.variables = Object.assign({}, this.outputBuffer.variables, variables);
    }

    /**
     * Get the full path to a built-in macOS icon
     * @type {string}
     */
    macIcon(name: string): string {
        return ICON_ROOT + name + '.icns';
    }

    /**
     * Run a callback when first script argument matches keyword. Callback will have third argument as query parameter.
     * @example node index.js myaction "my query"
     * @type {void}
     */
    action(keyword: string, callback: (query: string) => void): void {
        let query: string = process.argv[2];

        if (query && query === keyword) {
            let query: string = process.argv[3] || '';
            callback(query);
        }
    }

    /**
     * Flush the output buffer so Alfred shows our items
     * @type {void}
     */
    feedback(): void {
        if (this.rerun) {
            this.outputBuffer.rerun = this.rerun;
        }

        // Output JSON
        console.log(JSON.stringify(this.outputBuffer, null, '\t'));

        // Reset output buffer
        this.outputBuffer = {};
    }
}

module.exports = new Hugo();
