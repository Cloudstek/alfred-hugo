import { Cache } from '@cloudstek/cache';
import moment from 'moment';
import readPkg from 'read-pkg-up';
import axios from 'axios';
import semver from 'semver';

import { LatestVersion, UpdateSource } from './types';

/**
 * Hugo updater
 */
export class Updater {
    private cache: Cache;
    private interval: number | moment.Duration;

    /**
     * Hugo updater
     */
    constructor(cache: Cache, interval: number | moment.Duration) {
        this.cache = cache;
        this.interval = interval;
    }

    /**
     * Check for updates
     *
     * @param source Update source (npm or packal)
     * @param pkg Package.json contents. When undefined, will read from file.
     */
    public async checkUpdates(source: string, pkg?: any): Promise<LatestVersion | void> {
        // Check update source
        if (!UpdateSource[source as any]) {
            throw new Error('Invalid update source.');
        }

        const latest = this.cache.get(`latest_version_${source}`) as LatestVersion | undefined;
        const lastCheck = moment.unix(this.cache.get(`last_check_${source}`) as number).utc();

        // Check for updates online
        if (!latest) {
            // Check if the interval is past
            if (lastCheck.isValid() && lastCheck.add(this.interval).isSameOrAfter(moment.utc())) {
                return undefined;
            }

            switch (source.toLowerCase()) {
                case 'npm':
                    return this.checkNpm(pkg);
                case 'packal':
                    return this.checkPackal();
            }
        }

        // Got it from cache!
        latest.checkedOnline = false;

        return latest;
    }

    /**
     * Check Packal for updates
     */
    private async checkPackal(): Promise<LatestVersion | void> {
        // Bundle ID
        const bundleId = process.env.alfred_workflow_bundleid;

        if (!bundleId) {
            throw new Error('No bundle ID, not checking Packal for updates.');
        }

        // Set last check time
        this.cache.set('last_check_packal', moment.utc().unix(), this.interval);

        // Packal URL
        const searchParam: string = encodeURIComponent('site:packal.org ' + bundleId);
        const pkgUrl = `https://encrypted.google.com/search?sourceid=chrome&ie=UTF-8&q=${searchParam}&btnI`;

        const latest = await axios.get(`https://github.com/packal/repository/blob/master/${bundleId}/appcast.xml`)
            .then((response) => {
                // Get version from XML
                const versionMatches = response.data.match(/<version>(.+)<\/version>/);

                if (!versionMatches || versionMatches.length !== 2) {
                    throw new Error('No version found.');
                }

                if (!semver.valid(semver.coerce(versionMatches[1]))) {
                    throw new Error('Invalid version in response.');
                }

                return {
                    version: versionMatches[1],
                    url: pkgUrl,
                    checkedOnline: true,
                };
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    return;
                }

                throw err;
            });

        // Cache results
        this.cache.set('latest_version_packal', latest, this.interval);

        return latest;
    }

    /**
     * Check NPM for updates
     *
     * @param pkg Package.json contents. When undefined, will read from file.
     */
    private async checkNpm(pkg?: any): Promise<LatestVersion | void> {
        // Get details from package.json
        pkg = pkg || readPkg.sync().packageJson;

        if (!pkg.name || !pkg.version) {
            throw new Error('Invalid package.json.');
        }

        // Set last check time
        this.cache.set('last_check_npm', moment.utc().unix(), this.interval);

        // NPM URL
        const pkgUrl = `https://www.npmjs.com/package/${pkg.name}`;

        // Check for updates
        const latest = await axios.get(`https://registry.npmjs.org/${pkg.name}`)
            .then((response) => {
                if (!response.data['dist-tags'].latest) {
                    throw new Error('No latest version found in response.');
                }

                if (!semver.valid(semver.coerce(response.data['dist-tags'].latest))) {
                    throw new Error('Invalid version in response.');
                }

                return {
                    version: response.data['dist-tags'].latest,
                    url: pkgUrl,
                    checkedOnline: true,
                };
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    return;
                }

                throw err;
            });

        // Cache results
        this.cache.set('latest_version_npm', latest, this.interval);

        return latest;
    }
}
